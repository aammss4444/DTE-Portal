import api from './api';

export const createApplication = async (applicationData) => {
  const response = await api.post('/applications', applicationData);
  return response.data;
};

export const uploadDocuments = async (applicationId, formData) => {
  console.log(`[OCR] Uploading documents for application ${applicationId}. Backend will process using OCR.space API.`);
  const response = await api.post(`/applications/${applicationId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const submitApplication = async (applicationId, submissionData) => {
  console.log(`[OCR] Submitting application ${applicationId}. Triggering backend AI scrutiny with OCR.space document parsing.`);
  const response = await api.post(`/applications/${applicationId}/submit`, submissionData);
  return response.data;
};

export const withdrawApplication = async (applicationId) => {
  const response = await api.delete(`/applications/${applicationId}/withdraw`);
  return response.data;
};

export const processAction = async (applicationId, actionData) => {
  const response = await api.post(`/applications/${applicationId}/action`, actionData);
  return response.data;
};

export const listDocuments = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}/documents`);
  return response.data;
};

export const getAISummary = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}/ai-summary`);
  return response.data;
};

export const analyzeApplicationAI = async (applicationId) => {
  const response = await api.post(`/applications/${applicationId}/analyze-ai`);
  return response.data;
};

export const getMyApplications = async (params) => {
  const response = await api.get('/applications/my', { params });
  return response.data;
};

export const getApplications = async (params) => {
  const response = await api.get('/applications', { params });
  return response.data;
};

export const applicationService = {
  createApplication,
  uploadDocuments,
  submitApplication,
  withdrawApplication,
  processAction,
  getMyApplications,
  getApplications,
  listDocuments,
  getAISummary,
  analyzeApplicationAI,
};

export default applicationService;
