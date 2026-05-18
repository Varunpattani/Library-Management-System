import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // If no session and trying to access protected routes, redirect to login
  if (!sessionCookie && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/librarian') ||
    pathname.startsWith('/patron')
  )) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If session exists, check role-based access
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value)
      
      // Admin routes - only admins allowed
      if (pathname.startsWith('/admin') && session.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      // Librarian routes - only librarians allowed
      if (pathname.startsWith('/librarian') && session.role !== 'librarian') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      // Patron routes - students, faculty, and patrons allowed
      if (pathname.startsWith('/patron') && 
          !['student', 'faculty', 'patron'].includes(session.role)) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Let the layout files handle specific routing within their sections
      // Only handle basic access control here

    } catch (error) {
      // Invalid session, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  // If logged in and trying to access login page, redirect to appropriate dashboard
  if (sessionCookie && pathname === '/login') {
    try {
      const session = JSON.parse(sessionCookie.value)
      
      switch (session.role) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        case 'librarian':
          return NextResponse.redirect(new URL('/librarian', request.url))
        case 'student':
        case 'faculty':
        case 'patron':
          return NextResponse.redirect(new URL('/patron/dashboard', request.url))
      }
    } catch (error) {
      // Invalid session, clear it
      const response = NextResponse.next()
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/librarian/:path*', 
    '/patron/:path*',
    '/login'
  ]
}
