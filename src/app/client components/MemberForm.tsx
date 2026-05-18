'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  Users, 
  Save,
  X,
  AlertCircle
} from 'lucide-react'
import { Member, MemberFormData, createMember, updateMember } from '@/app/actions/memberManagementActions'

interface MemberFormProps {
  member?: Member | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (member: Member) => void
  onError: (error: string) => void
}

export default function MemberForm({ 
  member, 
  isOpen, 
  onClose, 
  onSuccess, 
  onError 
}: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    isStudent: false,
    isFaculty: false,
    studentDepartment: '',
    studentSemester: undefined,
    studentRollNo: undefined,
    studentEnrollmentNumber: undefined,
    facultyDepartment: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isEdit = !!member

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.patronFirstName,
        lastName: member.patronLastName,
        email: member.patronEmail,
        password: '', // Don't pre-fill password for editing
        isStudent: member.isStudent,
        isFaculty: member.isFaculty,
        studentDepartment: member.studentProfile?.studentDepartment || '',
        studentSemester: member.studentProfile?.studentSemester || undefined,
        studentRollNo: member.studentProfile?.studentRollNo || undefined,
        studentEnrollmentNumber: member.studentProfile?.studentEnrollmentNumber || undefined,
        facultyDepartment: member.facultyProfile?.facultyDepartment || ''
      })
    } else {
      // Reset form for new member
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        isStudent: false,
        isFaculty: false,
        studentDepartment: '',
        studentSemester: undefined,
        studentRollNo: undefined,
        studentEnrollmentNumber: undefined,
        facultyDepartment: ''
      })
    }
    setErrors({})
  }, [member, isOpen])

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Password is required for new members'
    }

    if (formData.isStudent) {
      if (formData.studentEnrollmentNumber && formData.studentEnrollmentNumber <= 0) {
        newErrors.studentEnrollmentNumber = 'Enrollment number must be positive'
      }
      if (formData.studentSemester && (formData.studentSemester < 1 || formData.studentSemester > 8)) {
        newErrors.studentSemester = 'Semester must be between 1 and 8'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleCheckboxChange = (field: 'isStudent' | 'isFaculty') => {
    const newValue = !formData[field]
    handleInputChange(field, newValue)
    
    // Clear related profile fields when unchecking
    if (!newValue) {
      if (field === 'isStudent') {
        handleInputChange('studentDepartment', '')
        handleInputChange('studentSemester', undefined)
        handleInputChange('studentRollNo', undefined)
        handleInputChange('studentEnrollmentNumber', undefined)
      } else if (field === 'isFaculty') {
        handleInputChange('facultyDepartment', '')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      let result
      
      if (isEdit && member) {
        result = await updateMember(member.patronId, formData)
      } else {
        result = await createMember(formData)
      }

      if (result.success && result.data) {
        onSuccess(result.data)
        onClose()
      } else {
        onError(result.error || 'An error occurred while saving the member')
      }
    } catch (error) {
      onError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {isEdit ? 'Edit Member' : 'Add New Member'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {!isEdit && (
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Member Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Member Type</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    id="isStudent"
                    type="checkbox"
                    checked={formData.isStudent}
                    onChange={() => handleCheckboxChange('isStudent')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Label htmlFor="isStudent" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="isFaculty"
                    type="checkbox"
                    checked={formData.isFaculty}
                    onChange={() => handleCheckboxChange('isFaculty')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Label htmlFor="isFaculty" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Faculty
                  </Label>
                </div>
              </div>
            </div>

            {/* Student Details */}
            {formData.isStudent && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Student Details</h3>
                  
                  <div>
                    <Label htmlFor="studentDepartment">Department</Label>
                    <Input
                      id="studentDepartment"
                      type="text"
                      value={formData.studentDepartment}
                      onChange={(e) => handleInputChange('studentDepartment', e.target.value)}
                      disabled={isLoading}
                      placeholder="e.g., Computer Science, Electrical Engineering"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="studentSemester">Semester</Label>
                      <Input
                        id="studentSemester"
                        type="number"
                        min="1"
                        max="8"
                        value={formData.studentSemester || ''}
                        onChange={(e) => handleInputChange('studentSemester', e.target.value ? parseInt(e.target.value) : undefined)}
                        className={errors.studentSemester ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {errors.studentSemester && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.studentSemester}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="studentRollNo">Roll Number</Label>
                      <Input
                        id="studentRollNo"
                        type="number"
                        value={formData.studentRollNo || ''}
                        onChange={(e) => handleInputChange('studentRollNo', e.target.value ? parseInt(e.target.value) : undefined)}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="studentEnrollmentNumber">Enrollment Number</Label>
                      <Input
                        id="studentEnrollmentNumber"
                        type="number"
                        value={formData.studentEnrollmentNumber || ''}
                        onChange={(e) => handleInputChange('studentEnrollmentNumber', e.target.value ? parseInt(e.target.value) : undefined)}
                        className={errors.studentEnrollmentNumber ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {errors.studentEnrollmentNumber && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.studentEnrollmentNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Faculty Details */}
            {formData.isFaculty && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Faculty Details</h3>
                  
                  <div>
                    <Label htmlFor="facultyDepartment">Department</Label>
                    <Input
                      id="facultyDepartment"
                      type="text"
                      value={formData.facultyDepartment}
                      onChange={(e) => handleInputChange('facultyDepartment', e.target.value)}
                      disabled={isLoading}
                      placeholder="e.g., Computer Science, Electrical Engineering"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : (isEdit ? 'Update Member' : 'Create Member')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
