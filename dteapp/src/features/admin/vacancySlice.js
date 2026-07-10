import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vacancyService from '../../services/vacancyService';

export const fetchVacancyAssessment = createAsyncThunk(
  'vacancy/fetchAssessment',
  async ({ institution_id, course_id, academic_year }, { rejectWithValue }) => {
    try {
      return await vacancyService.getAssessment(institution_id, course_id, academic_year);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vacancy assessment');
    }
  }
);

export const runAIAnalysis = createAsyncThunk(
  'vacancy/aiAnalysis',
  async (params, { rejectWithValue }) => {
    try {
      return await vacancyService.aiAnalysis(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to run AI analysis');
    }
  }
);

export const suggestVacancy = createAsyncThunk(
  'vacancy/suggest',
  async (params, { rejectWithValue }) => {
    try {
      return await vacancyService.suggestVacancy(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate vacancy suggestion');
    }
  }
);

export const confirmVacancy = createAsyncThunk(
  'vacancy/confirm',
  async ({ institution_id, course_id, academic_year, data }, { rejectWithValue }) => {
    try {
      return await vacancyService.confirmVacancy(institution_id, course_id, academic_year, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm vacancy');
    }
  }
);

export const acknowledgeAnomaly = createAsyncThunk(
  'vacancy/acknowledgeAnomaly',
  async ({ anomaly_id, remarks }, { rejectWithValue }) => {
    try {
      return await vacancyService.acknowledgeAnomaly(anomaly_id, remarks);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to acknowledge anomaly');
    }
  }
);

const vacancySlice = createSlice({
  name: 'vacancy',
  initialState: {
    assessment: null,
    loading: false,
    suggesting: false,
    confirming: false,
    error: null,
  },
  reducers: {
    clearAssessment: (state) => {
      state.assessment = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assessment
      .addCase(fetchVacancyAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVacancyAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.assessment = action.payload?.data !== undefined ? action.payload.data : action.payload;
      })
      .addCase(fetchVacancyAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Suggest Vacancy
      .addCase(suggestVacancy.pending, (state) => {
        state.suggesting = true;
      })
      .addCase(suggestVacancy.fulfilled, (state, action) => {
        state.suggesting = false;
        state.assessment = action.payload?.data !== undefined ? action.payload.data : action.payload;
      })
      .addCase(suggestVacancy.rejected, (state, action) => {
        state.suggesting = false;
        state.error = action.payload;
      })
      // Run AI Analysis
      .addCase(runAIAnalysis.pending, (state) => {
        state.suggesting = true;
      })
      .addCase(runAIAnalysis.fulfilled, (state, action) => {
        state.suggesting = false;
        state.assessment = action.payload?.data !== undefined ? action.payload.data : action.payload;
      })
      .addCase(runAIAnalysis.rejected, (state, action) => {
        state.suggesting = false;
        state.error = action.payload;
      })
      // Confirm Vacancy
      .addCase(confirmVacancy.pending, (state) => {
        state.confirming = true;
      })
      .addCase(confirmVacancy.fulfilled, (state, action) => {
        state.confirming = false;
        state.assessment = action.payload?.data !== undefined ? action.payload.data : action.payload;
      })
      .addCase(confirmVacancy.rejected, (state, action) => {
        state.confirming = false;
        state.error = action.payload;
      })
      // Acknowledge Anomaly
      .addCase(acknowledgeAnomaly.pending, (state) => {
        state.loading = true;
      })
      .addCase(acknowledgeAnomaly.fulfilled, (state, action) => {
        state.loading = false;
        // Update the anomaly in the current assessment
        if (state.assessment && state.assessment.anomalies) {
          state.assessment.anomalies = state.assessment.anomalies.map(a => 
            a.id === action.meta.arg.anomaly_id ? { ...a, is_acknowledged: true } : a
          );
        }
      })
      .addCase(acknowledgeAnomaly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAssessment } = vacancySlice.actions;
export default vacancySlice.reducer;
