import axios from "axios"

const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:5000";

const api = axios.create({
  baseURL: `${BASE}/api`,   
  headers: { "Content-Type": "application/json" },
});

const token = localStorage.getItem("token")
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const loginUser = (credentials) => api.post("/auth/login", credentials)
export const registerUser = (userData) => api.post("/auth/register", userData)
export const getCurrentUser = () => api.get("/auth/me")

// Projects API
export const getProjects = () => api.get("/projects")
export const getProject = (id) => api.get(`/projects/${id}`)
export const createProject = (projectData) => api.post("/projects", projectData)
export const updateProject = (id, projectData) => api.put(`/projects/${id}`, projectData)
export const deleteProject = (id) => api.delete(`/projects/${id}`)

// Tasks API 
export const getTasks = (projectId) => api.get(`/projects/${projectId}/tasks`)
export const getTask = (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`)
export const createTask = (projectId, taskData) => api.post(`/projects/${projectId}/tasks`, taskData)
export const updateTask = (projectId, taskId, taskData) => api.put(`/projects/${projectId}/tasks/${taskId}`, taskData)
export const deleteTask = (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`)

// Automations API
export const getAutomations = (projectId) => api.get(`/automations?project=${projectId}`)
export const createAutomation = (automationData) => api.post("/automations", automationData)
export const updateAutomation = (id, automationData) => api.put(`/automations/${id}`, automationData)
export const deleteAutomation = (id) => api.delete(`/automations/${id}`)

export default api
