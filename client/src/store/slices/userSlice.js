import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiClient from '../../utils/axiosConfig';

const API_URL = process.env.REACT_APP_API_URL;

// Async thunks for API calls
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/admin/users');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const deleteUserFetch = createAsyncThunk('users/deleteUserFetch', async (userId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/admin/users/${userId}`);
    return userId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

export const toggleUserStatusFetch = createAsyncThunk('users/toggleUserStatusFetch', async (userId, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status');
  }
});

export const createUserFetch = createAsyncThunk('users/createUserFetch', async (userData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create user');
  }
});

const initialState = {
  users: [],
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter(user => user._id !== action.payload);
    },
    toggleUserStatus: (state, action) => {
      const user = state.users.find(u => u._id === action.payload);
      if (user) {
        user.isActive = !user.isActive;
      }
    },
    clearError: (state) => {
      state.error = null;
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
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user fetch
      .addCase(deleteUserFetch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserFetch.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(deleteUserFetch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle user status fetch
      .addCase(toggleUserStatusFetch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatusFetch.fulfilled, (state, action) => {
        state.loading = false;
        const user = state.users.find(u => u._id === action.payload._id);
        if (user) {
          user.isActive = action.payload.isActive;
        }
      })
      .addCase(toggleUserStatusFetch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create user fetch
      .addCase(createUserFetch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserFetch.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUserFetch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addUser, deleteUser, toggleUserStatus, clearError } = userSlice.actions;
export const selectUsers = (state) => state?.users?.users || [];
export const selectUsersLoading = (state) => state?.users?.loading || false;
export const selectUsersError = (state) => state?.users?.error || null;
export default userSlice.reducer;
