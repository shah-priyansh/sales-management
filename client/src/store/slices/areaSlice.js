import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  areas: [
    {
      _id: '1',
      name: 'Area 1',
      description: 'Central business district area',
      city: 'New York',
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      _id: '2',
      name: 'Area 2',
      description: 'Suburban residential area',
      city: 'Los Angeles',
      isActive: true,
      createdAt: '2024-01-10'
    },
    {
      _id: '3',
      name: 'Area 3',
      description: 'Industrial zone',
      city: 'Chicago',
      isActive: false,
      createdAt: '2024-01-05'
    }
  ],
  loading: false
};

const areaSlice = createSlice({
  name: 'areas',
  initialState,
  reducers: {
    addArea: (state, action) => {
      state.areas.push(action.payload);
    },
    deleteArea: (state, action) => {
      state.areas = state.areas.filter(area => area._id !== action.payload);
    },
    toggleAreaStatus: (state, action) => {
      const area = state.areas.find(a => a._id === action.payload);
      if (area) {
        area.isActive = !area.isActive;
      }
    },
    updateArea: (state, action) => {
      const index = state.areas.findIndex(area => area._id === action.payload._id);
      if (index !== -1) {
        state.areas[index] = action.payload;
      }
    }
  }
});

export const { addArea, deleteArea, toggleAreaStatus, updateArea } = areaSlice.actions;
export const selectAreas = (state) => state?.areas?.areas || [];
export default areaSlice.reducer;
