const express = require('express');
const {
  createAutomation,
  getAutomations,
  getAutomationById,
  updateAutomation,
  deleteAutomation
} = require('../controllers/automation.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createAutomation)
  .get(protect, getAutomations);

router.route('/:id')
  .get(protect, getAutomationById)
  .put(protect, updateAutomation)
  .delete(protect, deleteAutomation);

module.exports = router;
