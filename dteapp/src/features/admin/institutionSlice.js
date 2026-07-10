import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { institutionService, createIntake as createIntakeApi, addCourse as addCourseApi } from '../../services/institutionService';

export const fetchInstitutions = createAsyncThunk(
  'institutions/fetchAll',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      return await institutionService.getInstitutions(page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institutions');
    }
  }
);

export const createInstitution = createAsyncThunk(
  'institutions/create',
  async (institutionData, { rejectWithValue, dispatch }) => {
    try {
      const data = await institutionService.createInstitution(institutionData);
      dispatch(fetchInstitutions({ page: 1, limit: 10 })); // Refresh list
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create institution');
    }
  }
);

export const updateInstitution = createAsyncThunk(
  'institutions/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const result = await institutionService.updateInstitution(id, data);
      dispatch(fetchInstitutions({ page: 1, limit: 10 })); // Refresh list
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update institution');
    }
  }
);

export const deleteInstitution = createAsyncThunk(
  'institutions/deleteInstitution',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[DELETE THUNK] Calling institutionService.deleteInstitution with id:', id);
      const response = await institutionService.deleteInstitution(id);
      console.log('[DELETE THUNK] API response:', response);
      return id;
    } catch (error) {
      console.error('[DELETE THUNK] API error:', error);
      console.error('[DELETE THUNK] Error response:', error.response);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete institution');
    }
  }
);

export const addCourse = createAsyncThunk(
  'institutions/addCourse',
  async ({ institutionId, courseData }, { rejectWithValue, dispatch }) => {
    try {
      const data = await addCourseApi(institutionId, courseData);
      dispatch(fetchInstitutions({ page: 1, limit: 10 })); // Refresh to get updated course list
      return { institutionId, course: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add course');
    }
  }
);

export const createIntake = createAsyncThunk(
  'institutions/createIntake',
  async (intakeData, { rejectWithValue }) => {
    try {
      console.log('API Call: POST /requirements/intake', intakeData);
      const response = await createIntakeApi(intakeData);
      return response;
    } catch (error) {
      console.error('FULL API ERROR:', error);
      if (error.response) {
        console.error('API Error Response Data:', error.response.data);
      } else {
        console.error('No response received. Check network or CORS.');
      }
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message ||
        'Failed to create intake'
      );
    }
  }
);

const institutionSlice = createSlice({
  name: 'institutions',
  initialState: {
    institutions: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Institutions
      .addCase(fetchInstitutions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInstitutions.fulfilled, (state, action) => {
        state.loading = false;
        state.institutions = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchInstitutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Institution
      .addCase(createInstitution.fulfilled, (state, action) => {
        state.institutions.unshift(action.payload);
      })
      // Update Institution
      .addCase(updateInstitution.fulfilled, (state, action) => {
        const index = state.institutions.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.institutions[index] = action.payload;
        }
      })
      // Delete Institution
      .addCase(deleteInstitution.fulfilled, (state, action) => {
        state.institutions = state.institutions.filter(i => i.id !== action.payload);
      })
      // Add Course
      .addCase(addCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.institutions.findIndex(i => i.id === action.payload.institutionId);
        if (index !== -1) {
          if (!state.institutions[index].courses) {
            state.institutions[index].courses = [];
          }
          state.institutions[index].courses.push(action.payload.course);
        }
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Intake
      .addCase(createIntake.pending, (state) => {
        state.loading = true;
      })
      .addCase(createIntake.fulfilled, (state) => {
        state.loading = false;
        // Intake is created, we might want to refresh data or just show success
      })
      .addCase(createIntake.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default institutionSlice.reducer;
