import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || '';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/users`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user';
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user';
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/users/${id}`);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      return rejectWithValue(message);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/api/users/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user status';
      return rejectWithValue(message);
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'users/resetUserPassword',
  async ({ id, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/${id}/reset-password`, { newPassword });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
  selectedUser: null,
  filters: {
    role: 'all',
    status: 'all',
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        role: 'all',
        status: 'all',
        search: ''
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.error = null;
        toast.success('User created successfully!');
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
        toast.success('User updated successfully!');
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        state.error = null;
        toast.success('User deleted successfully!');
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Toggle user status
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
        toast.success('User status updated successfully!');
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Reset user password
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        toast.success('Password reset successfully!');
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { 
  clearError, 
  setSelectedUser, 
  clearSelectedUser, 
  setFilters, 
  clearFilters, 
  setPagination 
} = userSlice.actions;

// Selectors
export const selectUsers = (state) => state?.users?.users || [];
export const selectUsersLoading = (state) => state?.users?.loading;
export const selectUsersError = (state) => state.users?.error;
export const selectSelectedUser = (state) => state?.users?.selectedUser;
export const selectUserFilters = (state) => state?.users?.filters;
export const selectUserPagination = (state) => state?.users?.pagination;

// Filtered users selector
export const selectFilteredUsers = (state) => {
  const { users, filters } = state?.users || [];
  
  return (users || [])?.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.phone?.includes(filters.search);
    
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.isActive === (filters.status === 'active');
    
    return matchesSearch && matchesRole && matchesStatus;
  });
};

export default userSlice.reducer;
