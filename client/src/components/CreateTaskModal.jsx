import { useState, useEffect } from "react"
import api from "../services/api"

const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [statuses, setStatuses] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && projectId) {
      api
        .get(`/projects/${projectId}`)
        .then((response) => {
          const project = response.data
          console.log("Project data for task creation:", project)

          const projectStatuses =
            project.statuses && project.statuses.length > 0 ? project.statuses : ["To Do", "In Progress", "Done"]

          setStatuses(projectStatuses)
          setMembers(project.members || [])

          if (projectStatuses.length > 0) {
            setStatus(projectStatuses[0])
          }
        })
        .catch((err) => {
          console.error("Error fetching project:", err)
          setError("Failed to load project details")
        })
    }
  }, [isOpen, projectId])

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

      console.log("Creating task with data:", taskData)
      console.log("Using endpoint:", `/projects/${projectId}/tasks`)

      const response = await api.post(`/projects/${projectId}/tasks`, taskData)
      console.log("Task created successfully:", response.data)

      onTaskCreated(response.data)
      onClose() 
    } catch (err) {
      console.error("Error creating task:", err)
      setError(`Failed to create task: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus(statuses[0] || "")
    setAssigneeId("")
    setDueDate("")
    setError("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>

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
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
