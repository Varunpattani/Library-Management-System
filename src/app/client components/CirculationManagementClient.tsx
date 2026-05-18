'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  issueBook, 
  returnBook, 
  renewBook, 
  getActiveTransactions, 
  searchPatrons,
  payFine,
  type IssueBookData,
  type ReturnBookData,
  type RenewBookData
} from '@/app/actions/circulationActions'
import {
  getPendingRequests,
  processBorrowRequest
} from '@/app/actions/borrowRequestActions'
import { 
  BookOpen, 
  Users, 
  Search, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  RotateCcw,
  DollarSign,
  Clock,
  UserCheck,
  FileText,
  CircleCheck,
  CircleX,
  MessageSquare,
  Bookmark
} from 'lucide-react'

interface Transaction {
  transactionId: number
  borrowedAt: Date
  dueDate: Date
  isReturned: boolean
  finePaid?: number
  item: {
    title: string
    author: string
    isbn: string
    imageUrl?: string
  }
  patron: {
    patronId: number
    patronFirstName: string
    patronLastName: string
    patronEmail: string
  }
  fine: number
  isOverdue: boolean
}

interface Patron {
  patronId: number
  patronFirstName: string
  patronLastName: string
  patronEmail: string
  isStudent: boolean
  isFaculty: boolean
}

interface BorrowRequest {
  requestId: number
  requestType: 'BORROW' | 'RESERVE'
  status: 'PENDING'
  requestedAt: Date
  item: {
    itemId: number
    title: string
    author: string
    isbn?: string
    imageUrl?: string
    availableCopies: number
    totalCopies: number
  }
  patron: {
    patronId: number
    patronFirstName: string
    patronLastName: string
    patronEmail: string
    isStudent: boolean
    isFaculty: boolean
  }
}

interface CirculationManagementClientProps {
  librarianId?: number
}

