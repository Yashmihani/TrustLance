// frontend/src/services/projectService.js
// All project-related API calls

import API from './api';

const projectService = {

  // Get all projects with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status)   params.append('status',   filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search)   params.append('search',   filters.search);
    if (filters.page)     params.append('page',     filters.page);
    if (filters.limit)    params.append('limit',    filters.limit);

    const response = await API.get(`/projects?${params.toString()}`);
    return response.data;
  },

  // Get single project by ID
  getById: async (id) => {
    const response = await API.get(`/projects/${id}`);
    return response.data;
  },

  // Create a new project
  create: async (projectData) => {
    const response = await API.post('/projects', projectData);
    return response.data;
  },

  // Update project
  update: async (id, data) => {
    const response = await API.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  delete: async (id) => {
    const response = await API.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;