import api from './api';

export const getInstitutions = async (page = 1, limit = 10) => {
  const response = await api.get(`/requirements/institutions?page=${page}&limit=${limit}`);
  return response.data;
};

export const createInstitution = async (institutionData) => {
  const response = await api.post('/requirements/institutions', institutionData);
  return response.data;
};

export const updateInstitution = async (id, institutionData) => {
  const response = await api.patch(`/requirements/institutions/${id}`, institutionData);
  return response.data;
};

export const deleteInstitution = async (id) => {
  const response = await api.delete(`/requirements/institutions/${id}`);
  return response.data;
};

export const addCourse = async (institutionId, courseData) => {
  const response = await api.post(`/requirements/institutions/${institutionId}/courses`, courseData);
  return response.data;
};

export const createIntake = async (intakeData) => {
  const response = await api.post('/requirements/intake', intakeData);
  return response.data;
};

export const getIntake = async (intakeId) => {
  const response = await api.get(`/requirements/intake/${intakeId}`);
  return response.data;
};

export const getAllIntakes = async (institutionId, academicYear) => {
  let url = '/requirements/intake';
  const params = [];
  if (institutionId) params.push(`institution_id=${institutionId}`);
  if (academicYear) params.push(`academic_year=${academicYear}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  
  const response = await api.get(url);
  return response.data;
};

export const updateIntake = async (id, intakeData) => {
  const response = await api.patch(`/requirements/intake/${id}`, intakeData);
  return response.data;
};

export const deleteIntake = async (id) => {
  const response = await api.delete(`/requirements/intake/${id}`);
  return response.data;
};

export const getCourses = async (page = 1, limit = 50, institutionId = null) => {
  let url = `/requirements/courses?page=${page}&limit=${limit}`;
  if (institutionId) url += `&institution_id=${institutionId}`;
  const response = await api.get(url);
  return response.data;
};

export const getCourseDetails = async (id) => {
  const response = await api.get(`/requirements/courses/${id}`);
  return response.data;
};

export const updateCourse = async (id, courseData) => {
  const response = await api.patch(`/requirements/courses/${id}`, courseData);
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await api.delete(`/requirements/courses/${id}`);
  return response.data;
};

export const createNorm = async (normData) => {
  const response = await api.post('/requirements/norms', normData);
  return response.data;
};

export const seedDTEDefaults = async (seedData) => {
  const response = await api.post('/requirements/norms/seed-dte-defaults', seedData);
  return response.data;
};

export const getNorms = async (academicYear, institutionId = null, courseId = null) => {
  let url = `/requirements/norms?academic_year=${academicYear}`;
  if (institutionId) url += `&institution_id=${institutionId}`;
  if (courseId) url += `&course_id=${courseId}`;
  const response = await api.get(url);
  return response.data;
};

export const updateNorm = async (id, normData) => {
  const response = await api.patch(`/requirements/norms/${id}`, normData);
  return response.data;
};

export const deleteNorm = async (id) => {
  const response = await api.delete(`/requirements/norms/${id}`);
  return response.data;
};

export const generateRequirements = async (data) => {
  const response = await api.post('/requirements/generate', data);
  return response.data;
};

const validateRequirements = async (data) => {
  const response = await api.post('/requirements/validate', data);
  return response.data;
};

const aiQuery = async (data) => {
  const response = await api.post('/requirements/ai-query', data);
  return response.data;
};

export const institutionService = {
  getInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  createIntake,
  getIntake,
  getAllIntakes,
  updateIntake,
  deleteIntake,
  getCourses,
  addCourse,
  getCourseDetails,
  updateCourse,
  deleteCourse,
  createNorm,
  seedDTEDefaults,
  getNorms,
  updateNorm,
  deleteNorm,
  generateRequirements,
  validateRequirements,
  aiQuery,
  getVacancyAssessment: async (params) => {
    const { institution_id, course_id, academic_year } = params;
    const response = await api.get(`/requirements/assessments`, {
      params: { institution_id, course_id, academic_year }
    });
    return response.data;
  }
};
