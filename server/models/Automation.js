const mongoose = require('mongoose');

const AutomationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  trigger: {
    type: {
      type: String,
      enum: ['status_change', 'assignee_change', 'due_date_passed'],
      required: true
    },
    condition: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  action: {
    type: {
      type: String,
      enum: ['add_badge', 'change_status', 'send_notification'],
      required: true
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Automation', AutomationSchema);