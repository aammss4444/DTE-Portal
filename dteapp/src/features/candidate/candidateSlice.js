import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { candidateService } from '../../services/candidateService';

export const updateExperience = createAsyncThunk(
  'candidate/updateExperience',
  async (experienceData, { rejectWithValue }) => {
    try {
      return await candidateService.updateExperience(experienceData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update experience');
    }
  }
);

export const updateQualifications = createAsyncThunk(
  'candidate/updateQualifications',
  async (qualificationData, { rejectWithValue }) => {
    try {
      return await candidateService.updateQualifications(qualificationData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update qualifications');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'candidate/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      return await candidateService.updateProfile(profileData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const getProfile = createAsyncThunk(
  'candidate/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await candidateService.getProfile();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: {
    profile: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Experience
      .addCase(updateExperience.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateExperience.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.experiences = action.payload.data;
        }
        state.success = true;
      })
      .addCase(updateExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Qualifications
      .addCase(updateQualifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQualifications.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.qualifications = action.payload.data;
        }
        state.success = true;
      })
      .addCase(updateQualifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = candidateSlice.actions;
export default candidateSlice.reducer;
