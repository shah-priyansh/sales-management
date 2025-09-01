import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

// Async thunks
export const fetchClients = createAsyncThunk(
  'client/fetchClients',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get('/api/clients', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch clients';
      return rejectWithValue(message);
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'client/fetchClientById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/clients/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch client';
      return rejectWithValue(message);
    }
  }
);

export const createClient = createAsyncThunk(
  'client/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/clients', clientData);
      toast.success('Client created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create client';
      return rejectWithValue(message);
    }
  }
);

export const updateClient = createAsyncThunk(
  'client/updateClient',
  async ({ id, clientData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/clients/${id}`, clientData);
      toast.success('Client updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update client';
      return rejectWithValue(message);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'client/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/clients/${id}`);
      toast.success('Client deactivated successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deactivate client';
      return rejectWithValue(message);
    }
  }
);

export const assignSalesman = createAsyncThunk(
  'client/assignSalesman',
  async ({ id, salesmanId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/clients/${id}/assign-salesman`, { salesmanId });
      toast.success('Salesman assigned successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign salesman';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  clients: [],
  totalClients: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  currentClient: null,
  filters: {
    area: '',
    status: '',
    search: '',
  },
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentClient: (state, action) => {
      state.currentClient = action.payload;
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        area: '',
        status: '',
        search: '',
      };
    },
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
        state.totalClients = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch client by ID
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClient = action.payload;
        state.error = null;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Create client
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.unshift(action.payload);
        state.totalClients += 1;
        state.error = null;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update client
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.currentClient?._id === action.payload._id) {
          state.currentClient = action.payload;
        }
        state.error = null;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete client
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client._id === action.payload);
        if (index !== -1) {
          state.clients[index].isActive = false;
        }
        state.error = null;
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Assign salesman
      .addCase(assignSalesman.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignSalesman.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.currentClient?._id === action.payload._id) {
          state.currentClient = action.payload;
        }
        state.error = null;
      })
      .addCase(assignSalesman.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { 
  clearError, 
  setCurrentClient, 
  clearCurrentClient, 
  setFilters, 
  clearFilters 
} = clientSlice.actions;

// Selectors
export const selectClients = (state) => state.client.clients;
export const selectClientLoading = (state) => state.client.loading;
export const selectClientError = (state) => state.client.error;
export const selectTotalClients = (state) => state.client.totalClients;
export const selectCurrentPage = (state) => state.client.currentPage;
export const selectTotalPages = (state) => state.client.totalPages;
export const selectCurrentClient = (state) => state.client.currentClient;
export const selectClientFilters = (state) => state.client.filters;

export default clientSlice.reducer;
