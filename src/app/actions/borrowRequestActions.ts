'use server'

import { PrismaClient, RequestStatus, RequestType } from '@/generated/prisma'
import { revalidatePath } from 'next/cache'
import { canPatronBorrow } from '@/lib/systemUtils'

const prisma = new PrismaClient()

export interface CreateBorrowRequestData {
  itemId: number
  patronId: number
  requestType: RequestType
}

export interface ProcessBorrowRequestData {
  requestId: number
  librarianId: number
  status: RequestStatus
  notes?: string
}

// Create a borrow/reserve request
export async function createBorrowRequest(data: CreateBorrowRequestData) {
  try {
    // Check if patron already has a pending request for this item
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: {
        itemId: data.itemId,
        patronId: data.patronId,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return { success: false, error: 'You already have a pending request for this item' }
    }

    // Check if patron already has this item borrowed
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        itemId: data.itemId,
        patronId: data.patronId,
        isReturned: false
      }
    })

    if (existingTransaction) {
      return { success: false, error: 'You already have this item borrowed' }
    }

    // For borrow requests, check if patron can borrow more books
    if (data.requestType === 'BORROW') {
      const borrowCheck = await canPatronBorrow(data.patronId)
      if (!borrowCheck.canBorrow) {
        return { 
          success: false, 
          error: `Borrowing limit reached. Current: ${borrowCheck.currentCount}/${borrowCheck.limit}` 
        }
      }
    }

    // Create the request
    const request = await prisma.borrowRequest.create({
      data: {
        itemId: data.itemId,
        patronId: data.patronId,
        requestType: data.requestType,
        status: 'PENDING',
        requestedAt: new Date()
      },
      include: {
        item: {
          select: {
            title: true,
            author: true,
            isbn: true
          }
        },
        patron: {
          select: {
            patronFirstName: true,
            patronLastName: true,
            patronEmail: true
          }
        }
      }
    })

    revalidatePath('/patron')
    revalidatePath('/librarian')
    return { success: true, data: request }
  } catch (error) {
    console.error('Error creating borrow request:', error)
    return { success: false, error: 'Failed to create request' }
  }
}

// Get all pending requests for librarian
export async function getPendingRequests() {
  try {
    const requests = await prisma.borrowRequest.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        item: {
          select: {
            itemId: true,
            title: true,
            author: true,
            isbn: true,
            imageUrl: true,
            availableCopies: true,
            totalCopies: true
          }
        },
        patron: {
          select: {
            patronId: true,
            patronFirstName: true,
            patronLastName: true,
            patronEmail: true,
            isStudent: true,
            isFaculty: true
          }
        }
      },
      orderBy: {
        requestedAt: 'asc'
      }
    })

    return { success: true, data: requests }
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    return { success: false, error: 'Failed to fetch requests' }
  }
}

// Get patron's requests
export async function getPatronRequests(patronId: number) {
  try {
    const requests = await prisma.borrowRequest.findMany({
      where: {
        patronId: patronId
      },
      include: {
        item: {
          select: {
            itemId: true,
            title: true,
            author: true,
            isbn: true,
            imageUrl: true
          }
        },
        processedBy: {
          select: {
            librarianFirstName: true,
            librarianLastName: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    return { success: true, data: requests }
  } catch (error) {
    console.error('Error fetching patron requests:', error)
    return { success: false, error: 'Failed to fetch requests' }
  }
}

// Process a borrow request (approve/reject)
export async function processBorrowRequest(data: ProcessBorrowRequestData) {
  try {
    // Get the request
    const request = await prisma.borrowRequest.findUnique({
      where: { requestId: data.requestId },
      include: {
        item: true,
        patron: true
      }
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    if (request.status !== 'PENDING') {
      return { success: false, error: 'Request has already been processed' }
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the request
      const updatedRequest = await tx.borrowRequest.update({
        where: { requestId: data.requestId },
        data: {
          status: data.status,
          processedAt: new Date(),
          librarianId: data.librarianId,
          notes: data.notes
        },
        include: {
          item: {
            select: {
              title: true,
              author: true
            }
          },
          patron: {
            select: {
              patronFirstName: true,
              patronLastName: true,
              patronEmail: true
            }
          }
        }
      })

      // If approved and it's a BORROW request, automatically issue the book
      if (data.status === 'APPROVED' && request.requestType === 'BORROW') {
        // Check if item is available
        if (request.item.availableCopies <= 0) {
          throw new Error('Item is not available for borrowing')
        }

        // Check if patron can still borrow
        const borrowCheck = await canPatronBorrow(request.patronId)
        if (!borrowCheck.canBorrow) {
          throw new Error(`Patron has reached borrowing limit`)
        }

        // Calculate due date
        const settings = await tx.librarySettings.findFirst({
          where: { librarySettingsId: 1 }
        })
        const loanPeriodDays = settings?.loanPeriodDays || 14
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + loanPeriodDays)

        // Create transaction
        await tx.transaction.create({
          data: {
            itemId: request.itemId,
            patronId: request.patronId,
            dueDate: dueDate,
            borrowedAt: new Date(),
            isReturned: false
          }
        })

        // Update item availability
        await tx.item.update({
          where: { itemId: request.itemId },
          data: {
            availableCopies: {
              decrement: 1
            },
            status: request.item.availableCopies === 1 ? 'BORROWED' : request.item.status
          }
        })
      }

      // If approved and it's a RESERVE request, create a reservation
      if (data.status === 'APPROVED' && request.requestType === 'RESERVE') {
        // Check if reservation already exists
        const existingReservation = await tx.reservation.findFirst({
          where: {
            itemId: request.itemId,
            patronId: request.patronId
          }
        })

        if (!existingReservation) {
          await tx.reservation.create({
            data: {
              itemId: request.itemId,
              patronId: request.patronId,
              reservedAt: new Date()
            }
          })
        }
      }

      return updatedRequest
    })

    revalidatePath('/patron')
    revalidatePath('/librarian')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error processing borrow request:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to process request' }
  }
}

// Cancel a pending request
export async function cancelBorrowRequest(requestId: number, patronId: number) {
  try {
    const request = await prisma.borrowRequest.findFirst({
      where: {
        requestId: requestId,
        patronId: patronId,
        status: 'PENDING'
      }
    })

    if (!request) {
      return { success: false, error: 'Request not found or already processed' }
    }

    const updatedRequest = await prisma.borrowRequest.update({
      where: { requestId: requestId },
      data: {
        status: 'CANCELLED',
        processedAt: new Date()
      }
    })

    revalidatePath('/patron')
    return { success: true, data: updatedRequest }
  } catch (error) {
    console.error('Error canceling request:', error)
    return { success: false, error: 'Failed to cancel request' }
  }
}

// Get request statistics for dashboard
export async function getRequestStatistics() {
  try {
    const [pending, approved, rejected] = await Promise.all([
      prisma.borrowRequest.count({
        where: { status: 'PENDING' }
      }),
      prisma.borrowRequest.count({
        where: { status: 'APPROVED' }
      }),
      prisma.borrowRequest.count({
        where: { status: 'REJECTED' }
      })
    ])

    return {
      success: true,
      data: {
        pending,
        approved,
        rejected,
        total: pending + approved + rejected
      }
    }
  } catch (error) {
    console.error('Error fetching request statistics:', error)
    return { success: false, error: 'Failed to fetch statistics' }
  }
}
