import api from './api';

export const appointmentService = {
  generateLetter: async (data) => {
    const response = await api.post('/appointments/generate', data);
    return response.data;
  },
  getLetter: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  updateLetter: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },
  submitLetter: async (id) => {
    const response = await api.post(`/appointments/${id}/submit`);
    return response.data;
  },
  listPrincipalAppointments: async (params) => {
    const response = await api.get('/appointments/list', { params });
    return response.data;
  },
  listCandidateAppointments: async () => {
    const response = await api.get('/appointments/my/list');
    return response.data;
  },
  respondToLetter: async (id, data) => {
    const response = await api.post(`/appointments/${id}/respond`, data);
    return response.data;
  },
  deleteLetter: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }
};
