import api from './api';

export const updateExperience = async (experienceData) => {
  const response = await api.post('/candidates/experience', experienceData);
  return response.data;
};

export const updateQualifications = async (qualificationData) => {
  const response = await api.post('/candidates/qualifications', qualificationData);
  return response.data;
};

export const updateProfile = async (profileData) => {
  // Assuming PATCH as it's an update, but following user's POST/unspecified pattern
  // If the server expects POST for profile too, keep as post
  const response = await api.post('/candidates/profile', profileData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/candidates/profile');
  return response.data;
};

export const getCandidateProfile = async (candidateId) => {
  const response = await api.get(`/candidates/${candidateId}/profile`);
  return response.data;
};

export const candidateService = {
  getProfile,
  getCandidateProfile,
  updateExperience,
  updateQualifications,
  updateProfile,
};
