
# TaskBoard Pro

>**Advanced Task Collaboration App with Workflow Automation**

TaskBoard Pro is a comprehensive, real-time collaboration platform designed to streamline project and task management for teams of all sizes. Leveraging a modern MERN (MongoDB, Express, React, Node.js) architecture, TaskBoard Pro allows users to create and manage projects, track tasks using an intuitive Kanban-style board, assign tasks to teammates, and configure powerful automation rules to eliminate manual workflows. This README provides detailed information on features, architecture, setup, API usage, and data models.

---

## Table of Contents

1. [Deployed Link](#Deploye--Link)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Installation](#installation)  
   - [Environment Variables](#environment-variables)  
   - [Run the App](#run-the-app)  
5. [Architecture & Database Schema](#architecture--database-schema)  
6. [API Reference](#api-reference)  
7. [Workflow Automations](#workflow-automations)  
8. [Real-Time Notifications](#real-time-notifications)  
9. [Project Structure](#project-structure)  

---

## Deployed Link

   [Click on the Link](https://taskboard-client.onrender.com)

---

## Features

- **User Authentication**  
  - Email/password login & registration  
  - Token-based auth (JWT) with protected routes  

- **Project Management**  
  - Create, update, and delete projects  
  - Invite/remove members by email  
  - Owner-only settings & member permissions  

- **Task Management**  
  - Kanban board with default statuses: `To Do`, `In Progress`, `Done`  
  - Create/edit/delete tasks with title, description, assignee, due date  
  - Drag-and-drop to change status  

- **Workflow Automations**  
  - Define triggers: `status_change`, `assignee_change`, `due_date_passed`  
  - Define actions: `add_badge`, `change_status`, `send_notification`  
  - Server-side evaluation on task updates  

- **Real-Time Notifications**  
  - Socket.IO for instant toast messages when automation fires  
  - Polling fallback via REST `/notifications` endpoint  

- **Bonus**  
  - Custom statuses per project  
  - Badge display on tasks  
  - Notification settings

---

## Tech Stack

- **Frontend**: React, Tailwind CSS, React Router, React Beautiful DnD, React-Toastify  
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth, Socket.IO  
- **DevOps & Tools**: Vite, Nodemon, Postman, GitHub  

---

## Getting Started

### Prerequisites

- Node.js v14+  
- MongoDB (local or Atlas)  

### Installation

```bash
# Clone repository
git clone https://github.com/Soumyaditya25/TaskBoardPro.git
cd TaskBoardPro
```
```
# Install all dependencies (client & server)
npm run install-all
```
```
### Environment Variables
#Create a `.env` in **server/**:

PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000

#Create a `.env` in **client/**:

VITE_API_URL=http://localhost:5000
```

### Run the App

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Architecture & Database Schema

### Models

* **User**
  `_id`, `name`, `email`, `passwordHash`, `photoURL`

* **Project**
  `_id`, `title`, `description`, `owner`, `members`, `statuses`

* **Task**
  `_id`, `title`, `description`, `status`, `assignee`, `dueDate`, `badges`, `project`, `createdBy`

* **Automation**
  `_id`, `project`, `name`, `trigger: { type, condition }`, `action: { type, params }`, `createdBy`

* **Notification**
  `_id`, `user`, `message`, `relatedTask`, `read`, `createdAt`

---

## API Reference

### Authentication

| Endpoint             | Method | Description              | Protected |
| -------------------- | ------ | ------------------------ | --------- |
| `/api/auth/register` | POST   | Register new user        | No        |
| `/api/auth/login`    | POST   | Login & receive JWT      | No        |
| `/api/auth/me`       | GET    | Get current user profile | Yes       |

### Projects

| Endpoint                            | Method | Description              | Protected |
| ----------------------------------- | ------ | ------------------------ | --------- |
| `/api/projects`                     | GET    | List all user’s projects | Yes       |
| `/api/projects`                     | POST   | Create new project       | Yes       |
| `/api/projects/:id`                 | GET    | Get project details      | Yes       |
| `/api/projects/:id`                 | PUT    | Update project           | Yes       |
| `/api/projects/:id`                 | DELETE | Delete project           | Yes       |
| `/api/projects/:id/members`         | POST   | Add member by user ID    | Yes       |
| `/api/projects/:id/members/:userId` | DELETE | Remove member            | Yes       |

### Tasks

| Endpoint                             | Method | Description                    | Protected |
| ------------------------------------ | ------ | ------------------------------ | --------- |
| `/api/projects/:projectId/tasks`     | GET    | List tasks in project          | Yes       |
| `/api/projects/:projectId/tasks`     | POST   | Create new task                | Yes       |
| `/api/projects/:projectId/tasks/:id` | GET    | Get single task                | Yes       |
| `/api/projects/:projectId/tasks/:id` | PUT    | Update task (runs automations) | Yes       |
| `/api/projects/:projectId/tasks/:id` | DELETE | Delete task                    | Yes       |

### Automations

| Endpoint                        | Method | Description                  | Protected |
| ------------------------------- | ------ | ---------------------------- | --------- |
| `/api/automations?project=<id>` | GET    | List automations for project | Yes       |
| `/api/automations`              | POST   | Create new automation        | Yes       |
| `/api/automations/:id`          | GET    | Get automation by ID         | Yes       |
| `/api/automations/:id`          | PUT    | Update automation            | Yes       |
| `/api/automations/:id`          | DELETE | Delete automation            | Yes       |

### Notifications

| Endpoint                  | Method | Description                                       | Protected |
| ------------------------- | ------ | ------------------------------------------------- | --------- |
| `/api/notifications`      | GET    | List current user’s notifications                 | Yes       |
| `/api/ping-notif/:userId` | GET    | *(Test)* Emit a manual notification via WebSocket | No        |

---

## Workflow Automations

1. **Define Trigger**

   * `status_change` → when task moves to a specific status
   * `assignee_change` → when task is assigned to a user
   * `due_date_passed` → when X days have passed since due date

2. **Define Action**

   * `add_badge` → tack a badge onto the task
   * `change_status` → move the task to another status
   * `send_notification` → generate a toast via WebSocket (and persist)

3. **Server-Side Processing**

   * On every `PUT /tasks/:id`, the backend runs all automations for that project
   * Matching automations fire immediately, updating the task and/or notifying the assignee

---

## Real-Time Notifications

* **Socket.IO**: Clients join a room named after their user ID
* **Server**: Emits `new-notification` events to that room when an automation’s action is `send_notification`
* **Client**: A React component listens and uses React-Toastify to pop a toast instantly

---

## Project Structure

```
/
├── client
│   ├── node_modules
│   ├── public
│   ├── src
│   │   ├── components        # Reusable React components
│   │   ├── context           # AuthContext and other providers
│   │   ├── pages             # Route-based page components
│   │   ├── services          # Axios API wrappers
│   │   ├── styles            # Tailwind/stylesheet files
│   │   ├── utils             # Utility functions
│   │   ├── App.jsx           # Main application component
│   │   ├── main.jsx          # Entry point for ReactDOM
│   │   └── socket.js         # Socket.IO client setup
│   ├── postcss.config.js     # PostCSS setup
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── index.html            # HTML template for Vite
│   ├── vite.config.js        # Vite build configuration
│   ├── package.json          # Frontend dependencies & scripts
│   └── package-lock.json
│
├── server
│   ├── config                # Database connection & env setup
│   ├── controllers           # Express route handlers
│   ├── middleware            # Auth, error handlers, etc.
│   ├── models                # Mongoose schemas
│   ├── routes                # Express routers
│   ├── utils                 # Helper functions (e.g. logging)
│   ├── server.js             # Express app + Socket.IO setup
│   ├── .env                  # Server environment variables
│   └── package.json          # Backend dependencies & scripts
│
├── .gitignore
└── README.md                 # Project documentation
```



Made with ❤️ by Soumyaditya


