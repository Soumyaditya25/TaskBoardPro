import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Project from "./pages/Project";
import NotFound from "./pages/NotFound";
import NotificationsListener from "./components/NotificationsListener";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";
import { socket } from "./socket";

function App() {
  const { currentUser } = useAuth();
  // After login, join your Socket.IO room
  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("join", currentUser._id);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <NotificationsListener />
      <ToastContainer position="top-right" autoClose={5000} newestOnTop />
      <main className="pt-16">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/project/:id"
            element={<ProtectedRoute><Project /></ProtectedRoute>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
