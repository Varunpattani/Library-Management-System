'use client'

import { useState } from 'react'
import { Item, ItemStatus } from '@/generated/prisma'
import NewSearchBar from './NewSearchBar'
import SafeImage from '@/components/ui/safe-image'
import Link from 'next/link'
import { SessionData } from '@/lib/session'
import { createReservation } from '@/app/actions/circulationActions'
import { Button } from '@/components/ui/button'
import { Bookmark, BookOpen } from 'lucide-react'

interface PatronCatalogProps {
  initialItems: Item[]
  userSession?: SessionData
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

export default function PatronCatalog({ initialItems, userSession }: PatronCatalogProps) {
  const [filteredItems, setFilteredItems] = useState<Item[]>(initialItems)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFilteredResults = (results: Item[]) => {
    setFilteredItems(results)
  }

  const handleReserveItem = async (itemId: number) => {
    if (!userSession?.patronId) {
      setMessage({ type: 'error', text: 'Please log in to reserve items' })
      return
    }

    setIsLoading(true)
    try {
      const result = await createReservation({
        itemId,
        patronId: userSession.patronId
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Item reserved successfully!' })
        // Optionally refresh the page data here
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reserve item' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }

    // Auto-hide message after 5 seconds
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Book Catalog</h1>
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
          {userSession ? `Welcome back, ${userSession.email}` : 'Welcome to our library catalog'}
        </div>
      </div>


      <NewSearchBar 
        items={initialItems}
        onFilteredResults={handleFilteredResults}
      />

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredItems.length} of {initialItems.length} available items
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms to find what you're looking for.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.itemId} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
              <Link href={`/patron/dashboard/item/${item.itemId}`}>
                <div className="relative h-48 w-full overflow-hidden cursor-pointer">
                  <SafeImage
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-semibold text-gray-500 bg-white bg-opacity-90 px-2 py-1 rounded-full">
                      {item.itemType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/patron/dashboard/book/${item.itemId}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate cursor-pointer hover:text-blue-600">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 cursor-pointer">by {item.author}</p>
                </Link>

                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>ISBN:</strong> {item.isbn || 'N/A'}</p>
                  <p><strong>Published:</strong> {item.publicationYear || 'N/A'}</p>
                  <p><strong>Available:</strong> {item.availableCopies} of {item.totalCopies} copies</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2 mb-2">
                    <Link href={`/patron/dashboard/item/${item.itemId}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <BookOpen className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                    {item.availableCopies === 0 && userSession?.patronId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReserveItem(item.itemId)}
                        disabled={isLoading}
                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                      >
                        <Bookmark className="h-4 w-4 mr-1" />
                        Reserve
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {item.availableCopies > 0 ? (
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                        ✓ Available ({item.availableCopies} copies)
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                        ✗ Not Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
