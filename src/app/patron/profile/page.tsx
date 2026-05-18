import { requirePatronAuth } from '@/lib/session';
import { redirect } from 'next/navigation';
import PatronProfileClient from '@/app/client components/PatronProfileClient';

export default async function PatronProfilePage() {
  let session;
  
  try {
    session = await requirePatronAuth();
  } catch (error) {
    redirect('/login');
  }
  
  // If patronId is not available, use userId as fallback
  const patronId = session.patronId || session.userId;
  
  return <PatronProfileClient patronId={patronId} />;
}
