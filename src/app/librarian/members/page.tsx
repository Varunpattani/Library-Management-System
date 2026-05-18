import { requireLibrarianAuth } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getMembers, getMemberStatistics } from '@/app/actions/memberManagementActions'
import MemberManagementClient from '@/app/client components/MemberManagementClient'

export default async function LibrarianMembersPage() {
  let session
  try {
    session = await requireLibrarianAuth()
  } catch (error) {
    redirect('/login')
  }

  // Fetch initial data
  const [membersResult, statsResult] = await Promise.all([
    getMembers({ page: 1, limit: 20 }),
    getMemberStatistics()
  ])

  const initialMembers = membersResult.success && membersResult.data ? membersResult.data.members : []
  const initialStats = statsResult.success && statsResult.data ? statsResult.data : undefined

  return (
    <div className="container mx-auto p-6">
      <MemberManagementClient 
        initialMembers={initialMembers}
        initialStats={initialStats}
      />
    </div>
  )
}
