import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const savedToken = localStorage.getItem('smart_pds_token') || null;
const savedUser = JSON.parse(localStorage.getItem('smart_pds_user') || 'null');

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('smart_pds_token', token);
    localStorage.setItem('smart_pds_user', JSON.stringify(user));
    return { token, user };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed.');
  }
});

export const registerDistributor = createAsyncThunk('auth/registerDistributor', async (data, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/distributor/register', data);
    const { token, user, message } = response.data;
    localStorage.setItem('smart_pds_token', token);
    localStorage.setItem('smart_pds_user', JSON.stringify(user));
    return { token, user, message };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.details?.[0] || 'Registration failed.');
  }
});

export const registerConsumer = createAsyncThunk('auth/registerConsumer', async (data, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/consumer/register', data);
    const { token, user, message } = response.data;
    localStorage.setItem('smart_pds_token', token);
    localStorage.setItem('smart_pds_user', JSON.stringify(user));
    return { token, user, message };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.details?.[0] || 'Registration failed.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken,
    user: savedUser,
    loading: false,
    error: null,
    registrationMessage: null
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      state.registrationMessage = null;
      localStorage.removeItem('smart_pds_token');
      localStorage.removeItem('smart_pds_user');
    },
    clearAuthError: (state) => {
      state.error = null;
      state.registrationMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Distributor Register
      .addCase(registerDistributor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerDistributor.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.registrationMessage = action.payload.message;
      })
      .addCase(registerDistributor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Consumer Register
      .addCase(registerConsumer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerConsumer.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.registrationMessage = action.payload.message;
      })
      .addCase(registerConsumer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
