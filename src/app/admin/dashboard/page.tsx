import React from 'react'
import { requireAdminAuth } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  let session
  try {
    session = await requireAdminAuth()
  } catch (error) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.email}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-sm text-gray-500">All system users</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">Total Books</h3>
          <p className="text-3xl font-bold text-green-600">2,456</p>
          <p className="text-sm text-gray-500">In catalog</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">Active Librarians</h3>
          <p className="text-3xl font-bold text-orange-600">12</p>
          <p className="text-sm text-gray-500">Currently managing</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          <p className="text-3xl font-bold text-green-600">Online</p>
          <p className="text-sm text-gray-500">All systems operational</p>
        </div>
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
            <span className="font-medium">Admin ID:</span> {session.adminId || 'N/A'}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent System Activities</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>System logs and recent administrative activities would be displayed here...</p>
        </div>
      </div>
    </div>
  )
}
