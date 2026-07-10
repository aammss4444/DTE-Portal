import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { institutionService } from '../../services/institutionService';

export const generateRequirements = createAsyncThunk(
  'requirements/generate',
  async (data, { rejectWithValue }) => {
    try {
      return await institutionService.generateRequirements(data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate requirements');
    }
  }
);

export const validateInstitutionalRequirements = createAsyncThunk(
  'requirements/validateInstitutional',
  async (data, { rejectWithValue }) => {
    try {
      return await institutionService.validateRequirements(data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate requirements');
    }
  }
);

export const askAIAssistant = createAsyncThunk(
  'requirements/askAI',
  async (data, { rejectWithValue }) => {
    try {
      return await institutionService.aiQuery(data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'AI Assistant failed to respond');
    }
  }
);

const requirementSlice = createSlice({
  name: 'requirements',
  initialState: {
    results: {}, // course_id -> requirement_data
    validationResult: null,
    loading: false,
    validationLoading: false,
    aiLoading: false,
    aiResponse: null,
    error: null,
    success: false,
  },
  reducers: {
    clearRequirementStatus: (state) => {
      state.success = false;
      state.error = null;
      state.validationResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateRequirements.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(generateRequirements.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(generateRequirements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(validateInstitutionalRequirements.pending, (state) => {
        state.validationLoading = true;
        state.error = null;
      })
      .addCase(validateInstitutionalRequirements.fulfilled, (state, action) => {
        state.validationLoading = false;
        state.validationResult = action.payload.data;
      })
      .addCase(validateInstitutionalRequirements.rejected, (state, action) => {
        state.validationLoading = false;
        state.error = action.payload;
      })
      .addCase(askAIAssistant.pending, (state) => {
        state.aiLoading = true;
        state.error = null;
      })
      .addCase(askAIAssistant.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.aiResponse = action.payload;
      })
      .addCase(askAIAssistant.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRequirementStatus } = requirementSlice.actions;
export default requirementSlice.reducer;
