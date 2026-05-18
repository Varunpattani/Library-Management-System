'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  getPatronBorrowingDetails,
  createReservation,
  cancelReservation,
  renewBook,
  type ReservationData
} from '@/app/actions/circulationActions'
import { 
  getPatronRequests,
  cancelBorrowRequest
} from '@/app/actions/borrowRequestActions'
import { 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  History,
  Bookmark,
  RotateCcw,
  X,
  CheckCircle,
  FileText,
  CircleCheck,
  CircleX,
  CircleDot
} from 'lucide-react'

interface CurrentBorrowing {
  transactionId: number
  borrowedAt: Date
  dueDate: Date
  item: {
    itemId: number
    title: string
    author: string
    isbn: string
    imageUrl?: string
  }
  fine?: number
}

interface BorrowingHistory {
  transactionId: number
  borrowedAt: Date
  returnedAt: Date
  dueDate: Date
  finePaid?: number
  item: {
    title: string
    author: string
    isbn: string
  }
}

interface Reservation {
  reservationId: number
  reservedAt: Date
  item: {
    itemId: number
    title: string
    author: string
    isbn: string
    imageUrl?: string
  }
}

interface BorrowingData {
  currentBorrowings: CurrentBorrowing[]
  borrowingHistory: BorrowingHistory[]
  reservations: Reservation[]
  overdueBooks: (CurrentBorrowing & { fine: number })[]
  currentFines: number
  totalFinesPaid: number
}

interface BorrowRequest {
  requestId: number
  requestType: 'BORROW' | 'RESERVE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  requestedAt: Date
  processedAt?: Date
  notes?: string
  item: {
    itemId: number
    title: string
    author: string
    isbn?: string
    imageUrl?: string
  }
  processedBy?: {
    librarianFirstName: string
    librarianLastName: string
  }
}

interface PatronAccountClientProps {
  patronId: number
  patronName: string
}

