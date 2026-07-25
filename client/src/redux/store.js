import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import rationBookReducer from './slices/rationBookSlice';
import slotReducer from './slices/slotSlice';
import eposReducer from './slices/eposSlice';
import complaintReducer from './slices/complaintSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rationBook: rationBookReducer,
    slots: slotReducer,
    epos: eposReducer,
    complaints: complaintReducer,
    admin: adminReducer
  }
});
