'use server'

import { PrismaClient } from '@/generated/prisma'
import { revalidatePath } from 'next/cache'
import { calculateDueDate, calculateFine, canPatronBorrow } from '@/lib/systemUtils'

const prisma = new PrismaClient()

export interface IssueBookData {
  itemId: number
  patronId: number
  librarianId?: number
}

export interface ReturnBookData {
  transactionId: number
  librarianId?: number
}

export interface RenewBookData {
  transactionId: number
  librarianId?: number
}

export interface ReservationData {
  itemId: number
  patronId: number
}

// Issue/Borrow Book
export async function issueBook(data: IssueBookData) {
  try {
    // Check if patron can borrow more books
    const borrowCheck = await canPatronBorrow(data.patronId)
    if (!borrowCheck.canBorrow) {
      return { 
        success: false, 
        error: `Borrowing limit reached. Current: ${borrowCheck.currentCount}/${borrowCheck.limit}` 
      }
    }

    // Check if item is available
    const item = await prisma.item.findUnique({
      where: { itemId: data.itemId }
    })

    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    if (item.availableCopies <= 0) {
      return { success: false, error: 'Item is not available for borrowing' }
    }

    // Check if patron already has this item
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        itemId: data.itemId,
        patronId: data.patronId,
        isReturned: false
      }
    })

    if (existingTransaction) {
      return { success: false, error: 'Patron already has this item borrowed' }
    }

    // Calculate due date
    const dueDate = await calculateDueDate()

    // Create transaction and update item availability
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          itemId: data.itemId,
          patronId: data.patronId,
          dueDate: dueDate,
          borrowedAt: new Date(),
          isReturned: false
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

      // Update item availability
      await tx.item.update({
        where: { itemId: data.itemId },
        data: {
          availableCopies: {
            decrement: 1
          },
          status: item.availableCopies === 1 ? 'BORROWED' : item.status
        }
      })

      return transaction
    })

    revalidatePath('/librarian')
    revalidatePath('/patron')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error issuing book:', error)
    return { success: false, error: 'Failed to issue book' }
  }
}

// Return Book
export async function returnBook(data: ReturnBookData) {
  try {
    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId: data.transactionId },
      include: {
        item: true,
        patron: {
          select: {
            patronFirstName: true,
            patronLastName: true,
            patronEmail: true
          }
        }
      }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.isReturned) {
      return { success: false, error: 'Book is already returned' }
    }

    // Calculate fine if overdue
    const fine = await calculateFine(transaction.dueDate)
    const returnDate = new Date()

    // Update transaction and item availability
    const result = await prisma.$transaction(async (tx) => {
      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { transactionId: data.transactionId },
        data: {
          isReturned: true,
          returnedAt: returnDate,
          finePaid: fine > 0 ? fine : undefined
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

      // Update item availability
      await tx.item.update({
        where: { itemId: transaction.itemId },
        data: {
          availableCopies: {
            increment: 1
          },
          status: 'AVAILABLE'
        }
      })

      return updatedTransaction
    })

    revalidatePath('/librarian')
    revalidatePath('/patron')
    return { 
      success: true, 
      data: result,
      fine: fine,
      isOverdue: fine > 0
    }
  } catch (error) {
    console.error('Error returning book:', error)
    return { success: false, error: 'Failed to return book' }
  }
}

// Renew Book
export async function renewBook(data: RenewBookData) {
  try {
    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId: data.transactionId },
      include: {
        item: true,
        patron: {
          select: {
            patronFirstName: true,
            patronLastName: true,
            patronEmail: true
          }
        }
      }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.isReturned) {
      return { success: false, error: 'Cannot renew returned book' }
    }

    // Check if book is reserved by another patron
    const reservation = await prisma.reservation.findFirst({
      where: {
        itemId: transaction.itemId,
        patronId: { not: transaction.patronId }
      }
    })

    if (reservation) {
      return { success: false, error: 'Cannot renew: Book is reserved by another patron' }
    }

    // Check for outstanding fines
    const existingFine = await calculateFine(transaction.dueDate)
    if (existingFine > 0) {
      return { success: false, error: 'Cannot renew: Please pay outstanding fine first' }
    }

    // Calculate new due date
    const newDueDate = await calculateDueDate()

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { transactionId: data.transactionId },
      data: {
        dueDate: newDueDate,
        borrowedAt: new Date() // Update borrow date for renewal tracking
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

    revalidatePath('/librarian')
    revalidatePath('/patron')
    return { success: true, data: updatedTransaction }
  } catch (error) {
    console.error('Error renewing book:', error)
    return { success: false, error: 'Failed to renew book' }
  }
}

