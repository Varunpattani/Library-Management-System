'use server'

import { PrismaClient } from "../../generated/prisma";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";

const prisma = new PrismaClient();

export interface FormState {
  error: string;
}

export async function loginCheck(previousState: FormState, formdata: FormData) {
    const email = formdata.get('email') as string;
    const password = formdata.get('password') as string;
    
    if (!email || !password) {
        return { error: 'Please enter both email and password.' };
    }

    let role: string = "";
    let userId: number | null = null;
    let isStudent = false;
    let isFaculty = false;

    // Check patron login
    const patron = await prisma.patron.findUnique({
        where: {
            patronEmail: email
        }
    });
    
    if (patron && patron.patronPassword === password) {
        role = patron.isStudent ? 'student' : patron.isFaculty ? 'faculty' : 'patron';
        userId = patron.patronId;
        isStudent = patron.isStudent;
        isFaculty = patron.isFaculty;
        
        // Create session for patron
        await createSession({
            userId: patron.patronId,
            patronId: patron.patronId, // for backward compatibility
            email: patron.patronEmail,
            role: role as 'student' | 'faculty' | 'patron',
            isStudent: patron.isStudent,
            isFaculty: patron.isFaculty
        });
        
        redirect('/patron/dashboard');
    }

    // Check librarian login
    if (!role) {
        const librarian = await prisma.librarian.findUnique({
            where: {
                librarianEmail: email,
            }
        });
        
        if (librarian && librarian.librarianPassword === password) {
            role = 'librarian';
            userId = librarian.librarianId;
            
            // Create session for librarian
            await createSession({
                userId: librarian.librarianId,
                librarianId: librarian.librarianId,
                email: librarian.librarianEmail,
                role: 'librarian'
            });
            
            redirect('/librarian');
        }
    }

    // Check admin login
    if (!role) {
        const admin = await prisma.admin.findUnique({
            where: {
                adminEmail: email,
            }
        });
        
        if (admin && admin.adminPassword === password) {
            role = 'admin';
            userId = admin.adminId;
            
            // Create session for admin
            await createSession({
                userId: admin.adminId,
                adminId: admin.adminId,
                email: admin.adminEmail,
                role: 'admin'
            });
            
            redirect('/admin/dashboard');
        }
    }

    return { error: 'Invalid credentials. Please try again.' };
}