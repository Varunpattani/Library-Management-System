'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Calendar, CreditCard, Edit3, GraduationCap, BookOpen, LogOut } from 'lucide-react';
import { getPatronById } from '@/app/actions/patronActions';
import PatronProfileForm from '@/app/client components/PatronProfileForm';
import { logout } from '@/app/actions/authActions';

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

interface PatronProfileClientProps {
  patronId: number;
}

export default function PatronProfileClient({ patronId }: PatronProfileClientProps) {
  const [patron, setPatron] = useState<Patron | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatron = async () => {
      try {
        const patronData = await getPatronById(patronId);
        if (patronData) {
          setPatron(patronData);
        } else {
          setError('Patron not found');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPatron();
  }, [patronId, showEditForm]); // Re-fetch when edit form closes

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMembershipType = (patron: Patron) => {
    if (patron.isStudent && patron.isFaculty) return 'Student & Faculty';
    if (patron.isStudent) return 'Student';
    if (patron.isFaculty) return 'Faculty';
    return 'General';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patron) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error</div>
            <div className="text-gray-600">{error || 'Failed to load profile'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowEditForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {patron.patronFirstName} {patron.patronLastName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{getMembershipType(patron)} Member</p>
                  <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block">
                    Active
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Patron ID</p>
                      <p className="text-sm font-mono">#{patron.patronId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="text-sm">{formatDate(patron.patronCreatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <p className="mt-1 text-sm text-gray-900">{patron.patronFirstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      <p className="mt-1 text-sm text-gray-900">{patron.patronLastName}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{patron.patronEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Student Information */}
              {(patron.isStudent || patron.studentProfile) && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Student Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {patron.studentProfile?.studentDepartment || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Semester</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {patron.studentProfile?.studentSemester || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Roll Number</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {patron.studentProfile?.studentRollNo || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Enrollment Number</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">
                          {patron.studentProfile?.studentEnrollmentNumber || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty Information */}
              {(patron.isFaculty || patron.facultyProfile) && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Faculty Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {patron.facultyProfile?.facultyDepartment || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Created</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(patron.patronCreatedAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(patron.patronUpdatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <PatronProfileForm 
          patron={patron}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  );
}
