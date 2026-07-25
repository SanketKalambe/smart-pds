import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchVerificationQueue = createAsyncThunk('admin/fetchQueue', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/admin/verification-queue');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch verification queue.');
  }
});

export const updateVerificationStatus = createAsyncThunk('admin/updateStatus', async ({ userId, status, remarks }, { rejectWithValue, dispatch }) => {
  try {
    const response = await API.patch(`/admin/verification-queue/${userId}`, { status, remarks });
    dispatch(fetchVerificationQueue());
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update status.');
  }
});

export const fetchAdminReports = createAsyncThunk('admin/fetchReports', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/admin/reports');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch reports.');
  }
});

export const allocateStock = createAsyncThunk('admin/allocateStock', async (allocationData, { rejectWithValue }) => {
  try {
    const response = await API.post('/admin/stock-allocation', allocationData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to allocate stock.');
  }
});

export const updateSettings = createAsyncThunk('admin/updateSettings', async (settingsData, { rejectWithValue }) => {
  try {
    const response = await API.put('/admin/settings', settingsData);
    return response.data.settings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update settings.');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    verificationQueue: { distributors: [], consumers: [], pendingCount: 0 },
    reports: null,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerificationQueue.fulfilled, (state, action) => {
        state.verificationQueue = action.payload;
      })
      .addCase(fetchAdminReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      })
      .addCase(allocateStock.fulfilled, (state) => {
        state.successMessage = 'Stock allocated successfully!';
      });
  }
});

export default adminSlice.reducer;
