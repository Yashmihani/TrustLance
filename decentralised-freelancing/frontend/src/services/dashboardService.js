// frontend/src/services/dashboardService.js
// Fetches all data needed for the dashboard

import API from './api';

const dashboardService = {

  // Get client dashboard data
  getClientData: async () => {
    const [projects, proposals] = await Promise.all([
      API.get('/projects?limit=50'),
      API.get('/proposals/my'),
    ]);
    return {
      projects:  projects.data.projects,
      proposals: proposals.data.proposals,
    };
  },

  // Get freelancer dashboard data
  getFreelancerData: async () => {
    const response = await API.get('/proposals/my');
    return { proposals: response.data.proposals };
  },
};

export default dashboardService;