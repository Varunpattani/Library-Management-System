'use client';

import { useState } from 'react';
import { User, Mail, X, Save, BookOpen, GraduationCap, Building, Hash, Calendar, Award, CheckCircle, Phone, MapPin, Briefcase } from 'lucide-react';
import { updatePatronProfile, updateStudentProfile, updateFacultyProfile, updatePatronType } from '@/app/actions/patronActions';

interface Patron {
  patronId: number;
  patronEmail: string;
  patronFirstName: string;
  patronLastName: string;
  isStudent: boolean;
  isFaculty: boolean;
  patronCreatedAt: Date;
  patronUpdatedAt: Date;
  studentProfile?: {
    studentId: number;
    studentDepartment: string | null;
    studentSemester: number | null;
    studentRollNo: number | null;
    studentEnrollmentNumber: number | null;
  } | null;
  facultyProfile?: {
    facultyId: number;
    facultyDepartment: string | null;
  } | null;
}

interface PatronProfileFormProps {
  patron: Patron;
  onClose: () => void;
}

export default function PatronProfileForm({ patron, onClose }: PatronProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Keep track of patron type for UI state
  const [patronType, setPatronType] = useState({
    isStudent: patron.isStudent,
    isFaculty: patron.isFaculty
  });

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Update basic patron information
      const patronResult = await updatePatronProfile(patron.patronId, formData);
      if (!patronResult.success) {
        setMessage({ type: 'error', text: patronResult.message });
        return;
      }

      // Add isStudent and isFaculty values to formData based on our UI state
      const formDataWithPatronType = new FormData();
      for (const [key, value] of formData.entries()) {
        formDataWithPatronType.append(key, value);
      }
      
      // Add our patron type values from state
      if (patronType.isStudent) {
        formDataWithPatronType.append('isStudent', 'on');
      }
      
      if (patronType.isFaculty) {
        formDataWithPatronType.append('isFaculty', 'on');
      }

      // Update patron type flags
      const typeResult = await updatePatronType(patron.patronId, formDataWithPatronType);
      if (!typeResult.success) {
        setMessage({ type: 'error', text: typeResult.message });
        return;
      }

      // Update student profile if patron is a student
      if (patronType.isStudent) {
        const studentResult = await updateStudentProfile(patron.patronId, formData);
        if (!studentResult.success) {
          setMessage({ type: 'error', text: studentResult.message });
          return;
        }
      }

      // Update faculty profile if patron is faculty
      if (patronType.isFaculty) {
        const facultyResult = await updateFacultyProfile(patron.patronId, formData);
        if (!facultyResult.success) {
          setMessage({ type: 'error', text: facultyResult.message });
          return;
        }
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
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
          <div className="p-6 space-y-8">
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="patronFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="patronFirstName"
                    name="patronFirstName"
                    defaultValue={patron.patronFirstName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="patronLastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="patronLastName"
                    name="patronLastName"
                    defaultValue={patron.patronLastName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="patronEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="patronEmail"
                      name="patronEmail"
                      defaultValue={patron.patronEmail}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Student Information */}
            {patronType.isStudent && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="studentDepartment" className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="studentDepartment"
                        name="studentDepartment"
                        defaultValue={patron.studentProfile?.studentDepartment || ''}
                        placeholder="e.g. Computer Science"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="studentSemester" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Semester
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        id="studentSemester"
                        name="studentSemester"
                        defaultValue={patron.studentProfile?.studentSemester || ''}
                        min="1"
                        max="10"
                        placeholder="e.g. 6"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="studentRollNo" className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        id="studentRollNo"
                        name="studentRollNo"
                        defaultValue={patron.studentProfile?.studentRollNo || ''}
                        placeholder="e.g. 42"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="studentEnrollmentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Number
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        id="studentEnrollmentNumber"
                        name="studentEnrollmentNumber"
                        defaultValue={patron.studentProfile?.studentEnrollmentNumber || ''}
                        placeholder="e.g. 20220001"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Faculty Information */}
            {patronType.isFaculty && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Faculty Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="facultyDepartment" className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="facultyDepartment"
                        name="facultyDepartment"
                        defaultValue={patron.facultyProfile?.facultyDepartment || ''}
                        placeholder="e.g. Computer Science"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
