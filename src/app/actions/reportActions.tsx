'use server'

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Dashboard overview statistics
export async function getDashboardStats() {
    try {
        const [
            totalUsers,
            totalItems,
            totalActiveTransactions,
            totalOverdueTransactions,
            totalLibrarians,
            totalStudents,
            totalFaculty
        ] = await Promise.all([
            prisma.patron.count(),
            prisma.item.count({ where: { isVisible: true } }),
            prisma.transaction.count({ where: { isReturned: false } }),
            prisma.transaction.count({ 
                where: { 
                    isReturned: false, 
                    dueDate: { lt: new Date() } 
                } 
            }),
            prisma.librarian.count(),
            prisma.patron.count({ where: { isStudent: true } }),
            prisma.patron.count({ where: { isFaculty: true } })
        ]);

        return {
            totalUsers,
            totalItems,
            totalActiveTransactions,
            totalOverdueTransactions,
            totalLibrarians,
            totalStudents,
            totalFaculty
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error('Failed to fetch dashboard statistics');
    }
}

// User registration statistics by month
export async function getUserRegistrationStats() {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const registrations = await prisma.patron.findMany({
            where: {
                patronCreatedAt: {
                    gte: sixMonthsAgo
                }
            },
            select: {
                patronCreatedAt: true,
                isStudent: true,
                isFaculty: true
            },
            orderBy: {
                patronCreatedAt: 'desc'
            }
        });

        return registrations;
    } catch (error) {
        console.error('Error fetching user registration stats:', error);
        throw new Error('Failed to fetch user registration statistics');
    }
}

// Circulation statistics
export async function getCirculationStats() {
    try {
        const [
            totalBorrows,
            totalReturns,
            activeLoans,
            overdueLoans,
            totalReservations,
            pendingRequests
        ] = await Promise.all([
            prisma.transaction.count(),
            prisma.transaction.count({ where: { isReturned: true } }),
            prisma.transaction.count({ where: { isReturned: false } }),
            prisma.transaction.count({ 
                where: { 
                    isReturned: false, 
                    dueDate: { lt: new Date() } 
                } 
            }),
            prisma.reservation.count(),
            prisma.borrowRequest.count({ where: { status: 'PENDING' } })
        ]);

        return {
            totalBorrows,
            totalReturns,
            activeLoans,
            overdueLoans,
            totalReservations,
            pendingRequests
        };
    } catch (error) {
        console.error('Error fetching circulation stats:', error);
        throw new Error('Failed to fetch circulation statistics');
    }
}

// Item statistics
export async function getItemStats() {
    try {
        const [
            totalItems,
            availableItems,
            borrowedItems,
            itemsByType,
            itemsByStatus
        ] = await Promise.all([
            prisma.item.count({ where: { isVisible: true } }),
            prisma.item.count({ where: { status: 'AVAILABLE', isVisible: true } }),
            prisma.item.count({ where: { status: 'BORROWED', isVisible: true } }),
            prisma.item.groupBy({
                by: ['itemType'],
                _count: true,
                where: { isVisible: true }
            }),
            prisma.item.groupBy({
                by: ['status'],
                _count: true,
                where: { isVisible: true }
            })
        ]);

        return {
            totalItems,
            availableItems,
            borrowedItems,
            itemsByType,
            itemsByStatus
        };
    } catch (error) {
        console.error('Error fetching item stats:', error);
        throw new Error('Failed to fetch item statistics');
    }
}

// Overdue items report
export async function getOverdueItems() {
    try {
        const overdueItems = await prisma.transaction.findMany({
            where: {
                isReturned: false,
                dueDate: {
                    lt: new Date()
                }
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
                        patronEmail: true,
                        studentProfile: {
                            select: {
                                studentRollNo: true,
                                studentEnrollmentNumber: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        return overdueItems;
    } catch (error) {
        console.error('Error fetching overdue items:', error);
        throw new Error('Failed to fetch overdue items');
    }
}

// Popular items report
export async function getPopularItems() {
    try {
        const popularItems = await prisma.item.findMany({
            include: {
                transactions: {
                    select: {
                        transactionId: true
                    }
                },
                _count: {
                    select: {
                        transactions: true,
                        reservations: true
                    }
                }
            },
            orderBy: {
                transactions: {
                    _count: 'desc'
                }
            },
            take: 20,
            where: { isVisible: true }
        });

        return popularItems;
    } catch (error) {
        console.error('Error fetching popular items:', error);
        throw new Error('Failed to fetch popular items');
    }
}

// Financial report
export async function getFinancialReport() {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                finePaid: {
                    gt: 0
                }
            },
            include: {
                item: {
                    select: {
                        title: true,
                        price: true
                    }
                },
                patron: {
                    select: {
                        patronFirstName: true,
                        patronLastName: true,
                        patronEmail: true
                    }
                }
            },
            orderBy: {
                borrowedAt: 'desc'
            }
        });

        const totalFinesCollected = transactions.reduce((sum, t) => sum + (t.finePaid || 0), 0);
        const totalBookValue = await prisma.item.aggregate({
            _sum: {
                price: true
            },
            where: { isVisible: true }
        });

        return {
            transactions,
            totalFinesCollected,
            totalBookValue: totalBookValue._sum.price || 0
        };
    } catch (error) {
        console.error('Error fetching financial report:', error);
        throw new Error('Failed to fetch financial report');
    }
}

// Recent transactions
export async function getRecentTransactions() {
    try {
        const recentTransactions = await prisma.transaction.findMany({
            include: {
                item: {
                    select: {
                        title: true,
                        author: true,
                        itemType: true
                    }
                },
                patron: {
                    select: {
                        patronFirstName: true,
                        patronLastName: true,
                        patronEmail: true
                    }
                }
            },
            orderBy: {
                borrowedAt: 'desc'
            },
            take: 50
        });

        return recentTransactions;
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        throw new Error('Failed to fetch recent transactions');
    }
}

// Active users report
export async function getActiveUsers() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await prisma.patron.findMany({
            include: {
                borrowedItems: {
                    where: {
                        borrowedAt: {
                            gte: thirtyDaysAgo
                        }
                    }
                },
                borrowRequests: {
                    where: {
                        requestedAt: {
                            gte: thirtyDaysAgo
                        }
                    }
                },
                reservations: {
                    where: {
                        reservedAt: {
                            gte: thirtyDaysAgo
                        }
                    }
                },
                studentProfile: true,
                facultyProfile: true,
                _count: {
                    select: {
                        borrowedItems: true,
                        borrowRequests: true,
                        reservations: true
                    }
                }
            },
            orderBy: {
                borrowedItems: {
                    _count: 'desc'
                }
            }
        });

        // Filter users with activity in the last 30 days
        const usersWithActivity = activeUsers.filter(user => 
            user.borrowedItems.length > 0 || 
            user.borrowRequests.length > 0 || 
            user.reservations.length > 0
        );

        return usersWithActivity;
    } catch (error) {
        console.error('Error fetching active users:', error);
        throw new Error('Failed to fetch active users');
    }
}
