'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { 
  User, 
  Mail, 
  Calendar, 
  GraduationCap, 
  Users, 
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  History,
  BookMarked,
  FileText,
  Badge
} from 'lucide-react'
import { Member, getMemberById, getMemberBorrowingHistory } from '@/app/actions/memberManagementActions'

interface MemberDetailSheetProps {
  memberId: number | null
  isOpen: boolean
  onClose: () => void
  onEdit: (member: Member) => void
}

interface BorrowingData {
  current: any[]
  history: any[]
  reservations: any[]
  requests: any[]
}

export default function MemberDetailSheet({ 
  memberId, 
  isOpen, 
  onClose, 
  onEdit 
}: MemberDetailSheetProps) {
  const [member, setMember] = useState<Member | null>(null)
  const [borrowingData, setBorrowingData] = useState<BorrowingData | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'current' | 'history' | 'reservations' | 'requests'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (memberId && isOpen) {
      loadMemberData()
    }
  }, [memberId, isOpen])

  const loadMemberData = async () => {
    if (!memberId) return

    setIsLoading(true)
    setError(null)

    try {
      const [memberResult, borrowingResult] = await Promise.all([
        getMemberById(memberId),
        getMemberBorrowingHistory(memberId)
      ])

      if (memberResult.success && memberResult.data) {
        setMember(memberResult.data)
      } else {
        setError(memberResult.error || 'Failed to load member data')
      }

      if (borrowingResult.success && borrowingResult.data) {
        setBorrowingData(borrowingResult.data)
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMemberType = () => {
    if (!member) return 'Member'
    if (member.isStudent && member.isFaculty) return 'Student & Faculty'
    if (member.isStudent) return 'Student'
    if (member.isFaculty) return 'Faculty'
    return 'Member'
  }

  const getMemberTypeIcon = () => {
    if (!member) return <User className="h-4 w-4" />
    if (member.isStudent && member.isFaculty) return <Users className="h-4 w-4" />
    if (member.isStudent) return <GraduationCap className="h-4 w-4" />
    if (member.isFaculty) return <Users className="h-4 w-4" />
    return <User className="h-4 w-4" />
  }

  const TabButton = ({ tab, icon: Icon, label, count }: { 
    tab: typeof activeTab, 
    icon: any, 
    label: string, 
    count?: number 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          activeTab === tab ? 'bg-blue-200' : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  )

  if (!isOpen) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Member Details
          </SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading member details...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {member && !isLoading && (
          <div className="space-y-6 mt-6">
            {/* Member Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {getMemberTypeIcon()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {member.patronFirstName} {member.patronLastName}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {member.patronEmail}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getMemberTypeIcon()}
                        {getMemberType()}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {member.patronId}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(member)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>

              {/* Quick Stats */}
              {member.borrowingHistory && (
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-600">
                      {member.borrowingHistory.current}
                    </p>
                    <p className="text-xs text-gray-600">Current</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">
                      {member.borrowingHistory.returned}
                    </p>
                    <p className="text-xs text-gray-600">Returned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-red-600">
                      {member.borrowingHistory.overdue}
                    </p>
                    <p className="text-xs text-gray-600">Overdue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-600">
                      {member.borrowingHistory.total}
                    </p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
              <TabButton tab="profile" icon={User} label="Profile" />
              <TabButton 
                tab="current" 
                icon={BookOpen} 
                label="Current" 
                count={borrowingData?.current.length || 0} 
              />
              <TabButton 
                tab="history" 
                icon={History} 
                label="History" 
                count={borrowingData?.history.length || 0} 
              />
              <TabButton 
                tab="reservations" 
                icon={BookMarked} 
                label="Reserved" 
                count={borrowingData?.reservations.length || 0} 
              />
              <TabButton 
                tab="requests" 
                icon={FileText} 
                label="Requests" 
                count={borrowingData?.requests.length || 0} 
              />
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member ID:</span>
                        <span className="font-medium">{member.patronId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{member.patronEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-medium">{formatDate(member.patronCreatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{formatDate(member.patronUpdatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {member.isStudent && member.studentProfile && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Student Information
                        </h4>
                        <div className="space-y-3 text-sm">
                          {member.studentProfile.studentDepartment && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Department:</span>
                              <span className="font-medium">{member.studentProfile.studentDepartment}</span>
                            </div>
                          )}
                          {member.studentProfile.studentSemester && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Semester:</span>
                              <span className="font-medium">{member.studentProfile.studentSemester}</span>
                            </div>
                          )}
                          {member.studentProfile.studentRollNo && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Roll Number:</span>
                              <span className="font-medium">{member.studentProfile.studentRollNo}</span>
                            </div>
                          )}
                          {member.studentProfile.studentEnrollmentNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Enrollment Number:</span>
                              <span className="font-medium">{member.studentProfile.studentEnrollmentNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {member.isFaculty && member.facultyProfile && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Faculty Information
                        </h4>
                        <div className="space-y-3 text-sm">
                          {member.facultyProfile.facultyDepartment && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Department:</span>
                              <span className="font-medium">{member.facultyProfile.facultyDepartment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Current Borrows Tab */}
              {activeTab === 'current' && (
                <div className="space-y-4">
                  {borrowingData?.current.map((transaction) => (
                    <div key={transaction.transactionId} className="border rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          {transaction.item.imageUrl ? (
                            <img 
                              src={transaction.item.imageUrl} 
                              alt={transaction.item.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium truncate">{transaction.item.title}</h5>
                          <p className="text-sm text-gray-600">by {transaction.item.author}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-green-600">
                              <Calendar className="h-3 w-3" />
                              Borrowed: {formatDate(transaction.borrowedAt)}
                            </span>
                            <span className={`flex items-center gap-1 ${
                              new Date(transaction.dueDate) < new Date() 
                                ? 'text-red-600' 
                                : 'text-blue-600'
                            }`}>
                              <Clock className="h-3 w-3" />
                              Due: {formatDate(transaction.dueDate)}
                            </span>
                          </div>
                        </div>
                        {new Date(transaction.dueDate) < new Date() && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3" />
                              Overdue
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || []}
                  
                  {(!borrowingData?.current || borrowingData.current.length === 0) && (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No books currently borrowed</p>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {borrowingData?.history.map((transaction) => (
                    <div key={transaction.transactionId} className="border rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          {transaction.item.imageUrl ? (
                            <img 
                              src={transaction.item.imageUrl} 
                              alt={transaction.item.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium truncate">{transaction.item.title}</h5>
                          <p className="text-sm text-gray-600">by {transaction.item.author}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-3 w-3" />
                              Borrowed: {formatDate(transaction.borrowedAt)}
                            </span>
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Returned: {formatDate(transaction.returnedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || []}
                  
                  {(!borrowingData?.history || borrowingData.history.length === 0) && (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No borrowing history</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reservations Tab */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  {borrowingData?.reservations.map((reservation) => (
                    <div key={reservation.reservationId} className="border rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          {reservation.item.imageUrl ? (
                            <img 
                              src={reservation.item.imageUrl} 
                              alt={reservation.item.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium truncate">{reservation.item.title}</h5>
                          <p className="text-sm text-gray-600">by {reservation.item.author}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-blue-600">
                              <BookMarked className="h-3 w-3" />
                              Reserved: {formatDate(reservation.reservedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <BookMarked className="h-3 w-3" />
                            Reserved
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || []}
                  
                  {(!borrowingData?.reservations || borrowingData.reservations.length === 0) && (
                    <div className="text-center py-12">
                      <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active reservations</p>
                    </div>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-4">
                  {borrowingData?.requests.map((request) => (
                    <div key={request.requestId} className="border rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          {request.item.imageUrl ? (
                            <img 
                              src={request.item.imageUrl} 
                              alt={request.item.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium truncate">{request.item.title}</h5>
                          <p className="text-sm text-gray-600">by {request.item.author}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-orange-600">
                              <FileText className="h-3 w-3" />
                              Requested: {formatDate(request.requestedAt)}
                            </span>
                            <span className="capitalize">{request.requestType.toLowerCase()} Request</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || []}
                  
                  {(!borrowingData?.requests || borrowingData.requests.length === 0) && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No pending requests</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
