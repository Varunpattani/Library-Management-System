'use client'

import { Trash2 } from 'lucide-react'
import { deleteItem } from '@/app/actions/itemActions'

interface DeleteItemFormProps {
  itemId: number
  itemTitle: string
}

export default function DeleteItemForm({ itemId, itemTitle }: DeleteItemFormProps) {
  return (
    <form 
      action={deleteItem.bind(null, { id: itemId })}
      onSubmit={(e) => {
        if (!confirm(`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`)) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete Item</span>
      </button>
    </form>
  )
}
