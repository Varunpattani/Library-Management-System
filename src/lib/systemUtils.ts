import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export interface SystemSettings {
  borrowingLimit: number
  loanPeriodDays: number
  finePerDay: number
}

/**
 * Get current system settings with caching
 */
export async function getCurrentSettings(): Promise<SystemSettings> {
  try {
    const settings = await prisma.librarySettings.findFirst()
    
    if (!settings) {
      // Return default settings if none exist
      return {
        borrowingLimit: 5,
        loanPeriodDays: 14,
        finePerDay: 1.0
      }
    }
    
    return {
      borrowingLimit: settings.borrowingLimit,
      loanPeriodDays: settings.loanPeriodDays,
      finePerDay: settings.finePerDay
    }
  } catch (error) {
    console.error('Error fetching system settings:', error)
    // Return defaults on error
    return {
      borrowingLimit: 5,
      loanPeriodDays: 14,
      finePerDay: 1.0
    }
  }
}

/**
 * Calculate due date based on current loan period settings
 */
export async function calculateDueDate(borrowDate?: Date): Promise<Date> {
  const settings = await getCurrentSettings()
  const baseDate = borrowDate || new Date()
  const dueDate = new Date(baseDate)
  dueDate.setDate(dueDate.getDate() + settings.loanPeriodDays)
  return dueDate
}

/**
 * Calculate fine amount for overdue items
 */
export async function calculateFine(dueDate: Date, returnDate?: Date): Promise<number> {
  const settings = await getCurrentSettings()
  const checkDate = returnDate || new Date()
  
  if (checkDate <= dueDate) {
    return 0
  }
  
  const overdueDays = Math.ceil((checkDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  return overdueDays * settings.finePerDay
}

/**
 * Check if a patron can borrow more items based on current borrowing limit
 */
export async function canPatronBorrow(patronId: number): Promise<{ canBorrow: boolean, currentCount: number, limit: number }> {
  try {
    const settings = await getCurrentSettings()
    
    const currentBorrowedCount = await prisma.transaction.count({
      where: {
        patronId: patronId,
        isReturned: false
      }
    })
    
    return {
      canBorrow: currentBorrowedCount < settings.borrowingLimit,
      currentCount: currentBorrowedCount,
      limit: settings.borrowingLimit
    }
  } catch (error) {
    console.error('Error checking patron borrow eligibility:', error)
    return {
      canBorrow: false,
      currentCount: 0,
      limit: 5
    }
  }
}

/**
 * Get borrowing statistics for a patron
 */
export async function getPatronBorrowingStats(patronId: number) {
  try {
    const settings = await getCurrentSettings()
    
    const [currentBorrowedCount, totalBorrowedCount, overdueCount, totalFines] = await Promise.all([
      prisma.transaction.count({
        where: {
          patronId: patronId,
          isReturned: false
        }
      }),
      prisma.transaction.count({
        where: {
          patronId: patronId
        }
      }),
      prisma.transaction.count({
        where: {
          patronId: patronId,
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
          patronId: patronId,
          finePaid: {
            gt: 0
          }
        }
      })
    ])
    
    return {
      currentBorrowed: currentBorrowedCount,
      totalBorrowed: totalBorrowedCount,
      overdue: overdueCount,
      totalFinesPaid: totalFines._sum.finePaid || 0,
      borrowingLimit: settings.borrowingLimit,
      canBorrowMore: currentBorrowedCount < settings.borrowingLimit,
      remainingBorrowLimit: Math.max(0, settings.borrowingLimit - currentBorrowedCount)
    }
  } catch (error) {
    console.error('Error fetching patron borrowing stats:', error)
    return null
  }
}

/**
 * Validate system settings
 */
export function validateSystemSettings(settings: Partial<SystemSettings>): { isValid: boolean, errors: string[] } {
  const errors: string[] = []
  
  if (settings.borrowingLimit !== undefined) {
    if (settings.borrowingLimit <= 0 || settings.borrowingLimit > 50) {
      errors.push('Borrowing limit must be between 1 and 50')
    }
  }
  
  if (settings.loanPeriodDays !== undefined) {
    if (settings.loanPeriodDays <= 0 || settings.loanPeriodDays > 365) {
      errors.push('Loan period must be between 1 and 365 days')
    }
  }
  
  if (settings.finePerDay !== undefined) {
    if (settings.finePerDay < 0 || settings.finePerDay > 100) {
      errors.push('Fine per day must be between 0 and 100')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
