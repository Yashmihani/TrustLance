// frontend/src/services/authService.js
import axios from 'axios';

// Create axios instance directly here to avoid circular import issues
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('Auth Service API URL:', API_URL);

const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authService = {

  // Get nonce from backend
  getNonce: async (walletAddress) => {
    console.log('Calling getNonce for:', walletAddress);
    console.log('API URL:', API_URL);

    const response = await authAxios.get('/auth/nonce/' + walletAddress);
    console.log('getNonce response:', response.data);
    return response.data;
  },

  // Verify signature
  verifySignature: async (walletAddress, signature) => {
    console.log('Calling verifySignature');

    const response = await authAxios.post('/auth/verify', {
      walletAddress,
      signature,
    });
    console.log('verifySignature response:', response.data);
    return response.data;
  },

  // Save session to localStorage
  saveSession: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear session
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get saved user
  getSavedUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;