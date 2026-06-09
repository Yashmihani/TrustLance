// src/routes/projectRoutes.js
const express = require('express');
const router  = express.Router();
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject,
} = require('../controllers/projectController');
const { authenticate }                          = require('../middleware/auth');
const { projectValidation, validate }           = require('../middleware/validate');

router.get('/',            getProjects);
router.get('/:id',         getProject);
router.post('/',   authenticate, projectValidation, validate, createProject);
router.put('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

module.exports = router;