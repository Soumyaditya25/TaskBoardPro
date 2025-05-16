const Task = require('../models/Task');
const Automation = require('../models/Automation');
const Notification = require('../models/Notification');

const checkDueDateAutomations = async () => {
  try {
    const overdueTasks = await Task.find({
      dueDate: { $lt: new Date() }
    });

    for (const task of overdueTasks) {
      const automations = await Automation.find({
        project: task.project,
        'trigger.type': 'due_date_passed'
      });

      for (const automation of automations) {
        const daysPast = Math.floor((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
        
        if (daysPast >= parseInt(automation.trigger.condition, 10)) {
          switch (automation.action.type) {
            case 'add_badge':
              if (!task.badges.includes(automation.action.params)) {
                task.badges.push(automation.action.params);
                await task.save();
              }
              break;
            case 'change_status':
              task.status = automation.action.params;
              await task.save();
              break;
            case 'send_notification':
              if (task.assignee) {
                await Notification.create({
                  user: task.assignee,
                  message: automation.action.params,
                  relatedTask: task._id
                });
              }
              break;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in automation engine:', error);
  }
};

module.exports = {
  checkDueDateAutomations
};