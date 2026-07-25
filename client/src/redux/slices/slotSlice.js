import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchAvailableSlots = createAsyncThunk('slots/fetchAvailable', async ({ shopId, date }, { rejectWithValue }) => {
  try {
    const response = await API.get(`/consumer/slots?shopId=${shopId || ''}&date=${date || ''}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch slots.');
  }
});

export const bookTimeSlot = createAsyncThunk('slots/book', async (bookingPayload, { rejectWithValue, dispatch }) => {
  try {
    const response = await API.post('/consumer/slots/book', bookingPayload);
    dispatch(fetchAvailableSlots({ date: bookingPayload.date }));
    return response.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Slot booking failed.');
  }
});

export const cancelSlotBooking = createAsyncThunk('slots/cancel', async (bookingId, { rejectWithValue }) => {
  try {
    const response = await API.delete(`/consumer/slots/${bookingId}`);
    return response.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to cancel slot.');
  }
});

const slotSlice = createSlice({
  name: 'slots',
  initialState: {
    slots: [],
    targetDate: new Date().toISOString().slice(0, 10),
    activeBooking: null,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    setTargetDate: (state, action) => {
      state.targetDate = action.payload;
    },
    clearSlotMessage: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload.slots;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(bookTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBooking = action.payload;
        state.successMessage = 'Slot booked successfully!';
      })
      .addCase(bookTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setTargetDate, clearSlotMessage } = slotSlice.actions;
export default slotSlice.reducer;
