// frontend/src/hooks/useProjects.js
// Handles project fetching, creation, and state management

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import projectService from '../services/projectService';

const useProjects = () => {
  const [projects, setProjects]     = useState([]);
  const [project, setProject]       = useState(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pagination, setPagination] = useState(null);

  // Fetch all projects with optional filters
  const fetchProjects = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const data = await projectService.getAll(filters);
      setProjects(data.projects);
      setPagination(data.pagination);
      return data;
    } catch (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single project
  const fetchProject = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const data = await projectService.getById(id);
      setProject(data.project);
      return data;
    } catch (error) {
      toast.error('Failed to load project');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new project
  const createProject = useCallback(async (projectData) => {
    setIsCreating(true);
    try {
      const data = await projectService.create(projectData);
      toast.success('Project posted successfully!');
      return data.project;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project';
      toast.error(message);
      console.error(error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  // Delete a project
  const deleteProject = useCallback(async (id) => {
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
      return true;
    } catch (error) {
      toast.error('Failed to delete project');
      return false;
    }
  }, []);

  return {
    projects,
    project,
    isLoading,
    isCreating,
    pagination,
    fetchProjects,
    fetchProject,
    createProject,
    deleteProject,
  };
};

export default useProjects;