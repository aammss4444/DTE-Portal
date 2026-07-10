import api from './api';

const reportService = {
  /**
   * Get attendance summary report
   */
  getAttendanceReport: async (params) => {
    const response = await api.get('/reports/attendance/summary', { params });
    return response.data;
  },

  /**
   * Get billing summary report
   */
  getBillingReport: async (params) => {
    const response = await api.get('/reports/billing/summary', { params });
    return response.data;
  },

  /**
   * Get faculty performance analytics
   */
  getFacultyPerformance: async (params) => {
    const response = await api.get('/reports/faculty/performance', { params });
    return response.data;
  },

  /**
   * Get system health & AI precision report
   */
  getSystemHealthReport: async () => {
    const response = await api.get('/reports/system/health');
    return response.data;
  },

  /**
   * Export report as PDF/Excel (Simulated)
   */
  exportReport: async (reportType, format, params) => {
    const response = await api.get(`/reports/export/${reportType}`, { 
      params: { ...params, format },
      responseType: 'blob' 
    });
    return response.data;
  }
};

export default reportService;
