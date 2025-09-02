import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/axiosConfig';

// Async thunks for API calls
export const fetchClients = createAsyncThunk('clients/fetchClients', async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, search = '', area = '', status = '', limit = 20 } = params;
    let url = `/clients?page=${page}&search=${search}&limit=${limit}`;
    if (area) {
      url += `&area=${area}`;
    }
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
  }
});

export const deleteClientFetch = createAsyncThunk('clients/deleteClientFetch', async (clientId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/clients/${clientId}`);
    return clientId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete client');
  }
});

export const toggleClientStatusFetch = createAsyncThunk('clients/toggleClientStatusFetch', async (clientId, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/clients/${clientId}/toggle-status`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to toggle client status');
  }
});

export const createClientFetch = createAsyncThunk('clients/createClientFetch', async (clientData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create client');
  }
});

export const updateClientFetch = createAsyncThunk('clients/updateClientFetch', async ({ clientId, clientData }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/clients/${clientId}`, clientData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update client');
  }
});

const initialState = {
  clients: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  },
  loading: false,
  error: null
};

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    addClient: (state, action) => {
      state.clients.push(action.payload);
    },
    deleteClient: (state, action) => {
      state.clients = state.clients.filter(client => client._id !== action.payload);
    },
    toggleClientStatus: (state, action) => {
      const client = state.clients.find(c => c._id === action.payload);
      if (client) {
        client.isActive = !client.isActive;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.clients;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
          limit: 20
        };
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete client fetch
      .addCase(deleteClientFetch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClientFetch.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client._id !== action.payload);
      })
      .addCase(deleteClientFetch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle client status fetch
      .addCase(toggleClientStatusFetch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleClientStatusFetch.fulfilled, (state, action) => {
        state.loading = false;
        const client = state.clients.find(c => c._id === action.payload.data._id);
        if (client) {
          client.isActive = action.payload.data.isActive;
        }
      })
      .addCase(toggleClientStatusFetch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create client fetch
      .addCase(createClientFetch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientFetch.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.pagination.total++;
      })
      .addCase(createClientFetch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update client fetch
      .addCase(updateClientFetch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClientFetch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      .addCase(updateClientFetch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addClient, deleteClient, toggleClientStatus, clearError } = clientSlice.actions;
export const selectClients = (state) => state?.client?.clients || [];
export const selectClientsLoading = (state) => state?.client?.loading || false;
export const selectClientsError = (state) => state?.client?.error || null;
export const selectClientsPagination = (state) => state?.client?.pagination || {};
export default clientSlice.reducer;