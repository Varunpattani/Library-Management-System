import { PrismaClient, Item } from '@/generated/prisma';
import PatronCatalog from '@/app/client components/PatronCatalog';
import { requirePatronAuth } from '@/lib/session';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function PatronDashboardPage() {
  let session
  try {
    session = await requirePatronAuth()
  } catch (error) {
    redirect('/login')
  }

  // Only get visible items for patrons
  const data: Item[] = await prisma.item.findMany({
    where: {
      isVisible: true
    },
    orderBy: {
      title: 'asc'
    }
  });

  return (
    <PatronCatalog initialItems={data} userSession={session} />
  )
}
