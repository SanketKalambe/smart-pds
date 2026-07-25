import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const scanConsumerCard = createAsyncThunk('epos/scan', async (rationCardNo, { rejectWithValue }) => {
  try {
    const response = await API.post('/distributor/epos/scan', { rationCardNo });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Ration card scan failed.');
  }
});

export const verifyFingerprint = createAsyncThunk('epos/verifyFingerprint', async (payload, { rejectWithValue }) => {
  try {
    const response = await API.post('/distributor/epos/verify', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Biometric verification failed.');
  }
});

export const dispenseRation = createAsyncThunk('epos/dispense', async (payload, { rejectWithValue }) => {
  try {
    const response = await API.post('/distributor/epos/dispense', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Dispense operation failed.');
  }
});

export const generateReceipt = createAsyncThunk('epos/receipt', async (transactionId, { rejectWithValue }) => {
  try {
    const response = await API.post('/distributor/epos/receipt', { transactionId });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Receipt generation failed.');
  }
});

const eposSlice = createSlice({
  name: 'epos',
  initialState: {
    currentStep: 1, // 1: SCAN, 2: BIOMETRIC, 3: QUOTA_DISPENSE, 4: PAYMENT, 5: RECEIPT
    scanData: null,
    entitlement: [],
    bioVerification: null,
    dispenseData: null,
    receiptData: null,
    loading: false,
    error: null
  },
  reducers: {
    resetEposState: (state) => {
      state.currentStep = 1;
      state.scanData = null;
      state.entitlement = [];
      state.bioVerification = null;
      state.dispenseData = null;
      state.receiptData = null;
      state.error = null;
    },
    setEposStep: (state, action) => {
      state.currentStep = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Scan
      .addCase(scanConsumerCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanConsumerCard.fulfilled, (state, action) => {
        state.loading = false;
        state.scanData = action.payload;
        state.entitlement = action.payload.entitlement;
        state.currentStep = 2; // Move to Biometric Verify
      })
      .addCase(scanConsumerCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Fingerprint
      .addCase(verifyFingerprint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyFingerprint.fulfilled, (state, action) => {
        state.loading = false;
        state.bioVerification = action.payload;
        state.currentStep = 3; // Move to Quota & Dispense
      })
      .addCase(verifyFingerprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Dispense
      .addCase(dispenseRation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dispenseRation.fulfilled, (state, action) => {
        state.loading = false;
        state.dispenseData = action.payload;
        state.currentStep = 4; // Move to Payment & Receipt
      })
      .addCase(dispenseRation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Receipt
      .addCase(generateReceipt.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receiptData = action.payload;
        state.currentStep = 5; // Receipt displayed
      });
  }
});

export const { resetEposState, setEposStep } = eposSlice.actions;
export default eposSlice.reducer;
