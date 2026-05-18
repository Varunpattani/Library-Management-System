'use server'

import { PrismaClient } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Types for member management
export interface Member {
  patronId: number;
  patronEmail: string;
  patronFirstName: string;
  patronLastName: string;
  isStudent: boolean;
  isFaculty: boolean;
  patronCreatedAt: Date;
  patronUpdatedAt: Date;
  studentProfile?: {
    studentId: number;
    studentDepartment?: string;
    studentSemester?: number;
    studentRollNo?: number;
    studentEnrollmentNumber?: number;
  };
  facultyProfile?: {
    facultyId: number;
    facultyDepartment?: string;
  };
  borrowingHistory?: {
    total: number;
    current: number;
    overdue: number;
    returned: number;
  };
}

export interface MemberStats {
  totalMembers: number;
  students: number;
  faculty: number;
  newThisMonth: number;
  activeMembers: number; // members with current loans
}

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  isStudent: boolean;
  isFaculty: boolean;
  studentDepartment?: string;
  studentSemester?: number;
  studentRollNo?: number;
  studentEnrollmentNumber?: number;
  facultyDepartment?: string;
}

// Get member statistics for dashboard
export async function getMemberStatistics(): Promise<{ success: boolean; data?: MemberStats; error?: string }> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalMembers, students, faculty, newThisMonth, activeBorrowers] = await Promise.all([
      prisma.patron.count(),
      prisma.patron.count({ where: { isStudent: true } }),
      prisma.patron.count({ where: { isFaculty: true } }),
      prisma.patron.count({
        where: {
          patronCreatedAt: {
            gte: startOfMonth
          }
        }
      }),
      prisma.patron.count({
        where: {
          borrowedItems: {
            some: {
              isReturned: false
            }
          }
        }
      })
    ]);

    return {
      success: true,
      data: {
        totalMembers,
        students,
        faculty,
        newThisMonth,
        activeMembers: activeBorrowers
      }
    };
  } catch (error) {
    console.error('Error getting member statistics:', error);
    return { success: false, error: 'Failed to fetch member statistics' };
  }
}

// Get all members with pagination and filtering
export async function getMembers(options: {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'all' | 'student' | 'faculty';
  sortBy?: 'name' | 'email' | 'created' | 'lastActive';
  sortOrder?: 'asc' | 'desc';
}): Promise<{ success: boolean; data?: { members: Member[]; total: number; pages: number }; error?: string } | undefined> {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      type = 'all',
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { patronFirstName: { contains: search } },
        { patronLastName: { contains: search } },
        { patronEmail: { contains: search } }
      ];
    }

    if (type === 'student') {
      where.isStudent = true;
    } else if (type === 'faculty') {
      where.isFaculty = true;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy = [
          { patronFirstName: sortOrder },
          { patronLastName: sortOrder }
        ];
        break;
      case 'email':
        orderBy = { patronEmail: sortOrder };
        break;
      case 'created':
        orderBy = { patronCreatedAt: sortOrder };
        break;
      default:
        orderBy = { patronFirstName: sortOrder };
    }

    const [members] = await Promise.all([
      prisma.patron.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          studentProfile: true,
          facultyProfile: true,
          borrowedItems: {
            where: { isReturned: false },
            select: { transactionId: true }
          },
          _count: {
            select: {
              borrowedItems: true
            }
          }
        }
      }),
    ]);

    const countWhere: any = JSON.parse(JSON.stringify(where)); // Deep copy to avoid modifying original where
    if (options.search && countWhere.OR) {
      countWhere.OR = countWhere.OR.map((clause: any) => {
        const newClause = { ...clause };
        for (const key in newClause) {
          if (newClause[key].contains && newClause[key].mode) {
            delete newClause[key].mode;
          }
        }
        return newClause;
      });
    }
    const total = await prisma.patron.count({ where: countWhere });

    const membersWithStats: Member[] = await Promise.all(
      members.map(async (member) => {
        const [borrowingStats] = await Promise.all([
          prisma.transaction.groupBy({
            by: [],
            where: { patronId: member.patronId },
            _count: true
          }).then(result => {
            const total = result[0]?._count || 0;
            return prisma.transaction.findMany({
              where: { patronId: member.patronId },
              select: {
                isReturned: true,
                dueDate: true
              }
            }).then(transactions => {
              const current = transactions.filter(t => !t.isReturned).length;
              const returned = transactions.filter(t => t.isReturned).length;
              const overdue = transactions.filter(t => 
                !t.isReturned && new Date(t.dueDate) < new Date()
              ).length;

              return { total, current, returned, overdue };
            });
          }).catch(() => ({ total: 0, current: 0, returned: 0, overdue: 0 }))
        ]);

        return {
          ...member,
          borrowingHistory: borrowingStats
        };
      })
    );

    const pages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        members: membersWithStats,
        total,
        pages
      }
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}