// Get Patron Borrowing Details
export async function getPatronBorrowingDetails(patronId: number) {
  try {
    const [currentBorrowings, borrowingHistory, reservations, totalFines] = await Promise.all([
      // Current borrowed books
      prisma.transaction.findMany({
        where: {
          patronId: patronId,
          isReturned: false
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
          }
        },
        orderBy: {
          borrowedAt: 'desc'
        }
      }),

      // Borrowing history
      prisma.transaction.findMany({
        where: {
          patronId: patronId,
          isReturned: true
        },
        include: {
          item: {
            select: {
              title: true,
              author: true,
              isbn: true
            }
          }
        },
        orderBy: {
          returnedAt: 'desc'
        },
        take: 20 // Limit to recent 20 records
      }),

      // Current reservations
      prisma.reservation.findMany({
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
          }
        },
        orderBy: {
          reservedAt: 'desc'
        }
      }),

      // Total fines paid
      prisma.transaction.aggregate({
        _sum: {
          finePaid: true
        },
        where: {
          patronId: patronId,
          finePaid: {
            gt: 0
          }
        }
      })
    ])

    // Calculate current fines for overdue books
    const overdueBooks = []
    let currentFines = 0

    for (const transaction of currentBorrowings) {
      const fine = await calculateFine(transaction.dueDate)
      if (fine > 0) {
        overdueBooks.push({
          ...transaction,
          fine: fine
        })
        currentFines += fine
      }
    }

    return {
      success: true,
      data: {
        currentBorrowings,
        borrowingHistory,
        reservations,
        overdueBooks,
        currentFines,
        totalFinesPaid: totalFines._sum.finePaid || 0
      }
    }
  } catch (error) {
    console.error('Error fetching patron borrowing details:', error)
    return { success: false, error: 'Failed to fetch borrowing details' }
  }
}

// Create Reservation
export async function createReservation(data: ReservationData) {
  try {
    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { itemId: data.itemId }
    })

    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    // Check if item is available (if available, no need to reserve)
    if (item.availableCopies > 0) {
      return { success: false, error: 'Item is available for immediate borrowing' }
    }

    // Check if patron already has this item reserved or borrowed
    const [existingReservation, existingTransaction] = await Promise.all([
      prisma.reservation.findFirst({
        where: {
          itemId: data.itemId,
          patronId: data.patronId
        }
      }),
      prisma.transaction.findFirst({
        where: {
          itemId: data.itemId,
          patronId: data.patronId,
          isReturned: false
        }
      })
    ])

    if (existingReservation) {
      return { success: false, error: 'You already have this item reserved' }
    }

    if (existingTransaction) {
      return { success: false, error: 'You already have this item borrowed' }
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        itemId: data.itemId,
        patronId: data.patronId,
        reservedAt: new Date()
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
    return { success: true, data: reservation }
  } catch (error) {
    console.error('Error creating reservation:', error)
    return { success: false, error: 'Failed to create reservation' }
  }
}

// Cancel Reservation
export async function cancelReservation(reservationId: number, patronId: number) {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        reservationId: reservationId,
        patronId: patronId
      }
    })

    if (!reservation) {
      return { success: false, error: 'Reservation not found' }
    }

    await prisma.reservation.delete({
      where: { reservationId: reservationId }
    })

    revalidatePath('/patron')
    return { success: true }
  } catch (error) {
    console.error('Error canceling reservation:', error)
    return { success: false, error: 'Failed to cancel reservation' }
  }
}

// Get all active transactions for librarian
export async function getActiveTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        isReturned: false
      },
      include: {
        item: {
          select: {
            title: true,
            author: true,
            isbn: true,
            imageUrl: true
          }
        },
        patron: {
          select: {
            patronFirstName: true,
            patronLastName: true,
            patronEmail: true,
            patronId: true
          }
        }
      },
      orderBy: {
        borrowedAt: 'desc'
      }
    })

    // Calculate fines for each transaction
    const transactionsWithFines = []
    for (const transaction of transactions) {
      const fine = await calculateFine(transaction.dueDate)
      transactionsWithFines.push({
        ...transaction,
        fine: fine,
        isOverdue: fine > 0
      })
    }

    return {
      success: true,
      data: transactionsWithFines
    }
  } catch (error) {
    console.error('Error fetching active transactions:', error)
    return { success: false, error: 'Failed to fetch transactions' }
  }
}

// Search patrons for circulation
export async function searchPatrons(query: string) {
  try {
    if (query.length < 2) {
      return { success: true, data: [] }
    }

    const patrons = await prisma.patron.findMany({
      where: {
        OR: [
          { patronFirstName: { contains: query, mode: 'insensitive' } },
          { patronLastName: { contains: query, mode: 'insensitive' } },
          { patronEmail: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        patronId: true,
        patronFirstName: true,
        patronLastName: true,
        patronEmail: true,
        isStudent: true,
        isFaculty: true
      },
      take: 10
    })

    return { success: true, data: patrons }
  } catch (error) {
    console.error('Error searching patrons:', error)
    return { success: false, error: 'Failed to search patrons' }
  }
}

// Pay fine
export async function payFine(transactionId: number, amount: number) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId: transactionId }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.isReturned) {
      return { success: false, error: 'Cannot pay fine for returned item' }
    }

    const currentFine = await calculateFine(transaction.dueDate)
    
    if (amount !== currentFine) {
      return { success: false, error: 'Fine amount mismatch' }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { transactionId: transactionId },
      data: {
        finePaid: amount
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
            patronLastName: true
          }
        }
      }
    })

    revalidatePath('/librarian')
    revalidatePath('/patron')
    return { success: true, data: updatedTransaction }
  } catch (error) {
    console.error('Error paying fine:', error)
    return { success: false, error: 'Failed to process fine payment' }
  }
}
