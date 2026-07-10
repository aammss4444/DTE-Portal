import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Real API login
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Reverting to URLSearchParams (Form Data) as 422 suggests JSON is not accepted
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = response.data;

      // The API response user object structure: { access_token, refresh_token, user: { role, ... } }
      localStorage.setItem('auth_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      return { user: data.user, token: data.access_token };
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message = error.response?.data?.message;
      let finalError = 'Login failed';
      
      if (typeof detail === 'string') finalError = detail;
      else if (Array.isArray(detail)) finalError = detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
      else if (typeof detail === 'object' && detail !== null) finalError = JSON.stringify(detail);
      else if (message) finalError = message;
      else if (error.message) finalError = error.message;

      return rejectWithValue(finalError);
    }
  }
);

export const registerCandidate = createAsyncThunk(
  'auth/registerCandidate',
  async (candidateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/candidate/register', {
        full_name: candidateData.full_name,
        email: candidateData.email,
        password: candidateData.password,
        phone_number: candidateData.phone_number
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Candidate registration failed');
    }
  }
);

// Register new user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        role: userData.role || null,
        full_name: userData.fullName,
        phone_number: userData.mobile,
        institution_id: userData.institutionId || null,
      });
      return response.data;
    } catch (error) {
      // Extract detailed error messages from FastAPI 422 errors
      const detail = error.response?.data?.detail;
      let errorMessage = 'Registration failed';
      
      if (Array.isArray(detail)) {
        errorMessage = detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch current user profile
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      console.log('auth/getMe: Fetching profile...');
      const response = await api.get('/auth/me', { timeout: 10000 });
      const data = response.data;
      console.log('auth/getMe: Profile fetched successfully');

      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_data', JSON.stringify(data));

      return data;
    } catch (error) {
      console.error('auth/getMe error:', error.message);
      // 401 is handled by axios interceptor (clears localStorage and redirects)
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user_data')) || null,
  token: localStorage.getItem('auth_token') || null,
  role: localStorage.getItem('user_role') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: !!localStorage.getItem('auth_token'), // Start loading if we have a token to verify
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.role = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
