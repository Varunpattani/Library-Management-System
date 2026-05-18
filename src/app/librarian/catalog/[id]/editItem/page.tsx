import UpdateItemForm from "@/app/client components/updateItemForm";
import { PrismaClient } from "@/generated/prisma"; 
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

const prisma = new PrismaClient();

export default async function UpdateItemPage({ params }: { params: { id: string } }){
    const resolvedParams = await params;
    const data = await prisma.item.findUnique({
    where: {
      itemId: parseInt(resolvedParams.id),
    },
  });

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900">Item Not Found</h1>
            <p className="text-gray-600 mt-2">The item you're looking for doesn't exist.</p>
            <Link
              href="/librarian/catalog"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/librarian/catalog/${data.itemId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Item Details
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
                <p className="text-gray-600">Update the details for "{data.title}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <UpdateItemForm data={data}/>
      </div>
    </div>
  );
}
