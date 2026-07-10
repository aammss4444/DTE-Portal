import api from './api';

const billingService = {
  /**
   * Rate Management (Admin)
   */
  createRates: async (rateData) => {
    const response = await api.post('/billing/rates', rateData);
    return response.data;
  },

  getRates: async (institutionId, academicYear, designation = null) => {
    const params = { institution_id: institutionId, academic_year: academicYear };
    if (designation) params.designation = designation;
    const response = await api.get('/billing/rates', { params });
    return response.data;
  },

  updateRate: async (rateId, updateData) => {
    const response = await api.put(`/billing/rates/${rateId}`, updateData);
    return response.data;
  },

  /**
   * Bill Generation
   */
  generateBill: async (generateData) => {
    const response = await api.post('/billing/generate', generateData);
    return response.data;
  },

  generateBulk: async (bulkData) => {
    const response = await api.post('/billing/generate/bulk', bulkData);
    return response.data;
  },

  /**
   * Bill Submission & Approval
   */
  submitBill: async (billId) => {
    const response = await api.post(`/billing/bills/${billId}/submit`);
    return response.data;
  },

  approveBill: async (billId, approvalData) => {
    const response = await api.post(`/billing/bills/${billId}/approve`, approvalData);
    return response.data;
  },

  getBillApprovals: async (billId) => {
    const response = await api.get(`/billing/bills/${billId}/approvals`);
    return response.data;
  },

  /**
   * Viewing Bills
   */
  listBills: async (filters = {}) => {
    const response = await api.get('/billing/bills', { params: filters });
    return response.data;
  },

  getBillDetail: async (billId) => {
    const response = await api.get(`/billing/bills/${billId}`);
    return response.data;
  },

  getBillSummary: async (institutionId, academicYear, month) => {
    const params = { institution_id: institutionId, academic_year: academicYear, month };
    const response = await api.get('/billing/bills/summary', { params });
    return response.data;
  },

  regenerateBill: async (billId) => {
    const response = await api.post(`/billing/bills/${billId}/regenerate`);
    return response.data;
  },

  /**
   * AI Features
   */
  aiValidateBill: async (billId) => {
    const response = await api.post(`/billing/${billId}/ai-validate`);
    return response.data;
  },

  getAiReadiness: async (billId) => {
    const response = await api.get(`/billing/${billId}/ai-readiness`);
    return response.data;
  },

  getAiMonitor: async () => {
    const response = await api.get('/billing/ai-monitor');
    return response.data;
  },

  createAiSnapshot: async (billId) => {
    const response = await api.post(`/billing/${billId}/ai-snapshot`);
    return response.data;
  }
};

export default billingService;
