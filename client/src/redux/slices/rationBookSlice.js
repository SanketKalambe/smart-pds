import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchDigitalRationBook = createAsyncThunk('rationBook/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/consumer/ration-book');
    return response.data.digitalRationBook;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch ration book.');
  }
});

export const addFamilyMember = createAsyncThunk('rationBook/addMember', async (memberData, { rejectWithValue, dispatch }) => {
  try {
    const response = await API.patch('/consumer/family-members', memberData);
    dispatch(fetchDigitalRationBook());
    return response.data.member;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to add family member.');
  }
});

const rationBookSlice = createSlice({
  name: 'rationBook',
  initialState: {
    bookData: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDigitalRationBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDigitalRationBook.fulfilled, (state, action) => {
        state.loading = false;
        state.bookData = action.payload;
      })
      .addCase(fetchDigitalRationBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default rationBookSlice.reducer;
