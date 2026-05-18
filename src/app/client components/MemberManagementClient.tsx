'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Plus,
  GraduationCap,
  User,
  Mail,
  Calendar,
  BookOpen,
  AlertTriangle,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Member, MemberStats, getMembers, getMemberStatistics } from '@/app/actions/memberManagementActions'
import MemberForm from './MemberForm'
import MemberDetailSheet from './MemberDetailSheet'

interface MemberManagementClientProps {
  initialMembers?: Member[]
  initialStats?: MemberStats
}

export default function MemberManagementClient({ 
  initialMembers = [],
  initialStats 
}: MemberManagementClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [stats, setStats] = useState<MemberStats | null>(initialStats || null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [memberType, setMemberType] = useState<'all' | 'student' | 'faculty'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMembers, setTotalMembers] = useState(0)
  const [itemsPerPage] = useState(20)

  // Modal state
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [showMemberDetail, setShowMemberDetail] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  useEffect(() => {
    loadMembers()
    if (!stats) {
      loadStats()
    }
  }, [currentPage, searchQuery, memberType, sortBy, sortOrder])

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const result = await getMembers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        type: memberType,
        sortBy,
        sortOrder
      })

      if (result.success && result.data) {
        setMembers(result.data.members)
        setTotalPages(result.data.pages)
        setTotalMembers(result.data.total)
      } else {
        showMessage('error', result.error || 'Failed to load members')
      }
    } catch (error) {
      showMessage('error', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getMemberStatistics()
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to load member statistics:', error)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (type: typeof memberType) => {
    setMemberType(type)
    setCurrentPage(1)
  }

  const handleSortChange = (sortField: typeof sortBy) => {
    if (sortField === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortField)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const handleAddMember = () => {
    setEditingMember(null)
    setShowMemberForm(true)
  }

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setShowMemberForm(true)
  }

  const handleViewMember = (memberId: number) => {
    setSelectedMemberId(memberId)
    setShowMemberDetail(true)
  }

  const handleFormSuccess = (member: Member) => {
    showMessage('success', `Member ${editingMember ? 'updated' : 'created'} successfully!`)
    loadMembers()
    loadStats() // Refresh stats
  }

  const handleFormError = (error: string) => {
    showMessage('error', error)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMemberTypeIcon = (member: Member) => {
    if (member.isStudent && member.isFaculty) return <Users className="h-4 w-4 text-purple-600" />
    if (member.isStudent) return <GraduationCap className="h-4 w-4 text-blue-600" />
    if (member.isFaculty) return <Users className="h-4 w-4 text-green-600" />
    return <User className="h-4 w-4 text-gray-600" />
  }

  const getMemberTypeBadge = (member: Member) => {
    if (member.isStudent && member.isFaculty) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Student & Faculty
        </span>
      )
    } else if (member.isStudent) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <GraduationCap className="h-3 w-3" />
          Student
        </span>
      )
    } else if (member.isFaculty) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Users className="h-3 w-3" />
          Faculty
        </span>
      )
    }
    // This shouldn't happen in normal cases, but just in case
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Member Management</h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleAddMember} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
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

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalMembers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.students}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.faculty}</p>
                <p className="text-sm text-gray-600">Faculty</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.newThisMonth}</p>
                <p className="text-sm text-gray-600">New This Month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.activeMembers}</p>
                <p className="text-sm text-gray-600">Active Borrowers</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search members by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={memberType}
              onChange={(e) => handleFilterChange(e.target.value as typeof memberType)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Members</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as typeof sortBy)
                setSortOrder(order as typeof sortOrder)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Members</h2>
          <p className="text-sm text-gray-600">
            Showing {members.length} of {totalMembers.toLocaleString()} members
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading members...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {members.map((member) => (
              <div key={member.patronId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {getMemberTypeIcon(member)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">
                          {member.patronFirstName} {member.patronLastName}
                        </h3>
                        {getMemberTypeBadge(member)}
                        <span className="text-sm text-gray-500">
                          ID: {member.patronId}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {member.patronEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {formatDate(member.patronCreatedAt)}
                        </span>
                        {member.borrowingHistory && (
                          <>
                            <span className="flex items-center gap-1 text-blue-600">
                              <BookOpen className="h-4 w-4" />
                              {member.borrowingHistory.current} current
                            </span>
                            {member.borrowingHistory.overdue > 0 && (
                              <span className="flex items-center gap-1 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                {member.borrowingHistory.overdue} overdue
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Additional info based on member type */}
                      <div className="mt-2 text-sm text-gray-600">
                        {member.isStudent && member.studentProfile && (
                          <div className="flex items-center gap-4">
                            {member.studentProfile.studentDepartment && (
                              <span>Dept: {member.studentProfile.studentDepartment}</span>
                            )}
                            {member.studentProfile.studentSemester && (
                              <span>Sem: {member.studentProfile.studentSemester}</span>
                            )}
                            {member.studentProfile.studentEnrollmentNumber && (
                              <span>Enrollment: {member.studentProfile.studentEnrollmentNumber}</span>
                            )}
                          </div>
                        )}
                        {member.isFaculty && member.facultyProfile && member.facultyProfile.facultyDepartment && (
                          <div>
                            <span>Department: {member.facultyProfile.facultyDepartment}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewMember(member.patronId)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditMember(member)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {members.length === 0 && !isLoading && (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No members found</p>
                <p className="text-gray-500">
                  {searchQuery || memberType !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first member'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalMembers)} of {totalMembers.toLocaleString()} members
            </div>
          </div>
        )}
      </div>

      {/* Member Form Modal */}
      <MemberForm
        member={editingMember}
        isOpen={showMemberForm}
        onClose={() => setShowMemberForm(false)}
        onSuccess={handleFormSuccess}
        onError={handleFormError}
      />

      {/* Member Detail Sheet */}
      <MemberDetailSheet
        memberId={selectedMemberId}
        isOpen={showMemberDetail}
        onClose={() => setShowMemberDetail(false)}
        onEdit={handleEditMember}
      />
    </div>
  )
}
