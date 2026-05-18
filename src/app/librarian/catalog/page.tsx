import { PrismaClient, Item } from '@/generated/prisma';
import CatalogWithSearch from '@/app/client components/CatalogWithSearch';

const prisma = new PrismaClient();

export default async function LibrarianCatalogPage() {
  const data: Item[] = await prisma.item.findMany({
    orderBy: {
      title: 'asc'
    }
  });

  return (
    <CatalogWithSearch initialItems={data} />
  )
}
