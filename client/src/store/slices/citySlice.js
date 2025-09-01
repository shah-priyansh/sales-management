import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/v1/cities');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cities');
    }
  }
);

export const fetchCitiesByState = createAsyncThunk(
  'cities/fetchCitiesByState',
  async (stateId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/v1/cities/state/${stateId}`);
      return {
        cities: response.data.data,
        state: response.data.state
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cities by state');
    }
  }
);

const initialState = {
  cities: [],
  citiesByState: [],
  selectedCity: null,
  selectedStateForCities: null,
  loading: false,
  error: null,
  success: null
};

const citySlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
    },
    clearSelectedCity: (state) => {
      state.selectedCity = null;
    },
    clearCitiesByState: (state) => {
      state.citiesByState = [];
      state.selectedStateForCities = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cities
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch cities by state
      .addCase(fetchCitiesByState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCitiesByState.fulfilled, (state, action) => {
        state.loading = false;
        state.citiesByState = action.payload.cities;
        state.selectedStateForCities = action.payload.state;
      })
      .addCase(fetchCitiesByState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
     
  }
});

export const { 
  clearError, 
  clearSuccess, 
  setSelectedCity, 
  clearSelectedCity, 
  clearCitiesByState 
} = citySlice.actions;
export default citySlice.reducer;
