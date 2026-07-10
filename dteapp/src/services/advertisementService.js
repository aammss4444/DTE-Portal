import api from './api';

const advertisementService = {
  getAdvertisements: async (params) => {
    const response = await api.get('/advertisements', { params });
    return response.data;
  },

  generateAI: async (data) => {
    const response = await api.post('/advertisements/generate-ai', data);
    return response.data;
  },

  saveAdvertisement: async (data) => {
    const response = await api.post('/advertisements/generate', data);
    return response.data;
  },

  getAdvertisementMeta: async () => {
    const response = await api.get('/advertisements/meta');
    return response.data;
  },

  updateStatus: async (id, status, rejection_reason) => {
    const response = await api.patch(`/advertisements/${id}/status`, { status, rejection_reason });
    return response.data;
  },

  getAdvertisementById: async (id) => {
    const response = await api.get(`/advertisements/${id}`);
    return response.data;
  },

  updateAdvertisement: async (id, data) => {
    const response = await api.put(`/advertisements/${id}`, data);
    return response.data;
  },

  submitAdvertisement: async (id) => {
    const response = await api.post(`/advertisements/${id}/submit`);
    return response.data;
  },

  approveAdvertisement: async (id, data) => {
    const response = await api.post(`/advertisements/${id}/approve`, data);
    return response.data;
  },

  publishAdvertisement: async (id) => {
    const response = await api.post(`/advertisements/${id}/publish`);
    return response.data;
  },

  getPublicAdvertisement: async (token) => {
    const response = await api.get(`/advertisements/public/${token}`);
    return response.data;
  },

  getPublishedAdvertisements: async (params) => {
    const response = await api.get('/advertisements/published', { params });
    return response.data;
  },

  deleteAdvertisement: async (id) => {
    const response = await api.delete(`/advertisements/${id}`);
    return response.data;
  },

  getRecruitmentContext: async (institutionId, courseId, academicYear = '2026-27') => {
    const response = await api.get(`/advertisements/recruitment-context?institution_id=${institutionId}&course_id=${courseId}&academic_year=${academicYear}`);
    return response.data;
  }
};

export default advertisementService;
