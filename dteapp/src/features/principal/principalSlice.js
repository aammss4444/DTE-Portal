import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import principalService from '../../services/principalService';
import attendanceService from '../../services/attendanceService';
import { toast } from 'react-hot-toast';

export const fetchDashboardData = createAsyncThunk(
  'principal/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await principalService.getDashboardData();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
    }
  }
);

export const setInstituteLocation = createAsyncThunk(
  'principal/setLocation',
  async ({ latitude, longitude }, { rejectWithValue }) => {
    try {
      return await principalService.setInstituteLocation(latitude, longitude);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchFaceUpdateRequests = createAsyncThunk(
  'principal/fetchFaceUpdateRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await attendanceService.getFaceUpdateRequests();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch face update requests');
    }
  }
);

export const reviewFaceUpdateRequest = createAsyncThunk(
  'principal/reviewFaceUpdateRequest',
  async ({ requestId, action, remarks }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.reviewFaceUpdateRequest(requestId, action, remarks);
      toast.success(`Request ${action.toLowerCase()}d successfully`);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to review request';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const principalSlice = createSlice({
  name: 'principal',
  initialState: {
    dashboardData: null,
    faceUpdateRequests: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setInstituteLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(setInstituteLocation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setInstituteLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFaceUpdateRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFaceUpdateRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.faceUpdateRequests = action.payload.data || action.payload;
      })
      .addCase(fetchFaceUpdateRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(reviewFaceUpdateRequest.fulfilled, (state, action) => {
        // Find and update the request in the list
        const updatedRequest = action.payload.data || action.payload;
        const index = state.faceUpdateRequests.findIndex(r => r.id === updatedRequest.id);
        if (index !== -1) {
          state.faceUpdateRequests[index] = updatedRequest;
        }
      });
  },
});

export default principalSlice.reducer;
