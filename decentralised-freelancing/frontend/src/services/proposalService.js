// frontend/src/services/proposalService.js
// All proposal-related API calls

import API from './api';

const proposalService = {

  // Submit a proposal
  create: async (proposalData) => {
    const response = await API.post('/proposals', proposalData);
    return response.data;
  },

  // Get my proposals (freelancer)
  getMyProposals: async () => {
    const response = await API.get('/proposals/my');
    return response.data;
  },

  // Accept a proposal (client)
  accept: async (proposalId) => {
    const response = await API.put(`/proposals/${proposalId}/accept`);
    return response.data;
  },

  // Reject a proposal (client)
  reject: async (proposalId) => {
    const response = await API.put(`/proposals/${proposalId}/reject`);
    return response.data;
  },
};

export default proposalService;