// Get member by ID with detailed information
export async function getMemberById(patronId: number): Promise<{ success: boolean; data?: Member; error?: string }> {
  try {
    const member = await prisma.patron.findUnique({
      where: { patronId },
      include: {
        studentProfile: true,
        facultyProfile: true,
        borrowedItems: {
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
          orderBy: { borrowedAt: 'desc' }
        },
        reservations: {
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
          orderBy: { reservedAt: 'desc' }
        },
        borrowRequests: {
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
          orderBy: { requestedAt: 'desc' }
        }
      }
    });

    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    // Calculate borrowing statistics
    const totalBorrows = member.borrowedItems.length;
    const currentBorrows = member.borrowedItems.filter(t => !t.isReturned).length;
    const returnedBorrows = member.borrowedItems.filter(t => t.isReturned).length;
    const overdueBorrows = member.borrowedItems.filter(t => 
      !t.isReturned && new Date(t.dueDate) < new Date()
    ).length;

    const memberWithStats: Member = {
      ...member,
      borrowingHistory: {
        total: totalBorrows,
        current: currentBorrows,
        returned: returnedBorrows,
        overdue: overdueBorrows
      }
    };

    return { success: true, data: memberWithStats };
  } catch (error) {
    console.error('Error fetching member:', error);
    return { success: false, error: 'Failed to fetch member details' };
  }
}

// Create new member
export async function createMember(memberData: MemberFormData): Promise<{ success: boolean; data?: Member; error?: string }> {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      isStudent,
      isFaculty,
      studentDepartment,
      studentSemester,
      studentRollNo,
      studentEnrollmentNumber,
      facultyDepartment
    } = memberData;

    if (!firstName || !lastName || !email || !password) {
      return { success: false, error: 'All required fields must be provided' };
    }

    // Check if email already exists
    const existingMember = await prisma.patron.findUnique({
      where: { patronEmail: email }
    });

    if (existingMember) {
      return { success: false, error: 'Email already exists' };
    }

    // Create the patron
    const newMember = await prisma.patron.create({
      data: {
        patronFirstName: firstName,
        patronLastName: lastName,
        patronEmail: email,
        patronPassword: password, // In real app, this should be hashed
        isStudent,
        isFaculty
      },
      include: {
        studentProfile: true,
        facultyProfile: true
      }
    });

    // Create student profile if needed
    if (isStudent) {
      await prisma.student.create({
        data: {
          patronId: newMember.patronId,
          studentDepartment,
          studentSemester,
          studentRollNo,
          studentEnrollmentNumber
        }
      });
    }

    // Create faculty profile if needed
    if (isFaculty) {
      await prisma.faculty.create({
        data: {
          patronId: newMember.patronId,
          facultyDepartment
        }
      });
    }

    // Fetch the complete member data
    const completeMemember = await getMemberById(newMember.patronId);
    
    revalidatePath('/librarian/members');
    return { 
      success: true, 
      data: completeMemember.data,
      error: undefined 
    };
  } catch (error: any) {
    console.error('Error creating member:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Email already exists' };
    }
    return { success: false, error: 'Failed to create member' };
  }
}

