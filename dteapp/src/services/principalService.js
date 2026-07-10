import api from './api';

const principalService = {
  getDashboardData: async () => {
    const response = await api.get('/principal/dashboard');
    return response.data;
  },
  setInstituteLocation: async (latitude, longitude) => {
    const response = await api.post('/principal/institute/location', { latitude, longitude });
    return response.data;
  }
};

export default principalService;
