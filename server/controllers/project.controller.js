const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Automation = require('../models/Automation');

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  const { title, description, statuses } = req.body;

  const project = await Project.create({
    title,
    description,
    statuses: statuses || ['To Do', 'In Progress', 'Done'],
    owner: req.user.id,
    members: [req.user.id]
  });

  res.status(201).json(project);
});

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ members: req.user.id })
    .populate('owner', 'name email photoURL')
    .populate('members', 'name email photoURL');

  const projectsWithTaskCounts = await Promise.all(
    projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id });
      return {
        ...project.toObject(),
        tasks
      };
    })
  );

  res.json(projectsWithTaskCounts);
});

// Get project by ID
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email photoURL')
    .populate('members', 'name email photoURL');
  
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = project.members.some(member => 
    member._id.toString() === req.user.id
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this project');
  }

  res.json(project);
});

// Update project
const updateProject = asyncHandler(async (req, res) => {
  const { title, description, statuses } = req.body;
  
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only the project owner can update project details');
  }

  project.title = title || project.title;
  project.description = description || project.description;
  if (statuses) project.statuses = statuses;

  const updatedProject = await project.save();
  
  await updatedProject.populate('owner', 'name email photoURL');
  await updatedProject.populate('members', 'name email photoURL');
  
  res.json(updatedProject);
});

// Delete project

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only the project owner can delete the project');
  }

  await Task.deleteMany({ project: project._id });
  
  await Automation.deleteMany({ project: project._id });
  
  await Project.findByIdAndDelete(project._id);
  
  res.json({ message: 'Project removed' });
});

// Add member to project
const addProjectMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = project.members.some(member => 
    member.toString() === req.user.id
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to add members to this project');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isAlreadyMember = project.members.some(member => 
    member.toString() === user._id.toString()
  );
  if (isAlreadyMember) {
    res.status(400);
    throw new Error('User is already a member of this project');
  }

  project.members.push(user._id);
  await project.save();
  
  await project.populate('owner', 'name email photoURL');
  await project.populate('members', 'name email photoURL');
  
  res.json(project);
});

// Remove member from project
const removeProjectMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only the project owner can remove members');
  }

  if (req.params.userId === project.owner.toString()) {
    res.status(400);
    throw new Error('Cannot remove the project owner');
  }

  project.members = project.members.filter(
    member => member.toString() !== req.params.userId
  );
  
  await project.save();
  
  await project.populate('owner', 'name email photoURL');
  await project.populate('members', 'name email photoURL');
  
  res.json(project);
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
};