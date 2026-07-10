import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const getFaculties = createAsyncThunk(
  'faculty/getFaculties',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.institution_id) queryParams.append('institution_id', params.institution_id);
      if (params.course_id) queryParams.append('course_id', params.course_id);
      if (params.academic_year) queryParams.append('academic_year', params.academic_year);
      if (params.page) queryParams.append('page', params.page);
      
      const requestedLimit = params.limit ? parseInt(params.limit, 10) : 10;
      const safeLimit = Math.min(requestedLimit, 100);
      queryParams.append('limit', safeLimit);

      const response = await api.get(`/vacancies/faculty?${queryParams.toString()}`);
      return response.data; // { status, data: [], total, total_pages, current_page }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch faculties');
    }
  }
);

export const getAppointedFaculties = createAsyncThunk(
  'faculty/getAppointedFaculties',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.academic_year) queryParams.append('academic_year', params.academic_year);
      if (params.course_id) queryParams.append('course_id', params.course_id);
      queryParams.append('status', 'ACCEPTED');
      queryParams.append('size', '100'); // Max limit allowed by backend
      
      const response = await api.get(`/appointments/list?${queryParams.toString()}`);
      return response.data?.data?.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch appointed faculties');
    }
  }
);

export const addFaculty = createAsyncThunk(
  'faculty/addFaculty',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/vacancies/faculty', payload);
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add faculty');
    }
  }
);

export const updateFaculty = createAsyncThunk(
  'faculty/updateFaculty',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vacancies/faculty/${id}`, payload);
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update faculty');
    }
  }
);

export const deleteFaculty = createAsyncThunk(
  'faculty/deleteFaculty',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/vacancies/faculty/${id}?reason=REMOVED_BY_PRINCIPAL`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete faculty');
    }
  }
);

const facultySlice = createSlice({
  name: 'faculty',
  initialState: {
    facultyList: [], // Existing faculties (for vacancy step)
    chbFacultyList: [], // Appointed CHB faculties (for work logs & billing)
    loading: false,
    error: null,
    totalResults: 0,
    totalPages: 1,
    currentPage: 1
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Faculties
      .addCase(getFaculties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFaculties.fulfilled, (state, action) => {
        state.loading = false;
        state.facultyList = Array.isArray(action.payload?.data) ? action.payload.data : [];
        state.totalResults = action.payload?.total || state.facultyList.length;
        state.totalPages = action.payload?.total_pages || 1;
        state.currentPage = action.payload?.current_page || 1;
      })
      .addCase(getFaculties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.facultyList = [];
      })
      // Get Appointed Faculties
      .addCase(getAppointedFaculties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointedFaculties.fulfilled, (state, action) => {
        state.loading = false;
        state.chbFacultyList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAppointedFaculties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.chbFacultyList = [];
      })
      // Add Faculty
      .addCase(addFaculty.fulfilled, (state, action) => {
        // Option 1: Add to local state (immediate UI update)
        if (action.payload && action.payload.id) {
          state.facultyList = [action.payload, ...state.facultyList];
          state.totalResults += 1;
        }
      })
      // Update Faculty
      .addCase(updateFaculty.fulfilled, (state, action) => {
        if (action.payload && action.payload.id) {
          state.facultyList = state.facultyList.map(f => 
            f.id === action.payload.id ? { ...f, ...action.payload } : f
          );
        }
      })
      // Delete Faculty
      .addCase(deleteFaculty.fulfilled, (state, action) => {
        state.facultyList = state.facultyList.filter(f => f.id !== action.payload);
        state.totalResults -= 1;
      });
  }
});

export const { clearError } = facultySlice.actions;
export default facultySlice.reducer;
