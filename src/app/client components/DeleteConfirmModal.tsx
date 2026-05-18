'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAccount } from '@/app/actions/userManagementActions';

interface DeleteConfirmModalProps {
  user: UserAccount;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function DeleteConfirmModal({ user, onClose, onConfirm, isLoading }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Warning Message */}
          <div className="mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium text-sm">
                    Are you sure you want to delete this user account?
                  </p>
                  <p className="text-red-700 text-xs mt-1">
                    This will permanently remove all user data and cannot be reversed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full capitalize">
                    {user.role}
                  </span>
                  {user.role === 'patron' && (
                    <span className="text-xs text-gray-500">
                      ID: #{user.id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Warning for Patron */}
          {user.role === 'patron' && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-medium">Additional Impact:</p>
              <ul className="text-amber-700 text-xs mt-1 space-y-1">
                <li>• All borrowing history will be removed</li>
                <li>• Active reservations will be cancelled</li>
                <li>• Student/Faculty profile data will be deleted</li>
              </ul>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-3">
              Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              onChange={(e) => {
                const button = document.getElementById('confirm-delete-btn') as HTMLButtonElement;
                if (button) {
                  button.disabled = e.target.value !== 'DELETE' || isLoading;
                }
              }}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              id="confirm-delete-btn"
              onClick={onConfirm}
              disabled={true} // Initially disabled until confirmation text is entered
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
