import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const extractErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (Array.isArray(detail)) {
      return detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
    }
    if (typeof detail === 'object') {
      return JSON.stringify(detail);
    }
    return detail;
  }
  return error.response?.data?.message || error.message || 'An unknown error occurred';
};

// --- Rate Management ---
export const createBillingRate = createAsyncThunk(
  'billing/createRate',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/billing/rates', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchBillingRates = createAsyncThunk(
  'billing/fetchRates',
  async ({ page = 1, limit = 5, institution_id, academic_year }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/billing/rates`, {
        params: { page, limit, institution_id, academic_year }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateBillingRate = createAsyncThunk(
  'billing/updateRate',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/billing/rates/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// --- Bill Generation ---
export const generateBill = createAsyncThunk(
  'billing/generateBill',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/billing/generate', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const bulkGenerateBills = createAsyncThunk(
  'billing/bulkGenerate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/billing/generate/bulk', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// --- Bill Operations ---
export const fetchBills = createAsyncThunk(
  'billing/fetchBills',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/billing/bills', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchBillDetails = createAsyncThunk(
  'billing/fetchDetails',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/billing/bills/${billId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchBillApprovals = createAsyncThunk(
  'billing/fetchApprovals',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/billing/bills/${billId}/approvals`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const regenerateBill = createAsyncThunk(
  'billing/regenerate',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/billing/bills/${billId}/regenerate`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchAIReadiness = createAsyncThunk(
  'billing/fetchReadiness',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/billing/bills/${billId}/ai-readiness`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const aiValidateBill = createAsyncThunk(
  'billing/aiValidate',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/billing/bills/${billId}/ai-validate`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createAISnapshot = createAsyncThunk(
  'billing/createSnapshot',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/billing/bills/${billId}/ai-snapshot`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchBillingSummary = createAsyncThunk(
  'billing/fetchSummary',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.institution_id) queryParams.append('institution_id', params.institution_id);
      if (params?.academic_year) queryParams.append('academic_year', params.academic_year);
      
      const response = await api.get(`/billing/bills/summary?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const submitBill = createAsyncThunk(
  'billing/submit',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/billing/bills/${billId}/submit`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const approveBill = createAsyncThunk(
  'billing/approve',
  async ({ billId, action, remarks }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/billing/bills/${billId}/approve`, { action, remarks });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// --- AI Validation ---
export const triggerAIValidation = createAsyncThunk(
  'billing/aiValidate',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/billing/${billId}/ai-validate`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchAIMonitor = createAsyncThunk(
  'billing/fetchAIMonitor',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/billing/ai-monitor');
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    // Rates
    rates: [],
    totalRates: 0,
    
    // Bills
    bills: [],
    selectedBill: null,
    selectedBillApprovals: [],
    selectedBillReadiness: null,
    summary: null,
    aiMonitorData: null,
    totalBills: 0,
    
    // State
    loading: false,
    fetching: false,
    error: null,
    success: false,
    
    // Pagination
    page: 1,
    limit: 10,
  },
  reducers: {
    resetBillingStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // [IMPORTANT] addCase calls MUST precede addMatcher calls in Redux Toolkit
      
      // --- Rates Cases ---
      .addCase(fetchBillingRates.fulfilled, (state, action) => {
        state.fetching = false;
        state.loading = false;
        state.rates = action.payload.data || action.payload || [];
        state.totalRates = action.payload.total || (action.payload.data ? action.payload.data.length : 0);
      })
      .addCase(createBillingRate.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateBillingRate.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      
      // --- Bills Cases ---
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.fetching = false;
        state.loading = false;
        state.bills = action.payload.data || action.payload || [];
        state.totalBills = action.payload.total || (action.payload.data ? action.payload.data.length : 0);
      })
      .addCase(fetchBillDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBill = action.payload.data || action.payload;
      })
      .addCase(fetchBillApprovals.fulfilled, (state, action) => {
        state.loading = false;
        // The backend returns { status: "success", data: { history: [...] } }
        const data = action.payload.data || action.payload;
        state.selectedBillApprovals = data.history || data.data || (Array.isArray(data) ? data : []);
      })
      .addCase(fetchAIReadiness.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBillReadiness = action.payload.data || action.payload || null;
      })
      .addCase(fetchBillingSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data || action.payload || null;
      })
      .addCase(fetchAIMonitor.fulfilled, (state, action) => {
        state.loading = false;
        state.aiMonitorData = action.payload.data || action.payload || null;
      })
      .addCase(generateBill.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitBill.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(regenerateBill.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(aiValidateBill.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createAISnapshot.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(approveBill.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      // --- Global Matchers ---
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.fetching = false;
        }
      );
  },
});

export const { resetBillingStatus, setPage } = billingSlice.actions;
export default billingSlice.reducer;
