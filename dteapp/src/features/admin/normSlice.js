import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { institutionService } from '../../services/institutionService';

export const createNorm = createAsyncThunk(
  'norms/create',
  async (normData, { rejectWithValue }) => {
    try {
      return await institutionService.createNorm(normData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail?.message || 
        error.response?.data?.message || 
        'Failed to create norm'
      );
    }
  }
);

export const seedDTEDefaults = createAsyncThunk(
  'norms/seedDefaults',
  async (seedData, { rejectWithValue }) => {
    try {
      return await institutionService.seedDTEDefaults(seedData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to seed defaults');
    }
  }
);

export const fetchNorms = createAsyncThunk(
  'norms/fetchAll',
  async ({ academicYear, institutionId, courseId }, { rejectWithValue }) => {
    try {
      return await institutionService.getNorms(academicYear, institutionId, courseId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch norms');
    }
  }
);

export const updateNorm = createAsyncThunk(
  'norms/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await institutionService.updateNorm(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update norm');
    }
  }
);

export const deleteNorm = createAsyncThunk(
  'norms/delete',
  async (id, { rejectWithValue }) => {
    try {
      await institutionService.deleteNorm(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete norm');
    }
  }
);

const normSlice = createSlice({
  name: 'norms',
  initialState: {
    norms: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetNormState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNorm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createNorm.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.norms.unshift(action.payload.data);
      })
      .addCase(createNorm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(seedDTEDefaults.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(seedDTEDefaults.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(seedDTEDefaults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNorms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNorms.fulfilled, (state, action) => {
        state.loading = false;
        state.norms = action.payload.data;
      })
      .addCase(fetchNorms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateNorm.fulfilled, (state, action) => {
        const index = state.norms.findIndex(n => n.id === action.payload.data.id);
        if (index !== -1) {
          state.norms[index] = action.payload.data;
        }
      })
      .addCase(deleteNorm.fulfilled, (state, action) => {
        state.norms = state.norms.filter(n => n.id !== action.payload);
      });
  },
});

export const { resetNormState } = normSlice.actions;
export default normSlice.reducer;
