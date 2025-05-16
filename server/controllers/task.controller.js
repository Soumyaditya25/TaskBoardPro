const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Automation = require("../models/Automation");
const Notification = require("../models/Notification");
const { io } = require("../server");  

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const tasks = await Task.find({ project: projectId })
    .populate("assignee", "name email photoURL");
  res.status(200).json(tasks);
});

const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id)
    .populate("assignee", "name email photoURL");
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.status(200).json(task);
});

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, status, dueDate, assignee } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only project owner can create tasks" });
  }

  const task = new Task({
    title,
    description,
    status,
    dueDate,
    assignee,
    project: projectId,
    createdBy: req.user._id,
    badges: [],
  });
  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate("assignee", "name email photoURL");
  res.status(201).json(populatedTask);
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let task = await Task.findById(id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const project = await Project.findById(task.project);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const previousStatus = task.status;
  const previousAssignee = task.assignee;

  task = await Task.findByIdAndUpdate(id, updates, { new: true })
    .populate("assignee", "name email photoURL");

  await processAutomations(task, { previousStatus, previousAssignee });

  res.status(200).json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const project = await Project.findById(task.project);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only project owner can delete tasks" });
  }

  await Task.findByIdAndDelete(id);
  res.status(200).json({ message: "Task deleted successfully" });
});

async function processAutomations(task, { previousStatus, previousAssignee }) {
  try {
    const automations = await Automation.find({ project: task.project });
    const oldAssigneeId = previousAssignee?.toString() || null;
    const newAssigneeId =
      task.assignee?._id?.toString() ||
      task.assignee?.toString() ||
      null;

    for (const auto of automations) {
      const { trigger, action } = auto;
      let shouldTrigger = false;

      if (
        trigger.type === "status_change" &&
        previousStatus !== task.status &&
        task.status === trigger.condition
      ) {
        shouldTrigger = true;
      }

      if (
        trigger.type === "assignee_change" &&
        oldAssigneeId !== newAssigneeId &&
        newAssigneeId === trigger.condition.toString()
      ) {
        shouldTrigger = true;
      }

      if (
        trigger.type === "due_date_passed" &&
        task.dueDate &&
        Math.floor((Date.now() - new Date(task.dueDate)) / 86400000) >=
          parseInt(trigger.condition, 10)
      ) {
        shouldTrigger = true;
      }

      if (!shouldTrigger) continue;

      if (action.type === "add_badge") {
        if (!task.badges.includes(action.params)) {
          task.badges.push(action.params);
          await task.save();
        }
      }

      if (action.type === "change_status") {
        task.status = action.params;
        await task.save();
      }

      if (action.type === "send_notification" && newAssigneeId) {
        const note = await Notification.create({
          user: newAssigneeId,
          message: action.params,
          relatedTask: task._id,
        });
        io.to(newAssigneeId).emit("new-notification", note);
      }
    }
  } catch (err) {
    console.error("Error processing automations:", err);
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
