'use server'

import { PrismaClient } from '@/generated/prisma'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export interface LibrarySettingsData {
  borrowingLimit: number
  loanPeriodDays: number
  finePerDay: number
  updatedByAdminId?: number
}

export async function getLibrarySettings() {
  try {
    const settings = await prisma.librarySettings.findFirst({
      include: {
        updatedBy: {
          select: {
            adminFirstName: true,
            adminLastName: true,
            adminEmail: true
          }
        }
      }
    })
    
    // If no settings exist, create default ones
    if (!settings) {
      const defaultSettings = await prisma.librarySettings.create({
        data: {
          librarySettingsId: 1,
          borrowingLimit: 5,
          loanPeriodDays: 14,
          finePerDay: 1.0
        },
        include: {
          updatedBy: {
            select: {
              adminFirstName: true,
              adminLastName: true,
              adminEmail: true
            }
          }
        }
      })
      return { success: true, data: defaultSettings }
    }
    
    return { success: true, data: settings }
  } catch (error) {
    console.error('Error fetching library settings:', error)
    return { success: false, error: 'Failed to fetch library settings' }
  }
}

export async function updateLibrarySettings(settingsData: LibrarySettingsData) {
  try {
    // Validate input data
    if (settingsData.borrowingLimit <= 0 || settingsData.borrowingLimit > 50) {
      return { success: false, error: 'Borrowing limit must be between 1 and 50' }
    }
    
    if (settingsData.loanPeriodDays <= 0 || settingsData.loanPeriodDays > 365) {
      return { success: false, error: 'Loan period must be between 1 and 365 days' }
    }
    
    if (settingsData.finePerDay < 0 || settingsData.finePerDay > 100) {
      return { success: false, error: 'Fine per day must be between 0 and 100' }
    }

    const updatedSettings = await prisma.librarySettings.upsert({
      where: { librarySettingsId: 1 },
      update: {
        borrowingLimit: settingsData.borrowingLimit,
        loanPeriodDays: settingsData.loanPeriodDays,
        finePerDay: settingsData.finePerDay,
        updatedByAdminId: settingsData.updatedByAdminId
      },
      create: {
        librarySettingsId: 1,
        borrowingLimit: settingsData.borrowingLimit,
        loanPeriodDays: settingsData.loanPeriodDays,
        finePerDay: settingsData.finePerDay,
        updatedByAdminId: settingsData.updatedByAdminId
      },
      include: {
        updatedBy: {
          select: {
            adminFirstName: true,
            adminLastName: true,
            adminEmail: true
          }
        }
      }
    })

    revalidatePath('/admin/system')
    return { success: true, data: updatedSettings }
  } catch (error) {
    console.error('Error updating library settings:', error)
    return { success: false, error: 'Failed to update library settings' }
  }
}

export async function resetLibrarySettings(adminId?: number) {
  try {
    const resetSettings = await prisma.librarySettings.upsert({
      where: { librarySettingsId: 1 },
      update: {
        borrowingLimit: 5,
        loanPeriodDays: 14,
        finePerDay: 1.0,
        updatedByAdminId: adminId
      },
      create: {
        librarySettingsId: 1,
        borrowingLimit: 5,
        loanPeriodDays: 14,
        finePerDay: 1.0,
        updatedByAdminId: adminId
      },
      include: {
        updatedBy: {
          select: {
            adminFirstName: true,
            adminLastName: true,
            adminEmail: true
          }
        }
      }
    })

    revalidatePath('/admin/system')
    return { success: true, data: resetSettings }
  } catch (error) {
    console.error('Error resetting library settings:', error)
    return { success: false, error: 'Failed to reset library settings' }
  }
}

export async function getSystemStatistics() {
  try {
    const [
      totalPatrons,
      totalItems,
      totalBorrowedItems,
      totalOverdueItems,
      totalFinesCollected
    ] = await Promise.all([
      prisma.patron.count(),
      prisma.item.count({ where: { isVisible: true } }),
      prisma.transaction.count({ where: { isReturned: false } }),
      prisma.transaction.count({
        where: {
          isReturned: false,
          dueDate: {
            lt: new Date()
          }
        }
      }),
      prisma.transaction.aggregate({
        _sum: {
          finePaid: true
        },
        where: {
          finePaid: {
            gt: 0
          }
        }
      })
    ])

    return {
      success: true,
      data: {
        totalPatrons,
        totalItems,
        totalBorrowedItems,
        totalOverdueItems,
        totalFinesCollected: totalFinesCollected._sum.finePaid || 0
      }
    }
  } catch (error) {
    console.error('Error fetching system statistics:', error)
    return { success: false, error: 'Failed to fetch system statistics' }
  }
}
