import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { institutionService } from '../../services/institutionService';

export const createIntake = createAsyncThunk(
  'intakes/create',
  async (intakeData, { rejectWithValue }) => {
    try {
      return await institutionService.createIntake(intakeData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create intake');
    }
  }
);

export const fetchIntakes = createAsyncThunk(
  'intakes/fetchAll',
  async ({ institutionId, academicYear }, { rejectWithValue }) => {
    try {
      return await institutionService.getAllIntakes(institutionId, academicYear);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch intakes');
    }
  }
);

export const updateIntake = createAsyncThunk(
  'intakes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await institutionService.updateIntake(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update intake');
    }
  }
);

export const deleteIntake = createAsyncThunk(
  'intakes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await institutionService.deleteIntake(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete intake');
    }
  }
);

const intakeSlice = createSlice({
  name: 'intakes',
  initialState: {
    intakes: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetIntakeState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createIntake.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createIntake.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.intakes.unshift(action.payload);
      })
      .addCase(createIntake.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIntakes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIntakes.fulfilled, (state, action) => {
        state.loading = false;
        state.intakes = action.payload;
      })
      .addCase(fetchIntakes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateIntake.fulfilled, (state, action) => {
        const index = state.intakes.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.intakes[index] = action.payload;
        }
      })
      .addCase(deleteIntake.fulfilled, (state, action) => {
        state.intakes = state.intakes.filter(i => i.id !== action.payload);
      });
  },
});

export const { resetIntakeState } = intakeSlice.actions;
export default intakeSlice.reducer;