export default function PatronAccountClient({ patronId, patronName }: PatronAccountClientProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'reservations' | 'fines' | 'requests'>('current')
  const [data, setData] = useState<BorrowingData | null>(null)
  const [requests, setRequests] = useState<BorrowRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadBorrowingData()
    loadRequests()
  }, [patronId])

  const loadBorrowingData = async () => {
    setIsLoading(true)
    try {
      const result = await getPatronBorrowingDetails(patronId)
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load account data' })
      }
    } catch (error) {
      console.error('Error loading borrowing data:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadRequests = async () => {
    try {
      const result = await getPatronRequests(patronId)
      if (result.success && result.data) {
        setRequests(result.data)
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    }
  }

  const handleRenewBook = async (transactionId: number) => {
    setIsLoading(true)
    try {
      const result = await renewBook({ transactionId })

      if (result.success) {
        setMessage({ type: 'success', text: 'Book renewed successfully!' })
        loadBorrowingData()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to renew book' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReserveItem = async (itemId: number) => {
    setIsLoading(true)
    try {
      const result = await createReservation({ itemId, patronId })

      if (result.success) {
        setMessage({ type: 'success', text: 'Item reserved successfully!' })
        loadBorrowingData()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reserve item' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await cancelReservation(reservationId, patronId)

      if (result.success) {
        setMessage({ type: 'success', text: 'Reservation cancelled successfully!' })
        loadBorrowingData()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to cancel reservation' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await cancelBorrowRequest(requestId, patronId)

      if (result.success) {
        setMessage({ type: 'success', text: 'Request cancelled successfully!' })
        loadRequests()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to cancel request' })
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

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const getDaysOverdue = (dueDate: Date) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = now.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200'
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200'
      case 'CANCELLED': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <CircleDot className="h-4 w-4" />
      case 'APPROVED': return <CircleCheck className="h-4 w-4" />
      case 'REJECTED': return <CircleX className="h-4 w-4" />
      case 'CANCELLED': return <X className="h-4 w-4" />
      default: return <CircleDot className="h-4 w-4" />
    }
  }

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-lg">Loading your account...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Library Account</h1>
          <p className="text-gray-600">Welcome back, {patronName}</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data?.currentBorrowings.length || 0}</div>
            <div className="text-sm text-gray-500">Current Books</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data?.reservations.length || 0}</div>
            <div className="text-sm text-gray-500">Reservations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingRequestsCount}</div>
            <div className="text-sm text-gray-500">Pending Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">${data?.currentFines.toFixed(2) || '0.00'}</div>
            <div className="text-sm text-gray-500">Current Fines</div>
          </div>
        </div>
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
          onClick={() => setActiveTab('current')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'current'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Current Books ({data?.currentBorrowings.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reservations'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Reservations ({data?.reservations.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="h-4 w-4" />
          History
        </button>
        <button
          onClick={() => setActiveTab('fines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'fines'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Fines & Fees
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
      </div>

      {/* Current Books Tab */}
      {activeTab === 'current' && data && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Currently Borrowed Books</h2>
            <p className="text-sm text-gray-600">{data.currentBorrowings.length} books currently checked out</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {data.currentBorrowings.map((borrowing) => {
              const daysUntilDue = getDaysUntilDue(borrowing.dueDate)
              const isOverdue = daysUntilDue < 0
              const fine = data.overdueBooks.find(od => od.transactionId === borrowing.transactionId)?.fine || 0
              
              return (
                <div key={borrowing.transactionId} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                        {borrowing.item.imageUrl ? (
                          <img 
                            src={borrowing.item.imageUrl} 
                            alt={borrowing.item.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{borrowing.item.title}</h3>
                        <p className="text-gray-600">by {borrowing.item.author}</p>
                        <p className="text-sm text-gray-500">ISBN: {borrowing.item.isbn}</p>
                        
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Borrowed: {formatDate(borrowing.borrowedAt)}
                          </span>
                          <span className={`flex items-center gap-1 ${
                            isOverdue ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            <Clock className="h-4 w-4" />
                            Due: {formatDate(borrowing.dueDate)}
                            {isOverdue 
                              ? ` (${Math.abs(daysUntilDue)} days overdue)`
                              : ` (${daysUntilDue} days remaining)`
                            }
                          </span>
                        </div>

                        {fine > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-red-600 font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            Current Fine: ${fine.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRenewBook(borrowing.transactionId)}
                        disabled={fine > 0}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Renew
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {data.currentBorrowings.length === 0 && (
              <div className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No books currently borrowed</p>
                <p className="text-gray-500">Visit the catalog to find books to borrow</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && data && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">My Reservations</h2>
            <p className="text-sm text-gray-600">{data.reservations.length} items reserved</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {data.reservations.map((reservation) => (
              <div key={reservation.reservationId} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                      {reservation.item.imageUrl ? (
                        <img 
                          src={reservation.item.imageUrl} 
                          alt={reservation.item.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{reservation.item.title}</h3>
                      <p className="text-gray-600">by {reservation.item.author}</p>
                      <p className="text-sm text-gray-500">ISBN: {reservation.item.isbn}</p>
                      
                      <div className="mt-2 flex items-center gap-1 text-sm text-orange-600">
                        <Bookmark className="h-4 w-4" />
                        Reserved on: {formatDateTime(reservation.reservedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelReservation(reservation.reservationId)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {data.reservations.length === 0 && (
              <div className="p-12 text-center">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No active reservations</p>
                <p className="text-gray-500">Reserve books when they're not available for immediate borrowing</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && data && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Borrowing History</h2>
            <p className="text-sm text-gray-600">Your recent borrowing activity</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {data.borrowingHistory.map((history) => (
              <div key={history.transactionId} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{history.item.title}</h3>
                    <p className="text-gray-600">by {history.item.author}</p>
                    <p className="text-sm text-gray-500">ISBN: {history.item.isbn}</p>
                    
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>Borrowed: {formatDate(history.borrowedAt)}</span>
                      <span>Due: {formatDate(history.dueDate)}</span>
                      <span className="text-green-600">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Returned: {formatDate(history.returnedAt)}
                      </span>
                      {history.finePaid && history.finePaid > 0 && (
                        <span className="text-red-600">
                          Fine paid: ${history.finePaid.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {data.borrowingHistory.length === 0 && (
              <div className="p-12 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No borrowing history</p>
                <p className="text-gray-500">Your returned books will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fines Tab */}
      {activeTab === 'fines' && data && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Fines & Fees</h2>
            <p className="text-sm text-gray-600">Outstanding fines and payment history</p>
          </div>
          
          <div className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Current Outstanding Fines</p>
                    <p className="text-2xl font-bold text-red-800">${data.currentFines.toFixed(2)}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Fines Paid</p>
                    <p className="text-2xl font-bold text-green-800">${data.totalFinesPaid.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Overdue Books with Fines */}
            {data.overdueBooks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Books with Outstanding Fines</h3>
                <div className="space-y-4">
                  {data.overdueBooks.map((overdue) => (
                    <div key={overdue.transactionId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-red-900">{overdue.item.title}</h4>
                          <p className="text-red-700">by {overdue.item.author}</p>
                          <div className="mt-1 text-sm text-red-600">
                            Due: {formatDate(overdue.dueDate)} • {getDaysOverdue(overdue.dueDate)} days overdue
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-800">${overdue.fine.toFixed(2)}</div>
                          <div className="text-sm text-red-600">Current fine</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Please visit the library to pay outstanding fines. You cannot renew books or borrow new items while fines are outstanding.
                  </p>
                </div>
              </div>
            )}

            {data.currentFines === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No outstanding fines</p>
                <p className="text-gray-500">Great job keeping your books returned on time!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">My Borrow & Reserve Requests</h2>
            <p className="text-sm text-gray-600">{requests.length} total requests • {pendingRequestsCount} pending</p>
          </div>
          
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
                          {request.requestType} Request
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Requested: {formatDateTime(request.requestedAt)}
                        </span>
                        {request.processedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Processed: {formatDateTime(request.processedAt)}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRequestStatusColor(request.status)}`}>
                          {getRequestStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </div>

                      {request.processedBy && (
                        <p className="mt-2 text-sm text-gray-600">
                          Processed by: {request.processedBy.librarianFirstName} {request.processedBy.librarianLastName}
                        </p>
                      )}

                      {request.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Note:</strong> {request.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {request.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelRequest(request.requestId)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {requests.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No requests found</p>
                <p className="text-gray-500">Your borrow and reserve requests will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
