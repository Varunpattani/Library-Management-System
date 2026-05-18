'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createBorrowRequest } from '@/app/actions/borrowRequestActions'
import { BookOpen, Bookmark, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BorrowRequestButtonProps {
  itemId: number
  patronId: number
  availableCopies: number
  itemTitle: string
}

export default function BorrowRequestButton({ 
  itemId, 
  patronId, 
  availableCopies, 
  itemTitle 
}: BorrowRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleRequest = async (requestType: 'BORROW' | 'RESERVE') => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await createBorrowRequest({
        itemId,
        patronId,
        requestType
      })

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: requestType === 'BORROW' 
            ? 'Borrow request submitted successfully! A librarian will review your request soon.' 
            : 'Reserve request submitted successfully! You will be notified when the item is available.'
        })
        
        // Refresh the page after 2 seconds
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit request' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-2 space-y-2">
      {availableCopies > 0 ? (
        <Button
          onClick={() => handleRequest('BORROW')}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-2" />
              Request to Borrow
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={() => handleRequest('RESERVE')}
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 mr-2" />
              Reserve Item
            </>
          )}
        </Button>
      )}

      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
