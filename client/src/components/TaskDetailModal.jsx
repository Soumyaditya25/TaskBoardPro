import { useState, useEffect } from "react"
import api from "../services/api"

const TaskDetailModal = ({ isOpen, onClose, task, projectId, onTaskUpdated, onTaskDeleted }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [statuses, setStatuses] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setStatus(task.status || "")
      setAssigneeId(task.assignee?._id || "")
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "")

      if (projectId) {
        api
          .get(`/projects/${projectId}`)
          .then((response) => {
            const project = response.data

            const projectStatuses =
              project.statuses && project.statuses.length > 0 ? project.statuses : ["To Do", "In Progress", "Done"]

            setStatuses(projectStatuses)
            setMembers(project.members || [])
          })
          .catch((err) => {
            console.error("Error fetching project:", err)
            setError("Failed to load project details")
          })
      }
    }
  }, [isOpen, task, projectId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const taskData = {
        title,
        description,
        status,
      }

      if (assigneeId) {
        taskData.assignee = assigneeId
      }

      if (dueDate) {
        taskData.dueDate = dueDate
      }

      console.log("Updating task with data:", taskData)
      console.log("Using endpoint:", `/projects/${projectId}/tasks/${task._id}`)

      const response = await api.put(`/projects/${projectId}/tasks/${task._id}`, taskData)
      console.log("Task updated successfully:", response.data)

      onTaskUpdated(response.data)
      setIsEditing(false)
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task: " + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return

    setLoading(true)
    setError("")

    try {
      console.log("Deleting task:", task._id)
      console.log("Using endpoint:", `/projects/${projectId}/tasks/${task._id}`)

      await api.delete(`/projects/${projectId}/tasks/${task._id}`)
      console.log("Task deleted successfully")

      onTaskDeleted(task._id)
      onClose()
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task: " + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {isEditing ? (
          <>
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>

            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Status</option>
                  {statuses.map((statusOption, index) => (
                    <option key={index} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                >
                  Delete
                </button>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{task.title}</h2>
              <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800">
                Edit
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full inline-block text-sm">{task.status}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Description</div>
              <p className="text-gray-800 whitespace-pre-line">{task.description}</p>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Assignee</div>
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <img
                    src={
                      task.assignee.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.name || task.assignee.email)}&background=random`
                    }
                    alt={task.assignee.name || task.assignee.email}
                    className="h-6 w-6 rounded-full"
                  />
                  <span>{task.assignee.name || task.assignee.email}</span>
                </div>
              ) : (
                <span className="text-gray-500">Unassigned</span>
              )}
            </div>

            {task.dueDate && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Due Date</div>
                <div
                  className={`text-sm ${new Date(task.dueDate) < new Date() && task.status !== "Done" ? "text-red-500 font-medium" : "text-gray-800"}`}
                >
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {task.badges && task.badges.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Badges</div>
                <div className="flex flex-wrap gap-1">
                  {task.badges.map((badge, index) => (
                    <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 border rounded">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TaskDetailModal
