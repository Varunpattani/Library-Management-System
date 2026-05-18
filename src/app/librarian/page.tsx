import { Button } from '@/components/ui/button'
import { requireLibrarianAuth } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRequestStatistics } from '@/app/actions/borrowRequestActions'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export default async function LibrarianDashboard() {
  let session
  try {
    session = await requireLibrarianAuth()
  } catch (error) {
    redirect('/login')
  }

  // Get statistics
  const requestStats = await getRequestStatistics()
  const totalBooks = await prisma.item.count()
  const activePatrons = await prisma.patron.count()
  const borrowedBooks = await prisma.transaction.count({
    where: { isReturned: false }
  })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Librarian Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.email}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">Total Books</h3>
          <p className="text-3xl font-bold text-blue-600">{totalBooks.toLocaleString()}</p>
          <p className="text-sm text-gray-500">In library collection</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">Active Members</h3>
          <p className="text-3xl font-bold text-green-600">{activePatrons}</p>
          <p className="text-sm text-gray-500">Registered patrons</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">Books Borrowed</h3>
          <p className="text-3xl font-bold text-orange-600">{borrowedBooks}</p>
          <p className="text-sm text-gray-500">Currently on loan</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border relative">
          <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-yellow-600">{requestStats.success ? requestStats.data?.pending || 0 : 0}</p>
          <p className="text-sm text-gray-500">Awaiting approval</p>
          {requestStats.success && requestStats.data?.pending > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
              {requestStats.data.pending}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4">
        <Link href="/librarian/circulation">
          <Button className="relative">
            Circulation Management
            {requestStats.success && requestStats.data?.pending > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {requestStats.data.pending}
              </span>
            )}
          </Button>
        </Link>
        <Link href="/librarian/catalog">
          <Button variant="outline">Manage Catalog</Button>
        </Link>
        <Link href="/librarian/members">
          <Button variant="outline">Manage Members</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Session Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">User ID:</span> {session.userId}
          </div>
          <div>
            <span className="font-medium">Email:</span> {session.email}
          </div>
          <div>
            <span className="font-medium">Role:</span> {session.role}
          </div>
          <div>
            <span className="font-medium">Librarian ID:</span> {session.librarianId || 'N/A'}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>Recent library activities would be displayed here...</p>
        </div>
      </div>
    </div>
  )
}
