import { requireLibrarianAuth } from '@/lib/session'
import { redirect } from 'next/navigation'
import CirculationManagementClient from '@/app/client components/CirculationManagementClient'

export default async function CirculationPage() {
  let session
  try {
    session = await requireLibrarianAuth()
  } catch (error) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-6">
      <CirculationManagementClient librarianId={session.librarianId} />
    </div>
  )
}
