import api from './api';

const selectionService = {
  /**
   * Fetch all shortlisted candidates for an advertisement
   */
  getShortlisted: async (advertisementId) => {
    const response = await api.get(`/selection/${advertisementId}/shortlisted`);
    return response.data;
  },

  /**
   * Shortlist a list of applications for an advertisement
   */
  shortlistCandidates: async (advertisementId, applicationIds, remarks = '') => {
    const response = await api.post(`/selection/${advertisementId}/shortlist`, {
      application_ids: applicationIds,
      remarks
    });
    return response.data;
  },

  /**
   * Mark candidate attendance for interview
   */
  markAttendance: async (advertisementId, attendanceData) => {
    const response = await api.post(`/selection/${advertisementId}/attendance`, {
      attendance: attendanceData
    });
    return response.data;
  },

  /**
   * Enter interview marks for a candidate
   */
  enterMarks: async (markData) => {
    const response = await api.post('/selection/marks', markData);
    return response.data;
  },

  /**
   * Update existing interview marks
   */
  updateMarks: async (markId, markData) => {
    const response = await api.put(`/selection/marks/${markId}`, markData);
    return response.data;
  },

  /**
   * Trigger AI ranking generation for an advertisement
   */
  generateRankings: async (advertisementId) => {
    const response = await api.post(`/selection/${advertisementId}/rank`);
    return response.data;
  },

  /**
   * Get the ranked list of candidates
   */
  getRankedList: async (advertisementId) => {
    const response = await api.get(`/selection/${advertisementId}/ranked-list`);
    return response.data;
  },

  /**
   * Get the selection dashboard with AI analysis
   */
  getDashboard: async (advertisementId) => {
    const response = await api.get(`/selection/${advertisementId}/dashboard`);
    return response.data;
  },

  /**
   * Run AI analysis on selection results
   */
  runAiAnalysis: async (advertisementId) => {
    const response = await api.post(`/selection/${advertisementId}/ai-analysis`);
    return response.data;
  },

  /**
   * Create an AI snapshot for auditing
   */
  createAiSnapshot: async (advertisementId) => {
    const response = await api.post(`/selection/${advertisementId}/ai-snapshot`);
    return response.data;
  },

  /**
   * Confirm the final selection results
   */
  confirmSelection: async (advertisementId, remarks = '') => {
    const response = await api.post(`/selection/${advertisementId}/confirm`, {
      remarks
    });
    return response.data;
  },

  /**
   * Resolve scoring weights for an advertisement
   */
  getWeights: async (courseId, level, advertisementId) => {
    const params = { course_id: courseId, level, advertisement_id: advertisementId };
    const response = await api.get('/scoring-weights/resolve', { params });
    return response.data;
  },

  /**
   * Create global scoring weights (Admin only)
   */
  createGlobalWeights: async (weightData) => {
    const response = await api.post('/scoring-weights', weightData);
    return response.data;
  },

  /**
   * Get all active global configurations (Admin only)
   */
  getActiveConfigs: async () => {
    const response = await api.get('/scoring-weights');
    return response.data;
  },

  /**
   * Delete a weight configuration (Admin only)
   */
  deleteConfig: async (configId) => {
    const response = await api.delete(`/scoring-weights/${configId}`);
    return response.data;
  },

  /**
   * Override weights for a specific advertisement (Principal only)
   */
  overrideWeights: async (advertisementId, weightData) => {
    const response = await api.post(`/scoring-weights/advertisement/${advertisementId}`, weightData);
    return response.data;
  },

  /**
   * Fetch selection results with filters
   */
  getResults: async (params) => {
    const response = await api.get('/selection/results', { params });
    return response.data;
  }
};

export default selectionService;