export default function CirculationManagementClient({ librarianId: propLibrarianId }: CirculationManagementClientProps = {}) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'requests' | 'issue' | 'search'>('transactions')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [requests, setRequests] = useState<BorrowRequest[]>([])
  const [patrons, setPatrons] = useState<Patron[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [librarianId, setLibrarianId] = useState<number | null>(propLibrarianId || null)
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null)
  const [requestNotes, setRequestNotes] = useState('')

  // Issue book form state
  const [issueForm, setIssueForm] = useState({
    itemId: '',
    patronId: '',
    patronSearch: ''
  })

  // Search states
  const [patronQuery, setPatronQuery] = useState('')
  const [itemQuery, setItemQuery] = useState('')
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null)

  useEffect(() => {
    if (propLibrarianId) {
      setLibrarianId(propLibrarianId)
    }
  }, [propLibrarianId])

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions()
    } else if (activeTab === 'requests') {
      loadRequests()
    }
  }, [activeTab])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const result = await getActiveTransactions()
      if (result.success && result.data) {
        setTransactions(result.data)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const result = await getPendingRequests()
      if (result.success && result.data) {
        setRequests(result.data)
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchPatrons = async (query: string) => {
    setPatronQuery(query)
    if (query.length >= 2) {
      const result = await searchPatrons(query)
      if (result.success && result.data) {
        setPatrons(result.data)
      }
    } else {
      setPatrons([])
    }
  }

  const handleIssueBook = async () => {
    if (!issueForm.itemId || !selectedPatron) {
      setMessage({ type: 'error', text: 'Please select both item and patron' })
      return
    }

    setIsLoading(true)
    try {
      const result = await issueBook({
        itemId: parseInt(issueForm.itemId),
        patronId: selectedPatron.patronId
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Book issued successfully!' })
        setIssueForm({ itemId: '', patronId: '', patronSearch: '' })
        setSelectedPatron(null)
        setPatronQuery('')
        if (activeTab === 'transactions') {
          loadTransactions()
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to issue book' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturnBook = async (transactionId: number) => {
    setIsLoading(true)
    try {
      const result = await returnBook({ transactionId })

      if (result.success) {
        const fineMessage = result.fine && result.fine > 0 
          ? ` Fine collected: $${result.fine.toFixed(2)}` 
          : ''
        setMessage({ type: 'success', text: `Book returned successfully!${fineMessage}` })
        loadTransactions()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to return book' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenewBook = async (transactionId: number) => {
    setIsLoading(true)
    try {
      const result = await renewBook({ transactionId })

      if (result.success) {
        setMessage({ type: 'success', text: 'Book renewed successfully!' })
        loadTransactions()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to renew book' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayFine = async (transactionId: number, amount: number) => {
    if (!confirm(`Collect fine of $${amount.toFixed(2)}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const result = await payFine(transactionId, amount)

      if (result.success) {
        setMessage({ type: 'success', text: `Fine of $${amount.toFixed(2)} collected successfully!` })
        loadTransactions()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to collect fine' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessRequest = async (requestId: number, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    if (!librarianId) {
      setMessage({ type: 'error', text: 'Librarian ID not found. Please refresh and try again.' })
      return
    }

    setIsLoading(true)
    try {
      const result = await processBorrowRequest({
        requestId,
        librarianId,
        status,
        notes
      })

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: status === 'APPROVED' 
            ? 'Request approved successfully!' 
            : 'Request rejected successfully!'
        })
        setProcessingRequestId(null)
        setRequestNotes('')
        loadRequests()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to process request' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const getDaysOverdue = (dueDate: Date) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = now.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Circulation Management</h1>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="h-4 w-4" />
          Active Loans
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="h-4 w-4" />
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('issue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'issue'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Issue Book
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="h-4 w-4" />
          Search Patrons
        </button>
      </div>

      {/* Active Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Current Borrowed Items</h2>
            <p className="text-sm text-gray-600">{transactions.length} active loans</p>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="text-lg">Loading transactions...</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.transactionId} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                        {transaction.item.imageUrl ? (
                          <img 
                            src={transaction.item.imageUrl} 
                            alt={transaction.item.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{transaction.item.title}</h3>
                        <p className="text-gray-600">by {transaction.item.author}</p>
                        <p className="text-sm text-gray-500">ISBN: {transaction.item.isbn}</p>
                        
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            {transaction.patron.patronFirstName} {transaction.patron.patronLastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Borrowed: {formatDate(transaction.borrowedAt)}
                          </span>
                          <span className={`flex items-center gap-1 ${
                            transaction.isOverdue ? 'text-red-600' : 'text-green-600'
                          }`}>
                            <Clock className="h-4 w-4" />
                            Due: {formatDate(transaction.dueDate)}
                            {transaction.isOverdue && ` (${getDaysOverdue(transaction.dueDate)} days overdue)`}
                          </span>
                        </div>

                        {transaction.isOverdue && (
                          <div className="mt-2 flex items-center gap-1 text-red-600 font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            Fine: ${transaction.fine.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {transaction.isOverdue && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePayFine(transaction.transactionId, transaction.fine)}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Collect Fine
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRenewBook(transaction.transactionId)}
                        disabled={transaction.isOverdue}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Renew
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReturnBook(transaction.transactionId)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {transactions.length === 0 && (
                <div className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">No active loans</p>
                  <p className="text-gray-500">All books are currently returned</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Issue Book Tab */}
      {activeTab === 'issue' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Issue New Book</h2>
          
          <div className="space-y-6">
            {/* Patron Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patron
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={patronQuery}
                  onChange={(e) => handleSearchPatrons(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Patron Search Results */}
              {patrons.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  {patrons.map((patron) => (
                    <button
                      key={patron.patronId}
                      onClick={() => {
                        setSelectedPatron(patron)
                        setPatronQuery(`${patron.patronFirstName} ${patron.patronLastName}`)
                        setPatrons([])
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium">{patron.patronFirstName} {patron.patronLastName}</div>
                      <div className="text-sm text-gray-600">{patron.patronEmail}</div>
                      <div className="text-xs text-gray-500">
                        {patron.isStudent ? 'Student' : patron.isFaculty ? 'Faculty' : 'Patron'} • ID: {patron.patronId}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Patron */}
              {selectedPatron && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedPatron.patronFirstName} {selectedPatron.patronLastName}</div>
                      <div className="text-sm text-gray-600">{selectedPatron.patronEmail}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPatron(null)
                        setPatronQuery('')
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Item ID Input */}
            <div>
              <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-2">
                Item ID
              </label>
              <Input
                id="itemId"
                type="number"
                placeholder="Enter item ID to issue"
                value={issueForm.itemId}
                onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })}
              />
            </div>

            {/* Issue Button */}
            <Button 
              onClick={handleIssueBook}
              disabled={!selectedPatron || !issueForm.itemId || isLoading}
              className="w-full"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {isLoading ? 'Issuing...' : 'Issue Book'}
            </Button>
          </div>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Search Patrons</h2>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search patrons by name or email..."
                value={patronQuery}
                onChange={(e) => handleSearchPatrons(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {patrons.map((patron) => (
              <div key={patron.patronId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{patron.patronFirstName} {patron.patronLastName}</h3>
                    <p className="text-gray-600">{patron.patronEmail}</p>
                    <p className="text-sm text-gray-500">
                      {patron.isStudent ? 'Student' : patron.isFaculty ? 'Faculty' : 'Patron'} • ID: {patron.patronId}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPatron(patron)
                        setActiveTab('issue')
                        setPatronQuery(`${patron.patronFirstName} ${patron.patronLastName}`)
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Issue Book
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {patronQuery.length >= 2 && patrons.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No patrons found</p>
                <p className="text-gray-500">Try searching with a different name or email</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Borrow & Reserve Requests</h2>
            <p className="text-sm text-gray-600">{requests.length} pending requests</p>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="text-lg">Loading requests...</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.requestId} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                        {request.item.imageUrl ? (
                          <img 
                            src={request.item.imageUrl} 
                            alt={request.item.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{request.item.title}</h3>
                        <p className="text-gray-600">by {request.item.author}</p>
                        {request.item.isbn && <p className="text-sm text-gray-500">ISBN: {request.item.isbn}</p>}
                        
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            {request.requestType === 'BORROW' ? (
                              <BookOpen className="h-4 w-4" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                            <span className="font-medium">{request.requestType} Request</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            {request.patron.patronFirstName} {request.patron.patronLastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(request.requestedAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          <span>{request.patron.patronEmail}</span>
                          <span className="font-medium">
                            {request.patron.isStudent ? 'Student' : request.patron.isFaculty ? 'Faculty' : 'Patron'}
                          </span>
                          <span className="text-blue-600">
                            Available: {request.item.availableCopies} of {request.item.totalCopies}
                          </span>
                        </div>

                        {processingRequestId === request.requestId && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Add a note (optional)
                            </label>
                            <textarea
                              value={requestNotes}
                              onChange={(e) => setRequestNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              rows={2}
                              placeholder="Enter any notes about this decision..."
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {processingRequestId !== request.requestId ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setProcessingRequestId(request.requestId)}
                            variant="outline"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleProcessRequest(request.requestId, 'APPROVED', requestNotes)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                          >
                            <CircleCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleProcessRequest(request.requestId, 'REJECTED', requestNotes)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isLoading}
                          >
                            <CircleX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setProcessingRequestId(null)
                              setRequestNotes('')
                            }}
                            variant="outline"
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {requests.length === 0 && (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">No pending requests</p>
                  <p className="text-gray-500">All borrow and reserve requests have been processed</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
