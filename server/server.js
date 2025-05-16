const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/projects", require("./routes/project.routes"));
app.use("/api/projects/:projectId/tasks", require("./routes/task.routes"));
app.use("/api/automations", require("./routes/automation.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

app.get("/", (req, res) => res.json({ message: "Welcome to TaskBoard Pro API" }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL || "http://localhost:3000" } });
module.exports.io = io;

io.on("connection", socket => {
  console.log("Socket connected:", socket.id);
  socket.on("join", userId => {
    socket.join(userId);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message, stack: process.env.NODE_ENV === "production" ? null : err.stack });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server + Socket.IO listening on ${PORT}`));
