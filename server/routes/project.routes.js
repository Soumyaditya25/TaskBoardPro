const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} = require('../controllers/project.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/members')
  .post(protect, addProjectMember);

router.route('/:id/members/:userId')
  .delete(protect, removeProjectMember);

module.exports = router;