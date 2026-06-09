// frontend/src/services/userService.js
// All user-related API calls

import API from './api';

const userService = {

  // Get user by wallet address
  getByWallet: async (walletAddress) => {
    const response = await API.get(`/users/${walletAddress}`);
    return response.data;
  },

  // Update own profile
  updateProfile: async (profileData) => {
    const response = await API.put('/users/profile', profileData);
    return response.data;
  },
};

export default userService;