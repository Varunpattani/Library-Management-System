'use server'

import { PrismaClient } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

// Get patron by ID with related student/faculty data
async function getPatronById(patronId: number) {
    try {
        const patron = await prisma.patron.findUnique({
            where: {
                patronId: patronId
            },
            include: {
                studentProfile: true,
                facultyProfile: true
            }
        });
        return patron;
    } catch (error) {
        console.error('Error fetching patron:', error);
        return null;
    }
}

// Update patron basic information
async function updatePatronProfile(patronId: number, formData: FormData) {
    try {
        const patronFirstName = formData.get('patronFirstName') as string;
        const patronLastName = formData.get('patronLastName') as string;
        const patronEmail = formData.get('patronEmail') as string;

        await prisma.patron.update({
            where: {
                patronId: patronId
            },
            data: {
                patronFirstName,
                patronLastName,
                patronEmail
            }
        });

        revalidatePath('/patron/profile');
        return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
        console.error('Error updating patron profile:', error);
        return { success: false, message: 'Failed to update profile' };
    }
}

// Update student profile information
async function updateStudentProfile(patronId: number, formData: FormData) {
    try {
        const studentDepartment = formData.get('studentDepartment') as string;
        const studentSemester = formData.get('studentSemester') ? parseInt(formData.get('studentSemester') as string) : null;
        const studentRollNo = formData.get('studentRollNo') ? parseInt(formData.get('studentRollNo') as string) : null;
        const studentEnrollmentNumber = formData.get('studentEnrollmentNumber') ? parseInt(formData.get('studentEnrollmentNumber') as string) : null;

        // Check if student profile exists
        const existingStudent = await prisma.student.findUnique({
            where: { patronId: patronId }
        });

        if (existingStudent) {
            await prisma.student.update({
                where: { patronId: patronId },
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
                    patronId,
                    studentDepartment: studentDepartment || null,
                    studentSemester,
                    studentRollNo,
                    studentEnrollmentNumber
                }
            });
        }

        revalidatePath('/patron/profile');
        return { success: true, message: 'Student profile updated successfully' };
    } catch (error) {
        console.error('Error updating student profile:', error);
        return { success: false, message: 'Failed to update student profile' };
    }
}

// Update faculty profile information
async function updateFacultyProfile(patronId: number, formData: FormData) {
    try {
        const facultyDepartment = formData.get('facultyDepartment') as string;

        // Check if faculty profile exists
        const existingFaculty = await prisma.faculty.findUnique({
            where: { patronId: patronId }
        });

        if (existingFaculty) {
            await prisma.faculty.update({
                where: { patronId: patronId },
                data: {
                    facultyDepartment: facultyDepartment || null
                }
            });
        } else {
            await prisma.faculty.create({
                data: {
                    patronId,
                    facultyDepartment: facultyDepartment || null
                }
            });
        }

        revalidatePath('/patron/profile');
        return { success: true, message: 'Faculty profile updated successfully' };
    } catch (error) {
        console.error('Error updating faculty profile:', error);
        return { success: false, message: 'Failed to update faculty profile' };
    }
}

// Update patron type (student/faculty flags)
async function updatePatronType(patronId: number, formData: FormData) {
    try {
        const isStudent = formData.get('isStudent') === 'on';
        const isFaculty = formData.get('isFaculty') === 'on';

        await prisma.patron.update({
            where: {
                patronId: patronId
            },
            data: {
                isStudent,
                isFaculty
            }
        });

        revalidatePath('/patron/profile');
        return { success: true, message: 'Patron type updated successfully' };
    } catch (error) {
        console.error('Error updating patron type:', error);
        return { success: false, message: 'Failed to update patron type' };
    }
}

// Change patron password
async function changePatronPassword(patronId: number, formData: FormData) {
    try {
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            return { success: false, message: 'New passwords do not match' };
        }

        // In a real app, you'd verify the current password here
        // For now, we'll just update the password
        await prisma.patron.update({
            where: {
                patronId: patronId
            },
            data: {
                patronPassword: newPassword // In production, this should be hashed
            }
        });

        revalidatePath('/patron/profile');
        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        return { success: false, message: 'Failed to change password' };
    }
}

export { 
    getPatronById, 
    updatePatronProfile, 
    updateStudentProfile, 
    updateFacultyProfile, 
    updatePatronType, 
    changePatronPassword 
};
