// src/controllers/projectController.js
// All CRUD operations for projects

const Project  = require('../models/Project');
const Proposal = require('../models/Proposal');

// POST /api/projects — create a new project
const createProject = async (req, res) => {
  try {
    const { title, description, category, skills, budget, deadline } = req.body;

    const project = await Project.create({
      client:      req.user._id,  // from JWT middleware
      title,
      description,
      category,
      skills:      skills || [],
      budget,
      deadline:    deadline || null,
    });

    // Populate client details for the response
    await project.populate('client', 'name walletAddress avatar');

    res.status(201).json({ success: true, project });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects — list projects with filters
const getProjects = async (req, res) => {
  try {
    const {
      status   = 'open',
      category,
      search,
      page     = 1,
      limit    = 12,
      sort     = '-createdAt',   // newest first
    } = req.query;

    // Build filter object
    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;

    // Text search on title and description
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await Project.countDocuments(filter);

    const projects = await Project.find(filter)
      .populate('client',     'name walletAddress avatar')
      .populate('freelancer', 'name walletAddress avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      projects,
      pagination: {
        total,
        page:       Number(page),
        pages:      Math.ceil(total / limit),
        limit:      Number(limit),
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects/:id — get single project with proposals
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client',     'name walletAddress avatar reputationScore')
      .populate('freelancer', 'name walletAddress avatar reputationScore');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Also fetch proposals for this project
    const proposals = await Proposal.find({ project: project._id })
      .populate('freelancer', 'name walletAddress avatar reputationScore skills')
      .sort('-createdAt');

    res.json({ success: true, project, proposals });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/projects/:id — update project (owner only)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only the client who owns this project can update it
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name walletAddress avatar');

    res.json({ success: true, project: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/projects/:id — cancel project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Don't allow deleting in-progress projects (escrow might be active)
    if (project.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a project that is in progress',
      });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject };