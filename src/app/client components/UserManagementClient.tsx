'use client';

import { useState, useTransition } from 'react';
import { Users, Plus, Edit, Trash2, Key, Search, Filter, UserPlus, Shield, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAccount, UserRole, deleteUser } from '@/app/actions/userManagementActions';
import UserFormModal from './UserFormModal';
import PasswordChangeModal from './PasswordChangeModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface UserManagementClientProps {
  initialUsers: UserAccount[];
}

export default function UserManagementClient({ initialUsers }: UserManagementClientProps) {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isPending, startTransition] = useTransition();

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'librarian':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'patron':
        return <Users className="w-4 h-4 text-green-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'librarian':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patron':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPatronTypeDisplay = (user: UserAccount) => {
    if (user.role !== 'patron') return '';
    
    const types = [];
    if (user.isStudent) types.push('Student');
    if (user.isFaculty) types.push('Faculty');
    
    return types.length > 0 ? ` (${types.join(', ')})` : ' (General)';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleChangePassword = (user: UserAccount) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleDelete = (user: UserAccount) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    startTransition(async () => {
      const result = await deleteUser(selectedUser.id, selectedUser.role);
      if (result.success) {
        setUsers(prev => prev.filter(u => !(u.id === selectedUser.id && u.role === selectedUser.role)));
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      }
    });
  };

  const handleUserCreated = (newUser: UserAccount) => {
    setUsers(prev => [...prev, newUser]);
    setIsCreateModalOpen(false);
  };

  const handleUserUpdated = (updatedUser: UserAccount) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id && u.role === updatedUser.role ? updatedUser : u
    ));
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage admin, librarian, and patron accounts
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="librarian">Librarian</option>
                  <option value="patron">Patron</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={`${user.role}-${user.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        {getPatronTypeDisplay(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleChangePassword(user)}
                          className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first user account'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modals */}
        {isCreateModalOpen && (
          <UserFormModal
            mode="create"
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleUserCreated}
          />
        )}

        {isEditModalOpen && selectedUser && (
          <UserFormModal
            mode="edit"
            user={selectedUser}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            onSuccess={handleUserUpdated}
          />
        )}

        {isPasswordModalOpen && selectedUser && (
          <PasswordChangeModal
            user={selectedUser}
            onClose={() => {
              setIsPasswordModalOpen(false);
              setSelectedUser(null);
            }}
          />
        )}

        {isDeleteModalOpen && selectedUser && (
          <DeleteConfirmModal
            user={selectedUser}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            onConfirm={confirmDelete}
            isLoading={isPending}
          />
        )}
      </div>
    </div>
  );
}
