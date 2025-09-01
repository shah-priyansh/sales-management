import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      role: 'admin',
      isActive: true,
      area: null,
      createdAt: '2024-01-15'
    },
    {
      _id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      role: 'salesman',
      isActive: true,
      area: 'Area 1',
      createdAt: '2024-01-10'
    },
    {
      _id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1234567892',
      role: 'salesman',
      isActive: false,
      area: 'Area 2',
      createdAt: '2024-01-05'
    }
  ],
  loading: false
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
    }
  }
});

export const { addUser, deleteUser, toggleUserStatus } = userSlice.actions;
export const selectUsers = (state) => state?.users?.users || [];
export default userSlice.reducer;
