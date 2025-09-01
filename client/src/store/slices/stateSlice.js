import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchStates = createAsyncThunk(
    'states/fetchStates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/v1/states');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch states');
        }
    }
);

export const fetchStateById = createAsyncThunk(
    'states/fetchStateById',
    async (stateId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/v1/states/${stateId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch state');
        }
    }
);

const initialState = {
    states: [],
    selectedState: null,
    loading: false,
    error: null,
    success: null
};

const stateSlice = createSlice({
    name: 'states',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        setSelectedState: (state, action) => {
            state.selectedState = action.payload;
        },
        clearSelectedState: (state) => {
            state.selectedState = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch states
            .addCase(fetchStates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.loading = false;
                state.states = action.payload;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch state by ID
            .addCase(fetchStateById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStateById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedState = action.payload;
            })
            .addCase(fetchStateById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
});

export const { clearError, clearSuccess, setSelectedState, clearSelectedState } = stateSlice.actions;
export default stateSlice.reducer;
