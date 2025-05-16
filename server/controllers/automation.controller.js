const asyncHandler = require('express-async-handler');
const Automation = require('../models/Automation');
const Project = require('../models/Project');

// Create a new automation
const createAutomation = asyncHandler(async (req, res) => {
  const { name, project, trigger, action } = req.body;

  const projectDoc = await Project.findById(project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = projectDoc.members.some(member => 
    member.toString() === req.user.id
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this project');
  }

  const automation = await Automation.create({
    name,
    project,
    trigger,
    action,
    createdBy: req.user.id
  });

  res.status(201).json(automation);
});

// Get automations for a project
const getAutomations = asyncHandler(async (req, res) => {
  const { project } = req.query;

  const projectDoc = await Project.findById(project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = projectDoc.members.some(member => 
    member.toString() === req.user.id
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this project');
  }

  const automations = await Automation.find({ project });
  res.json(automations);
});

// Get automation by ID
const getAutomationById = asyncHandler(async (req, res) => {
  const automation = await Automation.findById(req.params.id);
  
  if (!automation) {
    res.status(404);
    throw new Error('Automation not found');
  }

  const projectDoc = await Project.findById(automation.project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = projectDoc.members.some(member => 
    member.toString() === req.user.id
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this automation');
  }

  res.json(automation);
});

// Update automation
const updateAutomation = asyncHandler(async (req, res) => {
  const { name, trigger, action } = req.body;
  
  const automation = await Automation.findById(req.params.id);
  
  if (!automation) {
    res.status(404);
    throw new Error('Automation not found');
  }

  const projectDoc = await Project.findById(automation.project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = projectDoc.members.some(member => 
    member.toString() === req.user.id
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to update this automation');
  }

  automation.name = name || automation.name;
  if (trigger) automation.trigger = trigger;
  if (action) automation.action = action;

  const updatedAutomation = await automation.save();
  res.json(updatedAutomation);
});

// Delete automation
const deleteAutomation = asyncHandler(async (req, res) => {
  const automation = await Automation.findById(req.params.id);
  
  if (!automation) {
    res.status(404);
    throw new Error('Automation not found');
  }

  const projectDoc = await Project.findById(automation.project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = projectDoc.members.some(member => 
    member.toString() === req.user.id
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to delete this automation');
  }

  await automation.remove();
  res.json({ message: 'Automation removed' });
});

module.exports = {
  createAutomation,
  getAutomations,
  getAutomationById,
  updateAutomation,
  deleteAutomation
};