import api from './api';

const attendanceService = {
  /**
   * Fetch timetable for a faculty
   */
  getTimetable: async (facultyCredentialId, academicYear) => {
    const params = { academic_year: academicYear };
    if (facultyCredentialId) {
        params.faculty_credential_id = facultyCredentialId;
    }
    const response = await api.get(`/attendance/timetable`, { params });
    return response.data;
  },

  /**
   * Create timetable slots
   */
  createTimetableSlot: async (data) => {
    const response = await api.post('/attendance/timetable', data);
    return response.data;
  },

  getMyTimetable: async (academicYear) => {
    const response = await api.get('/attendance/timetable/my', {
      params: { academic_year: academicYear }
    });
    return response.data;
  },
  
  /**
   * Create or update timetable in bulk
   */
  createTimetable: async (timetableData) => {
    const response = await api.post('/attendance/timetable', timetableData);
    return response.data;
  },

  /**
   * Update a specific timetable slot
   */
  updateTimetableSlot: async (slotId, slotData) => {
    const response = await api.put(`/attendance/timetable/${slotId}`, slotData);
    return response.data;
  },

  /**
   * Fetch attendance logs
   */
  getLogs: async (params) => {
    const response = await api.get('/attendance/logs', { params });
    return response.data;
  },

  /**
   * Create a single lecture log
   */
  createLog: async (logData) => {
    const response = await api.post('/attendance/logs', logData);
    return response.data;
  },

  registerFace: async (faceDataUrl) => {
    const response = await api.post('/attendance/face/register', { face_image_data_url: faceDataUrl });
    return response.data;
  },

  verifyFace: async (faceDataUrl) => {
    const response = await api.post('/attendance/face/verify', { face_image_data_url: faceDataUrl });
    return response.data;
  },

  requestFaceUpdate: async (reason) => {
    const response = await api.post('/attendance/face/update-requests', { reason });
    return response.data;
  },

  getFaceUpdateStatus: async () => {
    const response = await api.get('/attendance/face/update-requests/status');
    return response.data;
  },

  getFaceUpdateRequests: async () => {
    const response = await api.get('/attendance/face/update-requests');
    return response.data;
  },

  reviewFaceUpdateRequest: async (requestId, action, remarks) => {
    const response = await api.post(`/attendance/face/update-requests/${requestId}/review`, { action, remarks });
    return response.data;
  },

  /**
   * Update an existing log
   */
  updateLog: async (logId, logData) => {
    const response = await api.put(`/attendance/logs/${logId}`, logData);
    return response.data;
  },

  /**
   * Submit a log for verification
   */
  submitLog: async (logId) => {
    const response = await api.post(`/attendance/logs/${logId}/submit`);
    return response.data;
  },

  /**
   * Verify or reject a log (Principal only)
   */
  verifyLog: async (logId, action, remarks) => {
    const response = await api.post(`/attendance/logs/${logId}/verify`, {
      action,
      remarks
    });
    return response.data;
  },

  /**
   * Bulk submit logs for verification
   */
  bulkSubmit: async (logIds) => {
    const response = await api.post('/attendance/logs/bulk-submit', {
      log_ids: logIds
    });
    return response.data;
  },

  /**
   * Upsert calendar entries (Admin/Principal)
   */
  upsertCalendar: async (institutionId, academicYear, entries) => {
    const response = await api.post('/attendance/calendar', {
      institution_id: institutionId,
      academic_year: academicYear,
      entries: entries // Array of { calendar_date, day_type, description }
    });
    return response.data;
  },

  /**
   * Fetch calendar entries
   */
  getCalendar: async (institutionId, academicYear, month) => {
    const response = await api.get('/attendance/calendar', {
      params: { institution_id: institutionId, academic_year: academicYear, month }
    });
    return response.data;
  },

  /**
   * Get monthly summary for dashboard
   */
  getMonthlySummary: async (facultyCredentialId, academicYear, month) => {
    const params = { academic_year: academicYear, month };
    if (facultyCredentialId) {
        params.faculty_credential_id = facultyCredentialId;
    }
    const response = await api.get('/attendance/logs/summary', { params });
    return response.data;
  },

  /**
   * Count faces in an image using AI
   */
  countFaces: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/attendance/ai-face-count', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

export default attendanceService;
