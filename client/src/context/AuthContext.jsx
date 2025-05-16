import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")

        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`

          const response = await api.get("/auth/me")
          setCurrentUser(response.data)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        localStorage.removeItem("token")
        api.defaults.headers.common["Authorization"] = ""
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    setCurrentUser(user)

    return user
  }

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    setCurrentUser(user)

    return user
  }

  const logout = () => {
    localStorage.removeItem("token")

    api.defaults.headers.common["Authorization"] = ""

    setCurrentUser(null)
  }

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
