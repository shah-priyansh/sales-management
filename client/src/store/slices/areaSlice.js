import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

// Async thunks
export const fetchAreas = createAsyncThunk(
  'area/fetchAreas',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/areas', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch areas';
      return rejectWithValue(message);
    }
  }
);

export const fetchAreaById = createAsyncThunk(
  'area/fetchAreaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/areas/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch area';
      return rejectWithValue(message);
    }
  }
);

export const createArea = createAsyncThunk(
  'area/createArea',
  async (areaData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/areas', areaData);
      toast.success('Area created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create area';
      return rejectWithValue(message);
    }
  }
);

export const updateArea = createAsyncThunk(
  'area/updateArea',
  async ({ id, areaData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/areas/${id}`, areaData);
      toast.success('Area updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update area';
      return rejectWithValue(message);
    }
  }
);

export const deleteArea = createAsyncThunk(
  'area/deleteArea',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/areas/${id}`);
      toast.success('Area deactivated successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deactivate area';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  areas: [],
  totalAreas: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  currentArea: null,
  filters: {
    city: '',
    state: '',
    search: '',
  },
};

const areaSlice = createSlice({
  name: 'area',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentArea: (state, action) => {
      state.currentArea = action.payload;
    },
    clearCurrentArea: (state) => {
      state.currentArea = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        city: '',
        state: '',
        search: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch areas
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload.areas;
        state.totalAreas = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch area by ID
      .addCase(fetchAreaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreaById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArea = action.payload;
        state.error = null;
      })
      .addCase(fetchAreaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Create area
      .addCase(createArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArea.fulfilled, (state, action) => {
        state.loading = false;
        state.areas.unshift(action.payload);
        state.totalAreas += 1;
        state.error = null;
      })
      .addCase(createArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update area
      .addCase(updateArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArea.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.areas.findIndex(area => area._id === action.payload._id);
        if (index !== -1) {
          state.areas[index] = action.payload;
        }
        if (state.currentArea?._id === action.payload._id) {
          state.currentArea = action.payload;
        }
        state.error = null;
      })
      .addCase(updateArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete area
      .addCase(deleteArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArea.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.areas.findIndex(area => area._id === action.payload);
        if (index !== -1) {
          state.areas[index].isActive = false;
        }
        state.error = null;
      })
      .addCase(deleteArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { 
  clearError, 
  setCurrentArea, 
  clearCurrentArea, 
  setFilters, 
  clearFilters 
} = areaSlice.actions;

// Selectors
export const selectAreas = (state) => state.area.areas;
export const selectAreaLoading = (state) => state.area.loading;
export const selectAreaError = (state) => state.area.error;
export const selectTotalAreas = (state) => state.area.totalAreas;
export const selectCurrentPage = (state) => state.area.currentPage;
export const selectTotalPages = (state) => state.area.totalPages;
export const selectCurrentArea = (state) => state.area.currentArea;
export const selectAreaFilters = (state) => state.area.filters;

export default areaSlice.reducer;
