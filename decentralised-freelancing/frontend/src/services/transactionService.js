// frontend/src/services/transactionService.js
// Logs blockchain transactions to MongoDB for history

import API from './api';

const transactionService = {

  // Log a transaction after it happens on-chain
  log: async (txData) => {
    const response = await API.post('/transactions', txData);
    return response.data;
  },

  // Get transaction history for current user
  getMyTransactions: async () => {
    const response = await API.get('/transactions/my');
    return response.data;
  },
};

export default transactionService;