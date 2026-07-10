import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import selectionService from '../../services/selectionService';
import { toast } from 'react-hot-toast';

export const fetchShortlisted = createAsyncThunk(
  'selection/fetchShortlisted',
  async (advertisementId, { rejectWithValue }) => {
    try {
      return await selectionService.getShortlisted(advertisementId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch shortlisted candidates');
    }
  }
);

export const shortlistCandidates = createAsyncThunk(
  'selection/shortlist',
  async ({ advertisementId, applicationIds, remarks }, { rejectWithValue }) => {
    try {
      const response = await selectionService.shortlistCandidates(advertisementId, applicationIds, remarks);
      toast.success('Candidates shortlisted successfully');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to shortlist candidates');
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to shortlist candidates');
    }
  }
);

export const enterMarks = createAsyncThunk(
  'selection/enterMarks',
  async (markData, { rejectWithValue }) => {
    try {
      const response = await selectionService.enterMarks(markData);
      toast.success('Marks saved successfully');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to save marks');
    }
  }
);

export const updateMarks = createAsyncThunk(
  'selection/updateMarks',
  async ({ markId, markData }, { rejectWithValue }) => {
    try {
      const response = await selectionService.updateMarks(markId, markData);
      toast.success('Marks updated successfully');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update marks');
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update marks');
    }
  }
);

export const markAttendance = createAsyncThunk(
  'selection/markAttendance',
  async ({ advertisementId, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await selectionService.markAttendance(advertisementId, attendanceData);
      toast.success('Attendance updated');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update attendance');
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update attendance');
    }
  }
);

export const generateRankings = createAsyncThunk(
  'selection/generateRankings',
  async (advertisementId, { rejectWithValue }) => {
    try {
      const response = await selectionService.generateRankings(advertisementId);
      toast.success('Rankings generated successfully');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate rankings');
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to generate rankings');
    }
  }
);

export const fetchRankedList = createAsyncThunk(
  'selection/fetchRankedList',
  async (advertisementId, { rejectWithValue }) => {
    try {
      return await selectionService.getRankedList(advertisementId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch shortlisted candidates');
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  'selection/fetchDashboard',
  async (advertisementId, { rejectWithValue }) => {
    try {
      return await selectionService.getDashboard(advertisementId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch shortlisted candidates');
    }
  }
);

export const runAiAnalysis = createAsyncThunk(
  'selection/runAiAnalysis',
  async (advertisementId, { rejectWithValue }) => {
    try {
      const response = await selectionService.runAiAnalysis(advertisementId);
      toast.success('AI Analysis completed');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI Analysis failed');
      return rejectWithValue(err.response?.data?.message || err.message || 'AI Analysis failed');
    }
  }
);

export const createAiSnapshot = createAsyncThunk(
  'selection/createAiSnapshot',
  async (advertisementId, { rejectWithValue }) => {
    try {
      const response = await selectionService.createAiSnapshot(advertisementId);
      toast.success('AI Audit Snapshot created');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create AI snapshot');
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create AI snapshot');
    }
  }
);

export const fetchWeights = createAsyncThunk(
  'selection/fetchWeights',
  async ({ courseId, level, advertisementId }, { rejectWithValue }) => {
    try {
      return await selectionService.getWeights(courseId, level, advertisementId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch shortlisted candidates');
    }
  }
);

export const overrideWeights = createAsyncThunk(
  'selection/overrideWeights',
  async ({ advertisementId, weightData }, { rejectWithValue }) => {
    try {
      const response = await selectionService.overrideWeights(advertisementId, weightData);
      toast.success('Scoring weights updated for this ad');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update weights');
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update weights');
    }
  }
);

export const confirmSelection = createAsyncThunk(
  'selection/confirm',
  async ({ advertisementId, remarks }, { rejectWithValue }) => {
    try {
      const response = await selectionService.confirmSelection(advertisementId, remarks);
      toast.success('Selection confirmed and locked');
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm selection');
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to confirm selection');
    }
  }
);

const selectionSlice = createSlice({
  name: 'selection',
  initialState: {
    shortlisted: [],
    rankedList: [],
    dashboard: null,
    loading: false,
    marking: false,
    ranking: false,
    weights: null,
    error: null,
  },
  reducers: {
    clearSelectionState: (state) => {
      state.shortlisted = [];
      state.rankedList = [];
      state.dashboard = null;
      state.weights = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Weights
      .addCase(fetchWeights.fulfilled, (state, action) => {
        state.weights = action.payload.data || action.payload;
      })
      // Fetch Shortlisted
      .addCase(fetchShortlisted.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShortlisted.fulfilled, (state, action) => {
        state.loading = false;
        state.shortlisted = action.payload.data || action.payload;
      })
      .addCase(fetchShortlisted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Ranked List
      .addCase(fetchRankedList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRankedList.fulfilled, (state, action) => {
        state.loading = false;
        state.rankedList = action.payload.data || action.payload;
      })
      .addCase(fetchRankedList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data || action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm Selection
      .addCase(confirmSelection.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmSelection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmSelection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSelectionState } = selectionSlice.actions;
export default selectionSlice.reducer;
