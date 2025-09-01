import React, { useState, useEffect } from 'react';
import { Plus, Users, Download, Upload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import AddUserModal from './AddUserModal';
import UserList from './UserList';
import {
  fetchUsers,
  createUser,
  deleteUser,
  toggleUserStatus,
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  selectFilteredUsers,
  setFilters,
  clearFilters
} from '../../store/slices/userSlice';

const UserManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dispatch = useDispatch();

  // Selectors
  const users = useSelector(selectUsers) || [];
  const filteredUsers = useSelector(selectFilteredUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleUserCreated = async (userData) => {
    try {
      await dispatch(createUser(userData)).unwrap();
      setIsAddModalOpen(false);
    } catch (error) {
      // Error is handled by the slice
      console.error('Failed to create user:', error);
    }
  };

  const handleEditUser = (user) => {
    // TODO: Open edit modal
    toast.info('Edit functionality coming soon!');
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      try {
        await dispatch(deleteUser(user._id)).unwrap();
      } catch (error) {
        // Error is handled by the slice
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleViewUser = (user) => {
    // TODO: Open view modal or navigate to user detail page
    toast.info(`Viewing ${user.firstName} ${user.lastName}`);
  };

  const handleToggleStatus = async (user) => {
    try {
      await dispatch(toggleUserStatus({
        id: user._id,
        isActive: !user.isActive
      })).unwrap();
    } catch (error) {
      // Error is handled by the slice
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleExportUsers = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon!');
  };

  const handleImportUsers = () => {
    // TODO: Implement import functionality
    toast.info('Import functionality coming soon!');
  };

  const handleFilterChange = (filters) => {
    dispatch(setFilters(filters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  if (loading && users?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage employees and their access to the system</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleImportUsers}
              className="btn-secondary flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button
              onClick={handleExportUsers}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleAddUser}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users?.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users?.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Salesmen</p>
              <p className="text-2xl font-bold text-gray-900">
                {users?.filter(u => u.role === 'salesman').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users?.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-sm rounded-lg">
        <UserList
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onView={handleViewUser}
          onToggleStatus={handleToggleStatus}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleUserCreated}
      />
    </>
  );
};

export default UserManagement;
