/**
 * Mock API service layer
 * Currently all logic is in Redux thunks for simplicity,
 * but real API calls should be defined here.
 */

export const mockApi = {
  auth: {
    login: async (credentials) => {
      // Logic handled in authSlice for now
    },
    logout: async () => {
      // Clear session
    }
  },
  admin: {
    getPrincipals: async () => {
      return [
        { id: 1, name: 'Dr. Ramesh Patil', institute: 'G.P. Pune', email: 'ramesh.p@gppune.ac.in', status: 'Active' },
      ];
    }
  },
  principal: {
    getApplications: async (instituteId) => {
      return [];
    }
  }
};
