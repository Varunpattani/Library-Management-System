 'use client';

import { useState, useTransition } from 'react';
import { X, Save, User, Mail, Lock, Shield, BookOpen, Users, GraduationCap, Building, Hash, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAccount, UserRole, createUser, updateUser, getUserById } from '@/app/actions/userManagementActions';

interface UserFormModalProps {
  mode: 'create' | 'edit';
  user?: UserAccount;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export default function UserFormModal({ mode, user, onClose, onSuccess }: UserFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'patron');
  const [patronType, setPatronType] = useState<'student' | 'faculty'>(
    user?.isStudent ? 'student' : user?.isFaculty ? 'faculty' : 'student'
  );
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      try {
        let result;
        
        if (mode === 'create') {
          formData.set('role', selectedRole);
          if (selectedRole === 'patron') {
            if (patronType === 'student') formData.set('isStudent', 'on');
            if (patronType === 'faculty') formData.set('isFaculty', 'on');
          }
          result = await createUser(formData);
        } else if (user) {
          if (selectedRole === 'patron') {
            if (patronType === 'student') formData.set('isStudent', 'on');
            if (patronType === 'faculty') formData.set('isFaculty', 'on');
          }
          result = await updateUser(user.id, user.role, formData);
        }

        if (result?.success) {
          setMessage({ type: 'success', text: result.message });
          
          if (mode === 'create') {
            // For new user, we need to construct the user object
            const newUser: UserAccount = {
              id: Math.random(), // This will be overwritten by server data
              email: formData.get('email') as string,
              firstName: formData.get('firstName') as string,
              lastName: formData.get('lastName') as string,
              role: selectedRole,
              createdAt: new Date(),
              isStudent: patronType === 'student',
              isFaculty: patronType === 'faculty',
            };
            setTimeout(() => onSuccess(newUser), 1000);
          } else if (user) {
            // For edit, update with new data
            const updatedUser: UserAccount = {
              ...user,
              email: formData.get('email') as string,
              firstName: formData.get('firstName') as string,
              lastName: formData.get('lastName') as string,
              isStudent: patronType === 'student',
              isFaculty: patronType === 'faculty',
            };
            setTimeout(() => onSuccess(updatedUser), 1000);
          }
        } else {
          setMessage({ type: 'error', text: result?.message || 'An error occurred' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An unexpected error occurred' });
      }
    });
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'librarian':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'patron':
        return <Users className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New User' : 'Edit User'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'create' 
                  ? 'Create a new user account with specific role and permissions' 
                  : 'Update user information and role assignments'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form action={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="p-6 space-y-6">
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            )}

            {/* Role Selection - Only for create mode */}
            {mode === 'create' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">User Role</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['admin', 'librarian', 'patron'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedRole === role
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {getRoleIcon(role)}
                        <span className="font-medium capitalize">{role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    defaultValue={user?.firstName || ''}
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    defaultValue={user?.lastName || ''}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={user?.email || ''}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                {mode === 'create' && (
                  <div className="md:col-span-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Patron Role Options */}
            {selectedRole === 'patron' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Patron Type</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    patronType === 'student' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="patronType"
                      value="student"
                      checked={patronType === 'student'}
                      onChange={() => setPatronType('student')}
                      className="sr-only"
                    />
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Student</span>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    patronType === 'faculty' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="patronType"
                      value="faculty"
                      checked={patronType === 'faculty'}
                      onChange={() => setPatronType('faculty')}
                      className="sr-only"
                    />
                    <BookOpen className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">Faculty</span>
                  </label>
                </div>

                {/* Student Fields */}
                {patronType === 'student' && (
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Student Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="studentDepartment" className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="studentDepartment"
                            name="studentDepartment"
                            type="text"
                            placeholder="e.g. Computer Science"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="studentSemester" className="block text-sm font-medium text-gray-700 mb-2">
                          Semester
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="studentSemester"
                            name="studentSemester"
                            type="number"
                            min="1"
                            max="10"
                            placeholder="e.g. 6"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="studentRollNo" className="block text-sm font-medium text-gray-700 mb-2">
                          Roll Number
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="studentRollNo"
                            name="studentRollNo"
                            type="number"
                            placeholder="e.g. 42"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="studentEnrollmentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Enrollment Number
                        </label>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="studentEnrollmentNumber"
                            name="studentEnrollmentNumber"
                            type="number"
                            placeholder="e.g. 20220001"
                            className="pl-10 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Faculty Fields */}
                {patronType === 'faculty' && (
                  <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Faculty Information
                    </h4>
                    <div>
                      <label htmlFor="facultyDepartment" className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="facultyDepartment"
                          name="facultyDepartment"
                          type="text"
                          placeholder="e.g. Computer Science"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isPending ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
