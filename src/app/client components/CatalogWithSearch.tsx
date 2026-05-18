'use client'

import { useState } from 'react'
import { Item, ItemStatus } from '@/generated/prisma'
import NewSearchBar from './NewSearchBar'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'
import SafeImage from '@/components/ui/safe-image'
import Link from 'next/link'
import { DeleteItemButton } from './button'

interface CatalogWithSearchProps {
  initialItems: Item[]
}

// Helper to get status color
const getStatusColor = (status: ItemStatus) => {
  switch (status) {
    case ItemStatus.AVAILABLE:
      return 'bg-green-100 text-green-800'
    case ItemStatus.BORROWED:
      return 'bg-red-100 text-red-800'
    case ItemStatus.RESERVED:
      return 'bg-yellow-100 text-yellow-800'
    case ItemStatus.DAMAGED:
      return 'bg-orange-100 text-orange-800'
    case ItemStatus.LOST:
      return 'bg-gray-100 text-gray-800'
    case ItemStatus.MAINTENANCE:
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function CatalogWithSearch({ initialItems }: CatalogWithSearchProps) {
  const [filteredItems, setFilteredItems] = useState<Item[]>(initialItems)

  const handleFilteredResults = (results: Item[]) => {
    setFilteredItems(results)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Book Catalog</h1>
        <Link href={"/librarian/insertItem"}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Item
          </Button>
        </Link>
      </div>

      <NewSearchBar 
        items={initialItems}
        onFilteredResults={handleFilteredResults}
      />

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredItems.length} of {initialItems.length} items
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-1.01-5.879-2.631m15.08 0A7.962 7.962 0 0112 15c2.34 0 4.44-1.01 5.879-2.631M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms or add new items to the catalog.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.itemId} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
              <Link href={`/librarian/catalog/${item.itemId}`}>
                <div className="relative h-48 w-full overflow-hidden cursor-pointer">
                  <SafeImage
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              </Link>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {item.itemType.replace('_', ' ')}
                  </span>
                </div>

                <Link href={`/librarian/catalog/${item.itemId}`}>
                  <h3 className="text-lg font-bold text-gray-900 mt-2 truncate cursor-pointer hover:text-blue-600">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 cursor-pointer">by {item.author}</p>
                </Link>

                <div className="text-xs text-gray-500 space-y-1 mt-4">
                  <p><strong>ISBN:</strong> {item.isbn || 'N/A'}</p>
                  <p><strong>Published:</strong> {item.publicationYear || 'N/A'}</p>
                  <p><strong>Copies:</strong> {item.availableCopies} / {item.totalCopies} Available</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-3">
                  <Link href={`/librarian/catalog/${item.itemId}/editItem`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-100">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <DeleteItemButton id={item.itemId} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
