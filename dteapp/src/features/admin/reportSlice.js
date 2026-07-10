import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from '../../services/reportService';

export const fetchAttendanceReport = createAsyncThunk(
  'reports/fetchAttendance',
  async (params, { rejectWithValue }) => {
    try {
      return await reportService.getAttendanceReport(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch attendance report');
    }
  }
);

export const fetchBillingReport = createAsyncThunk(
  'reports/fetchBilling',
  async (params, { rejectWithValue }) => {
    try {
      return await reportService.getBillingReport(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch billing report');
    }
  }
);

export const fetchPerformanceReport = createAsyncThunk(
  'reports/fetchPerformance',
  async (params, { rejectWithValue }) => {
    try {
      return await reportService.getFacultyPerformance(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch performance report');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    attendanceData: null,
    billingData: null,
    performanceData: null,
    loading: false,
    error: null
  },
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.loading = false;
          if (action.type.includes('fetchAttendance')) state.attendanceData = action.payload.data || action.payload;
          if (action.type.includes('fetchBilling')) state.billingData = action.payload.data || action.payload;
          if (action.type.includes('fetchPerformance')) state.performanceData = action.payload.data || action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearReportError } = reportSlice.actions;
export default reportSlice.reducer;
