import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from '../../services/attendanceService';
import { toast } from 'react-hot-toast';

export const fetchTimetable = createAsyncThunk(
  'attendance/fetchTimetable',
  async ({ facultyCredentialId, academicYear, isMy }, { rejectWithValue }) => {
    try {
      if (isMy) {
        return await attendanceService.getMyTimetable(academicYear);
      }
      return await attendanceService.getTimetable(facultyCredentialId, academicYear);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to fetch timetable');
    }
  }
);

export const createTimetable = createAsyncThunk(
  'attendance/createTimetable',
  async (timetableData, { rejectWithValue }) => {
    try {
      const response = await attendanceService.createTimetable(timetableData);
      toast.success('Timetable updated successfully');
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update timetable';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const updateTimetableSlot = createAsyncThunk(
  'attendance/updateSlot',
  async ({ slotId, slotData }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.updateTimetableSlot(slotId, slotData);
      toast.success('Slot updated successfully');
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update slot';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const fetchLogs = createAsyncThunk(
  'attendance/fetchLogs',
  async (params, { rejectWithValue }) => {
    try {
      return await attendanceService.getLogs(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to fetch logs');
    }
  }
);

export const createLog = createAsyncThunk(
  'attendance/createLog',
  async (logData, { rejectWithValue }) => {
    try {
      const response = await attendanceService.createLog(logData);
      toast.success('Lecture log created');
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to create log';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const submitLog = createAsyncThunk(
  'attendance/submitLog',
  async (logId, { rejectWithValue }) => {
    try {
      const response = await attendanceService.submitLog(logId);
      toast.success('Log submitted for verification');
      return { logId, ...response };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Submission failed';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const bulkSubmit = createAsyncThunk(
  'attendance/bulkSubmit',
  async (logIds, { rejectWithValue }) => {
    try {
      const response = await attendanceService.bulkSubmit(logIds);
      toast.success(`Successfully submitted ${response.success_count} logs`);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Bulk submission failed';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const verifyLog = createAsyncThunk(
  'attendance/verifyLog',
  async ({ logId, action, remarks }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.verifyLog(logId, action, remarks);
      toast.success(`Log ${action.toLowerCase()} successfully`);
      return { logId, ...response };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Verification failed';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const registerFace = createAsyncThunk(
  'attendance/registerFace',
  async (faceDataUrl, { rejectWithValue }) => {
    try {
      const response = await attendanceService.registerFace(faceDataUrl);
      toast.success('Face profile locked successfully');
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to register face';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const requestFaceUpdate = createAsyncThunk(
  'attendance/requestFaceUpdate',
  async (reason, { rejectWithValue }) => {
    try {
      const response = await attendanceService.requestFaceUpdate(reason);
      toast.success('Face update requested successfully');
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to request face update';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const fetchFaceUpdateStatus = createAsyncThunk(
  'attendance/fetchFaceUpdateStatus',
  async (_, { rejectWithValue }) => {
    try {
      return await attendanceService.getFaceUpdateStatus();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to fetch face update status');
    }
  }
);

export const upsertCalendar = createAsyncThunk(
  'attendance/upsertCalendar',
  async ({ institutionId, academicYear, entries }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.upsertCalendar(institutionId, academicYear, entries);
      toast.success('Calendar updated successfully');
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update calendar';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      return rejectWithValue(msg);
    }
  }
);

export const fetchCalendar = createAsyncThunk(
  'attendance/fetchCalendar',
  async ({ institutionId, academicYear, month }, { rejectWithValue }) => {
    try {
      return await attendanceService.getCalendar(institutionId, academicYear, month);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to fetch calendar');
    }
  }
);

export const fetchMonthlySummary = createAsyncThunk(
  'attendance/fetchMonthlySummary',
  async ({ facultyCredentialId, academicYear, month }, { rejectWithValue }) => {
    try {
      return await attendanceService.getMonthlySummary(facultyCredentialId, academicYear, month);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to fetch monthly summary');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    timetable: [],  // Flat array for forms/filters
    timetableByDay: {},  // Day-indexed object for calendar view
    logs: [],
    calendar: [],
    summary: null,
    faceUpdateStatus: null,
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearAttendanceState: (state) => {
      state.timetable = [];
      state.timetableByDay = {};
      state.logs = [];
      state.calendar = [];
      state.summary = null;
      state.faceUpdateStatus = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimetable.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTimetable.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || action.payload;
        
        if (Array.isArray(data)) {
          // Store flat array for forms/filters
          state.timetable = data;
          
          // Also create day-indexed object for calendar view
          const timetableByDay = {};
          data.forEach(slot => {
            const day = slot.day_of_week;
            if (day) {
              const dayStr = day.toUpperCase();
              if (!timetableByDay[dayStr]) {
                timetableByDay[dayStr] = [];
              }
              timetableByDay[dayStr].push(slot);
            }
          });
          state.timetableByDay = timetableByDay;
        } else {
          state.timetable = [];
          state.timetableByDay = data || {};
        }
      })
      .addCase(fetchTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        state.calendar = action.payload.data || action.payload;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.logs = action.payload.data || action.payload;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.summary = action.payload.data || action.payload;
      })
      .addCase(fetchFaceUpdateStatus.fulfilled, (state, action) => {
        state.faceUpdateStatus = action.payload.data || action.payload;
      })
      .addCase(requestFaceUpdate.fulfilled, (state, action) => {
        state.faceUpdateStatus = action.payload.data || action.payload;
      })
      .addCase(createTimetable.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateTimetableSlot.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createLog.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createLog.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createLog.rejected, (state) => {
        state.submitting = false;
      })

      // --- Global Matchers ---
      .addMatcher(
        (action) => action.type.startsWith('attendance/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('attendance/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('attendance/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;
