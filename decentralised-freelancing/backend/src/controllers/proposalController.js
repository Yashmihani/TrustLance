// src/controllers/proposalController.js
// Freelancer applies to projects; client accepts/rejects

const Proposal = require('../models/Proposal');
const Project  = require('../models/Project');
const { createNotification } = require('../utils/notificationHelper');
const User = require('../models/User');

// POST /api/proposals — submit a proposal
const createProposal = async (req, res) => {
  try {
    const { projectId, coverLetter, bidAmount, deliveryDays } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    

    // Can't apply to your own project
    if (project.client.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own project',
      });
    }

    // Only apply to open projects
    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This project is no longer accepting proposals',
      });
    }

    const proposal = await Proposal.create({
      project:     projectId,
      freelancer:  req.user._id,
      coverLetter,
      bidAmount,
      deliveryDays,
    });

    // Increment proposal count on the project
    await Project.findByIdAndUpdate(projectId, {
      $inc: { proposalCount: 1 },
    });

    await proposal.populate('freelancer', 'name walletAddress avatar reputationScore skills');

    res.status(201).json({ success: true, proposal });

  } catch (error) {
    // Duplicate proposal
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this project',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/proposals/:id/accept — client accepts a proposal
const acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('project');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Only the project's client can accept
    if (proposal.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Accept this proposal
    proposal.status = 'accepted';
    await proposal.save();

    // Reject all other proposals for the same project
    await Proposal.updateMany(
      { project: proposal.project._id, _id: { $ne: proposal._id } },
      { status: 'rejected' }
    );

    // Update project status and assign freelancer
    await Project.findByIdAndUpdate(proposal.project._id, {
      status:     'in_progress',
      freelancer: proposal.freelancer,
    });

    res.json({ success: true, proposal });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/proposals/:id/reject — client rejects a proposal
const rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('project');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    proposal.status = 'rejected';
    await proposal.save();

    res.json({ success: true, proposal });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/proposals/my — get current user's proposals
const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate('project', 'title budget status client')
      .sort('-createdAt');

    res.json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createProposal, acceptProposal, rejectProposal, getMyProposals };