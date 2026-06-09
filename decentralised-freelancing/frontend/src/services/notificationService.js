// frontend/src/services/notificationService.js

import API from './api';

const notificationService = {

  // Get all notifications
  getAll: async () => {
    const response = await API.get('/notifications');
    return response.data;
  },

  // Mark one as read
  markAsRead: async (id) => {
    const response = await API.put('/notifications/' + id + '/read');
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await API.put('/notifications/read-all');
    return response.data;
  },

  // Delete one
  delete: async (id) => {
    const response = await API.delete('/notifications/' + id);
    return response.data;
  },

  // Clear all
  clearAll: async () => {
    const response = await API.delete('/notifications');
    return response.data;
  },
};

export default notificationService;