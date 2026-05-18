'use client';

import { useState, useTransition } from 'react';
import { X, Key, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAccount, changeUserPassword } from '@/app/actions/userManagementActions';

interface PasswordChangeModalProps {
  user: UserAccount;
  onClose: () => void;
}

export default function PasswordChangeModal({ user, onClose }: PasswordChangeModalProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Both password fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await changeUserPassword(user.id, user.role, newPassword);
        
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          setTimeout(() => onClose(), 2000);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An unexpected error occurred' });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Change Password
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update password for {user.firstName} {user.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form action={handleSubmit} className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="pl-10 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="pl-10 pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-2">Password Requirements:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Must be different from current password</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Key className="w-4 h-4 mr-2" />
              {isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
