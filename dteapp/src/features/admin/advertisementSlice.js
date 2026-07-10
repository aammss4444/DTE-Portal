import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import advertisementService from '../../services/advertisementService';

export const fetchAds = createAsyncThunk(
  'ads/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await advertisementService.getAdvertisements(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ads');
    }
  }
);

export const generateAdAI = createAsyncThunk(
  'ads/generateAI',
  async (data, { rejectWithValue }) => {
    try {
      return await advertisementService.generateAI(data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'AI Generation failed');
    }
  }
);

export const fetchRecruitmentContext = createAsyncThunk(
  'ads/fetchRecruitmentContext',
  async ({ institution_id, course_id, academic_year }, { rejectWithValue }) => {
    try {
      return await advertisementService.getRecruitmentContext(institution_id, course_id, academic_year);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recruitment context');
    }
  }
);

export const fetchAdMeta = createAsyncThunk(
  'ads/fetchMeta',
  async (_, { rejectWithValue }) => {
    try {
      return await advertisementService.getAdvertisementMeta();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meta');
    }
  }
);

export const saveAd = createAsyncThunk(
  'ads/save',
  async (data, { rejectWithValue }) => {
    try {
      return await advertisementService.saveAdvertisement(data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Saving failed');
    }
  }
);

export const fetchAdById = createAsyncThunk(
  'ads/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await advertisementService.getAdvertisementById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch advertisement');
    }
  }
);

export const updateAd = createAsyncThunk(
  'ads/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await advertisementService.updateAdvertisement(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

export const submitAd = createAsyncThunk(
  'ads/submit',
  async (id, { rejectWithValue }) => {
    try {
      return await advertisementService.submitAdvertisement(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Submission failed');
    }
  }
);

export const approveAd = createAsyncThunk(
  'ads/approve',
  async ({ id, action, remarks }, { rejectWithValue }) => {
    try {
      return await advertisementService.approveAdvertisement(id, { action, remarks });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Approval failed');
    }
  }
);

export const publishAd = createAsyncThunk(
  'ads/publish',
  async (id, { rejectWithValue }) => {
    try {
      return await advertisementService.publishAdvertisement(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Publishing failed');
    }
  }
);

export const fetchPublishedAds = createAsyncThunk(
  'ads/fetchPublished',
  async (params, { rejectWithValue }) => {
    try {
      return await advertisementService.getPublishedAdvertisements(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch published ads');
    }
  }
);

export const deleteAd = createAsyncThunk(
  'ads/delete',
  async (id, { rejectWithValue }) => {
    try {
      await advertisementService.deleteAdvertisement(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Deletion failed');
    }
  }
);

const advertisementSlice = createSlice({
  name: 'ads',
  initialState: {
    list: [],
    publishedList: [],
    totalPublished: 0,
    meta: null,
    currentAd: null,
    preview: null,
    recruitmentContext: null,
    contextLoading: false,
    loading: false,
    aiLoading: false,
    error: null,
    success: false
  },
  reducers: {
    clearAdStatus: (state) => {
      state.success = false;
      state.error = null;
      state.preview = null;
    },
    clearRecruitmentContext: (state) => {
      state.recruitmentContext = null;
    },
    setPreview: (state, action) => {
      state.preview = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAds.pending, (state) => { state.loading = true; })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const ads = Array.isArray(payload) ? payload : payload?.data;
        state.list = Array.isArray(ads) ? ads : [];
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdMeta.fulfilled, (state, action) => {
        state.meta = action.payload.data;
      })
      .addCase(generateAdAI.pending, (state) => { state.aiLoading = true; })
      .addCase(generateAdAI.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.preview = action.payload;
      })
      .addCase(generateAdAI.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload;
      })
      .addCase(saveAd.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(saveAd.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.preview = null;
      })
      .addCase(saveAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdById.pending, (state) => { state.loading = true; })
      .addCase(fetchAdById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
      })
      .addCase(updateAd.pending, (state) => { state.loading = true; })
      .addCase(updateAd.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
        state.success = true;
      })
      .addCase(submitAd.pending, (state) => { state.loading = true; })
      .addCase(submitAd.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
        state.success = true;
      })
      .addCase(approveAd.pending, (state) => { state.loading = true; })
      .addCase(approveAd.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
        state.success = true;
      })
      .addCase(publishAd.pending, (state) => { state.loading = true; })
      .addCase(publishAd.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
        state.success = true;
      })
      .addCase(fetchPublishedAds.pending, (state) => { state.loading = true; })
      .addCase(fetchPublishedAds.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedList = action.payload.data;
        state.totalPublished = action.payload.total || 0;
      })
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.list = state.list.filter(ad => ad.id !== action.payload);
        state.success = true;
      })
      // Recruitment Context
      .addCase(fetchRecruitmentContext.pending, (state) => {
        state.contextLoading = true;
        state.recruitmentContext = null;
      })
      .addCase(fetchRecruitmentContext.fulfilled, (state, action) => {
        state.contextLoading = false;
        state.recruitmentContext = action.payload.data || action.payload;
      })
      .addCase(fetchRecruitmentContext.rejected, (state, action) => {
        state.contextLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAdStatus, clearRecruitmentContext, setPreview } = advertisementSlice.actions;
export default advertisementSlice.reducer;