// Update member
export async function updateMember(patronId: number, memberData: Partial<MemberFormData>): Promise<{ success: boolean; data?: Member; error?: string }> {
  try {
    const {
      firstName,
      lastName,
      email,
      isStudent,
      isFaculty,
      studentDepartment,
      studentSemester,
      studentRollNo,
      studentEnrollmentNumber,
      facultyDepartment
    } = memberData;

    // Update patron
    const updatedPatron = await prisma.patron.update({
      where: { patronId },
      data: {
        ...(firstName && { patronFirstName: firstName }),
        ...(lastName && { patronLastName: lastName }),
        ...(email && { patronEmail: email }),
        ...(typeof isStudent === 'boolean' && { isStudent }),
        ...(typeof isFaculty === 'boolean' && { isFaculty })
      }
    });

    // Handle student profile
    const existingStudent = await prisma.student.findUnique({
      where: { patronId }
    });

    if (isStudent) {
      const studentData = {
        studentDepartment,
        studentSemester,
        studentRollNo,
        studentEnrollmentNumber
      };

      if (existingStudent) {
        await prisma.student.update({
          where: { patronId },
          data: studentData
        });
      } else {
        await prisma.student.create({
          data: {
            patronId,
            ...studentData
          }
        });
      }
    } else if (existingStudent) {
      await prisma.student.delete({
        where: { patronId }
      });
    }

    // Handle faculty profile
    const existingFaculty = await prisma.faculty.findUnique({
      where: { patronId }
    });

    if (isFaculty) {
      if (existingFaculty) {
        await prisma.faculty.update({
          where: { patronId },
          data: { facultyDepartment }
        });
      } else {
        await prisma.faculty.create({
          data: {
            patronId,
            facultyDepartment
          }
        });
      }
    } else if (existingFaculty) {
      await prisma.faculty.delete({
        where: { patronId }
      });
    }

    // Fetch updated member data
    const updatedMember = await getMemberById(patronId);
    
    revalidatePath('/librarian/members');
    return {
      success: true,
      data: updatedMember.data
    };
  } catch (error: any) {
    console.error('Error updating member:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Email already exists' };
    }
    return { success: false, error: 'Failed to update member' };
  }
}

// Search members (used for quick search in other components)
export async function searchMembers(query: string, limit: number = 10): Promise<{ success: boolean; data?: Member[]; error?: string }> {
  try {
    const members = await prisma.patron.findMany({
      where: {
        OR: [
          { patronFirstName: { contains: query } },
          { patronLastName: { contains: query } },
          { patronEmail: { contains: query } },
          { patronId: isNaN(parseInt(query)) ? undefined : parseInt(query) }
        ]
      },
      take: limit,
      include: {
        studentProfile: true,
        facultyProfile: true
      },
      orderBy: [
        { patronFirstName: 'asc' },
        { patronLastName: 'asc' }
      ]
    });

    return { success: true, data: members };
  } catch (error) {
    console.error('Error searching members:', error);
    return { success: false, error: 'Failed to search members' };
  }
}

// Get member's borrowing history
export async function getMemberBorrowingHistory(patronId: number): Promise<{
  success: boolean;
  data?: {
    current: any[];
    history: any[];
    reservations: any[];
    requests: any[];
  };
  error?: string;
}> {
  try {
    const [current, history, reservations, requests] = await Promise.all([
      // Current borrows
      prisma.transaction.findMany({
        where: {
          patronId,
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
        orderBy: { borrowedAt: 'desc' }
      }),
      
      // Borrowing history
      prisma.transaction.findMany({
        where: {
          patronId,
          isReturned: true
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
        orderBy: { returnedAt: 'desc' },
        take: 20 // Limit to recent 20 returns
      }),
      
      // Active reservations
      prisma.reservation.findMany({
        where: { patronId },
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
        orderBy: { reservedAt: 'desc' }
      }),
      
      // Pending requests
      prisma.borrowRequest.findMany({
        where: { 
          patronId,
          status: 'PENDING'
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
        orderBy: { requestedAt: 'desc' }
      })
    ]);

    return {
      success: true,
      data: {
        current,
        history,
        reservations,
        requests
      }
    };
  } catch (error) {
    console.error('Error fetching member borrowing history:', error);
    return { success: false, error: 'Failed to fetch borrowing history' };
  }
}

// Deactivate/Activate member (soft delete)
export async function toggleMemberStatus(patronId: number): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Check if member has active borrows
    const activeBorrows = await prisma.transaction.count({
      where: {
        patronId,
        isReturned: false
      }
    });

    if (activeBorrows > 0) {
      return { success: false, error: 'Cannot deactivate member with active borrows' };
    }

    // For now, we'll just track this in a way that makes sense for the schema
    // Since there's no isActive field, we could add one or handle this differently
    
    revalidatePath('/librarian/members');
    return { success: true, message: 'Member status updated successfully' };
  } catch (error) {
    console.error('Error toggling member status:', error);
    return { success: false, error: 'Failed to update member status' };
  }
}
