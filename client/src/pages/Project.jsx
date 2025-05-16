import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import api from "../services/api"
import TaskCard from "../components/TaskCard"
import CreateTaskModal from "../components/CreateTaskModal"
import TaskDetailModal from "../components/TaskDetailModal"
import ProjectSettingsModal from "../components/ProjectSettingsModal"
import AutomationModal from "../components/AutomationModal"
import { useAuth } from "../context/AuthContext"

const Project = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOwner, setIsOwner] = useState(false)

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
  const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false)
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const projectResponse = await api.get(`/projects/${id}`)
        setProject(projectResponse.data)

        const projectOwner = String(projectResponse.data.owner)
        const userId = String(currentUser?._id)

        console.log("Project owner:", projectOwner)
        console.log("Current user ID:", userId)

        setIsOwner(projectOwner === userId)
        console.log("Is owner:", projectOwner === userId)

        const tasksResponse = await api.get(`/projects/${id}/tasks`)
        setTasks(tasksResponse.data)
        console.log("Tasks loaded:", tasksResponse.data.length)
      } catch (err) {
        console.error("Error fetching project data:", err)
        setError("Failed to load project data")

        if (err.response?.status === 404) {
          navigate("/")
        }
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchProjectAndTasks()
    } else {
      console.log("No current user, not fetching project data")
      setLoading(false)
    }
  }, [id, navigate, currentUser])

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const task = tasks.find((t) => t._id === draggableId)
    if (!task) return

    const newStatus = destination.droppableId

    const updatedTasks = tasks.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    setTasks(updatedTasks)

    try {
      await api.put(`/projects/${id}/tasks/${draggableId}`, { status: newStatus })
      console.log("Task status updated successfully")
    } catch (err) {
      console.error("Error updating task status:", err)
      setTasks(tasks)
    }
  }

  const handleTaskCreated = (newTask) => {
    console.log("New task created:", newTask)
    setTasks([...tasks, newTask])
  }

  const handleTaskUpdated = (updatedTask) => {
    console.log("Task updated:", updatedTask)
    setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
  }

  const handleTaskDeleted = (taskId) => {
    console.log("Task deleted:", taskId)
    setTasks(tasks.filter((task) => task._id !== taskId))
  }

  const handleProjectUpdated = (updatedProject) => {
    console.log("Project updated:", updatedProject)
    setProject(updatedProject)
  }

  const handleAutomationCreated = () => {
    api
      .get(`/projects/${id}/tasks`)
      .then((response) => {
        setTasks(response.data)
        console.log("Tasks refreshed after automation")
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err)
      })
  }

  const openTaskDetail = (task) => {
    setSelectedTask(task)
    setIsTaskDetailModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    )
  }

  if (!project) return null

  const statuses = project.statuses && project.statuses.length > 0 ? project.statuses : ["To Do", "In Progress", "Done"]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsAutomationModalOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Automations
          </button>
          <button
            onClick={() => setIsProjectSettingsModalOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Settings
          </button>
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-w-max">
            {statuses.map((status) => (
              <div key={status} className="min-w-[280px] max-w-[350px]">
                <h3 className="font-medium text-gray-900 mb-3 flex justify-between items-center">
                  <span>{status}</span>
                  <span className="text-gray-500 text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                    {tasks.filter((task) => task.status === status).length}
                  </span>
                </h3>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gray-50 rounded-lg p-3 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? "bg-blue-50" : ""
                      }`}
                    >
                      {tasks
                        .filter((task) => task.status === status)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-3"
                              >
                                <TaskCard
                                  task={task}
                                  onClick={() => openTaskDetail(task)}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}

                      {tasks.filter((task) => task.status === status).length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">No tasks in this status</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectId={id}
        onTaskCreated={handleTaskCreated}
      />

      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => {
          setIsTaskDetailModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        projectId={id}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      <ProjectSettingsModal
        isOpen={isProjectSettingsModalOpen}
        onClose={() => setIsProjectSettingsModalOpen(false)}
        project={project}
        onProjectUpdated={handleProjectUpdated}
      />

      <AutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        projectId={id}
        onAutomationCreated={handleAutomationCreated}
      />
    </div>
  )
}

export default Project
