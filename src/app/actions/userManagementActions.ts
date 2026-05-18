'use server'

import { PrismaClient } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Types for our user management
export type UserRole = 'admin' | 'librarian' | 'patron';
export type UserAccount = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  isStudent?: boolean;
  isFaculty?: boolean;
};

// Get all users with their roles
export async function getAllUsers(): Promise<UserAccount[]> {
  try {
    const [admins, librarians, patrons] = await Promise.all([
      prisma.admin.findMany({
        select: {
          adminId: true,
          adminEmail: true,
          adminFirstName: true,
          adminLastName: true,
        }
      }),
      prisma.librarian.findMany({
        select: {
          librarianId: true,
          librarianEmail: true,
          librarianFirstName: true,
          librarianLastName: true,
        }
      }),
      prisma.patron.findMany({
        select: {
          patronId: true,
          patronEmail: true,
          patronFirstName: true,
          patronLastName: true,
          patronCreatedAt: true,
          isStudent: true,
          isFaculty: true,
        }
      })
    ]);

    const users: UserAccount[] = [
      ...admins.map(admin => ({
        id: admin.adminId,
        email: admin.adminEmail,
        firstName: admin.adminFirstName,
        lastName: admin.adminLastName,
        role: 'admin' as UserRole,
        createdAt: new Date(), // Admins don't have createdAt in schema
      })),
      ...librarians.map(librarian => ({
        id: librarian.librarianId,
        email: librarian.librarianEmail,
        firstName: librarian.librarianFirstName,
        lastName: librarian.librarianLastName,
        role: 'librarian' as UserRole,
        createdAt: new Date(), // Librarians don't have createdAt in schema
      })),
      ...patrons.map(patron => ({
        id: patron.patronId,
        email: patron.patronEmail,
        firstName: patron.patronFirstName,
        lastName: patron.patronLastName,
        role: 'patron' as UserRole,
        createdAt: patron.patronCreatedAt,
        isStudent: patron.isStudent,
        isFaculty: patron.isFaculty,
      }))
    ];

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

// Get user by ID and role
export async function getUserById(id: number, role: UserRole) {
  try {
    switch (role) {
      case 'admin':
        return await prisma.admin.findUnique({
          where: { adminId: id }
        });
      case 'librarian':
        return await prisma.librarian.findUnique({
          where: { librarianId: id }
        });
      case 'patron':
        return await prisma.patron.findUnique({
          where: { patronId: id },
          include: {
            studentProfile: true,
            facultyProfile: true
          }
        });
      default:
        throw new Error('Invalid role');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Create new user
export async function createUser(formData: FormData) {
  try {
    const role = formData.get('role') as UserRole;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!role || !firstName || !lastName || !email || !password) {
      return { success: false, message: 'All fields are required' };
    }

    let newUser;
    switch (role) {
      case 'admin':
        newUser = await prisma.admin.create({
          data: {
            adminFirstName: firstName,
            adminLastName: lastName,
            adminEmail: email,
            adminPassword: password,
          }
        });
        break;
      case 'librarian':
        newUser = await prisma.librarian.create({
          data: {
            librarianFirstName: firstName,
            librarianLastName: lastName,
            librarianEmail: email,
            librarianPassword: password,
          }
        });
        break;
      case 'patron':
        const isStudent = formData.get('isStudent') === 'on';
        const isFaculty = formData.get('isFaculty') === 'on';
        
        newUser = await prisma.patron.create({
          data: {
            patronFirstName: firstName,
            patronLastName: lastName,
            patronEmail: email,
            patronPassword: password,
            isStudent,
            isFaculty,
          }
        });

        // Create student profile if needed
        if (isStudent) {
          const studentDepartment = formData.get('studentDepartment') as string;
          const studentSemester = formData.get('studentSemester') ? parseInt(formData.get('studentSemester') as string) : null;
          const studentRollNo = formData.get('studentRollNo') ? parseInt(formData.get('studentRollNo') as string) : null;
          const studentEnrollmentNumber = formData.get('studentEnrollmentNumber') ? parseInt(formData.get('studentEnrollmentNumber') as string) : null;

          await prisma.student.create({
            data: {
              patronId: newUser.patronId,
              studentDepartment: studentDepartment || null,
              studentSemester,
              studentRollNo,
              studentEnrollmentNumber
            }
          });
        }

        // Create faculty profile if needed
        if (isFaculty) {
          const facultyDepartment = formData.get('facultyDepartment') as string;
          
          await prisma.faculty.create({
            data: {
              patronId: newUser.patronId,
              facultyDepartment: facultyDepartment || null
            }
          });
        }
        break;
      default:
        return { success: false, message: 'Invalid role' };
    }

    revalidatePath('/admin/users');
    return { success: true, message: `${role} account created successfully` };
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return { success: false, message: 'Email already exists' };
    }
    return { success: false, message: 'Failed to create user account' };
  }
}

// Update user
export async function updateUser(id: number, role: UserRole, formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;

    if (!firstName || !lastName || !email) {
      return { success: false, message: 'All fields are required' };
    }

    switch (role) {
      case 'admin':
        await prisma.admin.update({
          where: { adminId: id },
          data: {
            adminFirstName: firstName,
            adminLastName: lastName,
            adminEmail: email,
          }
        });
        break;
      case 'librarian':
        await prisma.librarian.update({
          where: { librarianId: id },
          data: {
            librarianFirstName: firstName,
            librarianLastName: lastName,
            librarianEmail: email,
          }
        });
        break;
      case 'patron':
        const isStudent = formData.get('isStudent') === 'on';
        const isFaculty = formData.get('isFaculty') === 'on';

        await prisma.patron.update({
          where: { patronId: id },
          data: {
            patronFirstName: firstName,
            patronLastName: lastName,
            patronEmail: email,
            isStudent,
            isFaculty,
          }
        });

        // Handle student profile
        const existingStudent = await prisma.student.findUnique({
          where: { patronId: id }
        });

        if (isStudent) {
          const studentDepartment = formData.get('studentDepartment') as string;
          const studentSemester = formData.get('studentSemester') ? parseInt(formData.get('studentSemester') as string) : null;
          const studentRollNo = formData.get('studentRollNo') ? parseInt(formData.get('studentRollNo') as string) : null;
          const studentEnrollmentNumber = formData.get('studentEnrollmentNumber') ? parseInt(formData.get('studentEnrollmentNumber') as string) : null;

          if (existingStudent) {
            await prisma.student.update({
              where: { patronId: id },
              data: {
                studentDepartment: studentDepartment || null,
                studentSemester,
                studentRollNo,
                studentEnrollmentNumber
              }
            });
          } else {
            await prisma.student.create({
              data: {
                patronId: id,
                studentDepartment: studentDepartment || null,
                studentSemester,
                studentRollNo,
                studentEnrollmentNumber
              }
            });
          }
        } else if (existingStudent) {
          await prisma.student.delete({
            where: { patronId: id }
          });
        }

        // Handle faculty profile
        const existingFaculty = await prisma.faculty.findUnique({
          where: { patronId: id }
        });

        if (isFaculty) {
          const facultyDepartment = formData.get('facultyDepartment') as string;

          if (existingFaculty) {
            await prisma.faculty.update({
              where: { patronId: id },
              data: {
                facultyDepartment: facultyDepartment || null
              }
            });
          } else {
            await prisma.faculty.create({
              data: {
                patronId: id,
                facultyDepartment: facultyDepartment || null
              }
            });
          }
        } else if (existingFaculty) {
          await prisma.faculty.delete({
            where: { patronId: id }
          });
        }
        break;
      default:
        return { success: false, message: 'Invalid role' };
    }

    revalidatePath('/admin/users');
    return { success: true, message: 'User updated successfully' };
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
      return { success: false, message: 'Email already exists' };
    }
    return { success: false, message: 'Failed to update user' };
  }
}

// Delete user
export async function deleteUser(id: number, role: UserRole) {
  try {
    switch (role) {
      case 'admin':
        await prisma.admin.delete({
          where: { adminId: id }
        });
        break;
      case 'librarian':
        await prisma.librarian.delete({
          where: { librarianId: id }
        });
        break;
      case 'patron':
        // Delete related records first due to foreign key constraints
        await prisma.student.deleteMany({
          where: { patronId: id }
        });
        await prisma.faculty.deleteMany({
          where: { patronId: id }
        });
        await prisma.transaction.deleteMany({
          where: { patronId: id }
        });
        await prisma.reservation.deleteMany({
          where: { patronId: id }
        });
        await prisma.patron.delete({
          where: { patronId: id }
        });
        break;
      default:
        return { success: false, message: 'Invalid role' };
    }

    revalidatePath('/admin/users');
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user' };
  }
}

// Change user password
export async function changeUserPassword(id: number, role: UserRole, newPassword: string) {
  try {
    switch (role) {
      case 'admin':
        await prisma.admin.update({
          where: { adminId: id },
          data: { adminPassword: newPassword }
        });
        break;
      case 'librarian':
        await prisma.librarian.update({
          where: { librarianId: id },
          data: { librarianPassword: newPassword }
        });
        break;
      case 'patron':
        await prisma.patron.update({
          where: { patronId: id },
          data: { patronPassword: newPassword }
        });
        break;
      default:
        return { success: false, message: 'Invalid role' };
    }

    revalidatePath('/admin/users');
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: 'Failed to change password' };
  }
}
