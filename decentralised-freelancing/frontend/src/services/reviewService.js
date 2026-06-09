// frontend/src/services/reviewService.js
import API from './api';

const reviewService = {

  // Submit a review
  create: async (reviewData) => {
    const response = await API.post('/reviews', reviewData);
    return response.data;
  },

  // Get all reviews for a user
  getUserReviews: async (userId) => {
    const response = await API.get('/reviews/user/' + userId);
    return response.data;
  },
};

export default reviewService;