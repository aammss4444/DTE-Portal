import api from './api';

export const getFacultyList = async (institutionId, courseId, academicYear, skip = 0, limit = 100) => {
  const response = await api.get(`/vacancies/faculty?institution_id=${institutionId}&course_id=${courseId}&academic_year=${academicYear}&skip=${skip}&limit=${limit}`);
  return response.data;
};

export const createFaculty = async (facultyData) => {
  const response = await api.post('/vacancies/faculty', facultyData);
  return response.data;
};

export const updateFaculty = async (id, facultyData) => {
  const response = await api.put(`/vacancies/faculty/${id}`, facultyData);
  return response.data;
};

export const deleteFaculty = async (id, reason) => {
  const response = await api.delete(`/vacancies/faculty/${id}?reason=${reason}`);
  return response.data;
};

export const suggestVacancy = async (params) => {
  const response = await api.post('/vacancies/suggest', params);
  return response.data;
};

export const aiAnalysis = async (params) => {
  const response = await api.post('/vacancies/ai-analysis', params);
  return response.data;
};

export const getAssessment = async (institutionId, courseId, academicYear) => {
  const response = await api.get(`/vacancies/assessment?institution_id=${institutionId}&course_id=${courseId}&academic_year=${academicYear}`);
  return response.data;
};

export const confirmVacancy = async (institutionId, courseId, academicYear, data) => {
  const response = await api.post(`/vacancies/confirm?institution_id=${institutionId}&course_id=${courseId}&academic_year=${academicYear}`, data);
  return response.data;
};

export const acknowledgeAnomaly = async (anomalyId, remarks) => {
  const response = await api.post(`/vacancies/anomalies/${anomalyId}/acknowledge`, { remarks });
  return response.data;
};

export const vacancyService = {
  getFacultyList,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  suggestVacancy,
  aiAnalysis,
  getAssessment,
  confirmVacancy,
  acknowledgeAnomaly,
};

export default vacancyService;
