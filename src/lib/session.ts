import { cookies } from 'next/headers';

export interface SessionData {
  userId: number;
  email: string;
  role: 'student' | 'faculty' | 'patron' | 'librarian' | 'admin';
  isStudent?: boolean;
  isFaculty?: boolean;
  // For backward compatibility
  patronId?: number;
  librarianId?: number;
  adminId?: number;
}

export async function createSession(sessionData: SessionData) {
  const cookieStore = await cookies();
  
  // Store session data in cookies (in production, use encrypted JWT)
  cookieStore.set('session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
}

export async function requirePatronAuth(): Promise<SessionData> {
  const session = await requireAuth();
  
  if (session.role !== 'student' && session.role !== 'faculty') {
    throw new Error('Patron authentication required');
  }
  
  return session;
}

export async function requireLibrarianAuth(): Promise<SessionData> {
  const session = await requireAuth();
  
  if (session.role !== 'librarian') {
    throw new Error('Librarian authentication required');
  }
  
  return session;
}

export async function requireAdminAuth(): Promise<SessionData> {
  const session = await requireAuth();
  
  if (session.role !== 'admin') {
    throw new Error('Admin authentication required');
  }
  
  return session;
}

export async function requireRoleAuth(allowedRoles: string[]): Promise<SessionData> {
  const session = await requireAuth();
  
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }
  
  return session;
}
