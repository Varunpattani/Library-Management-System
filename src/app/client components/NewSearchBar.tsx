'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Item } from '@/generated/prisma'

interface NewSearchBarProps {
  items: Item[]
  onFilteredResults: (filteredItems: Item[]) => void
}

export default function NewSearchBar({ items, onFilteredResults }: NewSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    
    if (!value.trim()) {
      // Show all items when search is empty
      onFilteredResults(items)
      return
    }

    const searchValue = value.toLowerCase().trim()
    
    // Filter items based on title, author, ISBN, and subject only
    const filteredItems = items.filter(item => {
      const title = item.title?.toLowerCase() || ''
      const author = item.author?.toLowerCase() || ''
      const isbn = item.isbn?.toLowerCase() || ''
      const subject = item.subject?.toLowerCase() || ''
      
      return (
        title.includes(searchValue) ||
        author.includes(searchValue) ||
        isbn.includes(searchValue) ||
        subject.includes(searchValue)
      )
    })
    
    onFilteredResults(filteredItems)
  }

  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by title, author, ISBN, or subject..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      {searchTerm && (
        <p className="mt-2 text-sm text-gray-600">
          Search results for: "{searchTerm}"
        </p>
      )}
    </div>
  )
}
