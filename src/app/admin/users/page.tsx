import React from 'react';
import { getAllUsers } from '@/app/actions/userManagementActions';
import UserManagementClient from '@/app/client components/UserManagementClient';

export default async function UsersPage() {
  const users = await getAllUsers();

  return <UserManagementClient initialUsers={users} />;
}
