import { requirePatronAuth } from '@/lib/session'
import { redirect } from 'next/navigation'
import PatronAccountClient from '@/app/client components/PatronAccountClient'

export default async function PatronAccountPage() {
  let session
  try {
    session = await requirePatronAuth()
  } catch (error) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-6">
      <PatronAccountClient 
        patronId={session.patronId!} 
        patronName={`${session.firstName || ''} ${session.lastName || ''}`.trim() || session.email}
      />
    </div>
  )
}
