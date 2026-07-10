import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { institutionService } from '../../services/institutionService';

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async ({ page, limit, institutionId } = { page: 1, limit: 50, institutionId: null }, { rejectWithValue }) => {
    try {
      return await institutionService.getCourses(page, limit, institutionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourseDetails = createAsyncThunk(
  'courses/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      return await institutionService.getCourseDetails(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course details');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const result = await institutionService.updateCourse(id, data);
      dispatch(fetchCourses()); // Refresh
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await institutionService.deleteCourse(id);
      dispatch(fetchCourses()); // Refresh
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    pagination: null,
    selectedCourse: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCourseDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;
