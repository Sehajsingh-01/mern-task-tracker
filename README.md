# ⚡ TaskFlow — Personal Task & Achievement Tracker

> A full-stack **MERN** application for managing personal tasks with priorities, categories, due dates, and achievement badges.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## 📸 Preview
<img width="1919" height="910" alt="Screenshot 2026-05-05 192630" src="https://github.com/user-attachments/assets/530d88bf-c24c-4a53-961c-541cf8460bd5" /> <br>
<img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/96071cef-724c-406e-b782-62959a1c1176" />


```
┌─────────────────────────────────────────────────────────┐
│  ⚡ TaskFlow                  [Search…]       [+ Add]   │
├──────────────────────────────────┬──────────────────────┤
│  📋 All  ⚡ Active  ✅ Done      │  📊 Dashboard         │
│                                  │                       │
│  ┌──────────────────────────┐   │  Progress: 40%        │
│  │ ☑ Setup MERN project    │   │  ████████░░░░░░░░░░   │
│  │ 🔴 High · 💼 Work       │   │                       │
│  └──────────────────────────┘   │  🎯 2 High Priority   │
│  ┌──────────────────────────┐   │  ⏰ 1 Due Soon        │
│  │ ☐ Study React hooks     │   │  ✅ 2 Completed        │
│  │ 🟡 Medium · 📚 Learning │   │                       │
│  └──────────────────────────┘   │  🏆 Achievements      │
│                                  │  🚀 ⚡ 🏆 🔥 💯 🌟  │
└──────────────────────────────────┴──────────────────────┘
```

---

## 📁 Folder Structure

```
taskflow/
│
├── server/                          # ── Backend (Node.js + Express)
│   ├── models/
│   │   └── TaskModel.js             # Mongoose Schema & Model
│   ├── routes/
│   │   └── taskRoutes.js            # Express Router (RESTful)
│   ├── controllers/
│   │   └── taskController.js        # Business logic handlers
│   ├── middleware/
│   │   └── errorHandler.js          # Global error middleware
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   └── server.js                    # Express app entry point
│
├── client/                          # ── Frontend (React + Vite)
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── backend/                 # Backend reference files
│   │   │   ├── server.js            # Annotated Express server
│   │   │   └── TaskModel.js         # Annotated Mongoose model
│   │   ├── components/
│   │   │   ├── TaskComponent.tsx    # Individual task card
│   │   │   ├── AddTaskForm.tsx      # New task modal form
│   │   │   └── StatsPanel.tsx       # Dashboard sidebar
│   │   ├── hooks/
│   │   │   └── useTasks.ts          # Custom React hook (all state)
│   │   ├── services/
│   │   │   └── taskService.ts       # API layer (Axios / localStorage)
│   │   ├── types/
│   │   │   └── task.ts              # TypeScript interfaces
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # Vite entry point
│   │   └── index.css                # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── .env                             # Environment variables (never commit!)
├── .gitignore
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **➕ Add Tasks** | Create tasks with title, description, priority, category, and due date |
| **✅ Complete Tasks** | Toggle completion with optimistic UI updates |
| **✏️ Edit Tasks** | Inline editing with full field support |
| **🗑️ Delete Tasks** | Smooth fade-out animation + confirmation modal |
| **🔍 Search** | Real-time full-text search across title and description |
| **🏷️ Categories** | Work, Personal, Health, Learning, Finance, Other |
| **🎯 Priority Levels** | High 🔴, Medium 🟡, Low 🟢 with visual badges |
| **📅 Due Dates** | Date tracking with overdue / due-soon indicators |
| **📊 Dashboard** | Live stats: completion rate, high priority count, overdue tasks |
| **🏆 Achievements** | Gamified badges that unlock as you complete tasks |
| **📱 Responsive** | Mobile-first layout with slide-out sidebar drawer |
| **💾 Persistent** | LocalStorage in demo mode; MongoDB in production |

---

## 🏗️ Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │                    MERN Stack Architecture                  │
 │                                                             │
 │   React Client          Express Server         MongoDB      │
 │  ┌──────────┐          ┌──────────────┐      ┌──────────┐   │
 │  │ App.tsx  │──HTTP──▶ │  server.js   │─────▶│  Tasks   │  │
 │  │          │◀──JSON── │  /api/tasks  │◀─────│Collection│  │
 │  │ useTasks │          └──────────────┘      └──────────┘   │
 │  │  hook    │              │     │                          │
 │  └──────────┘         Routes  Mongoose                      │
 │       │               Controllers  Model                    │
 │       ▼                                                     │
 │  taskService.ts     (Axios calls in production)             │
 └─────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **React** component calls a handler from `useTasks()` hook
2. Hook calls the corresponding function in `taskService.ts`
3. Service makes an **HTTP request** to the **Express** REST API
4. Express route handler calls the **controller** function
5. Controller uses the **Mongoose model** to query **MongoDB**
6. Response flows back up and React re-renders with new data

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org)
- **MongoDB Atlas** account — [Sign up free](https://www.mongodb.com/atlas)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/taskflow-mern.git
cd taskflow-mern
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tasktracker
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

> ⚠️ **Never commit `.env` to Git!** Add it to `.gitignore`.

Start the backend server:
```bash
npm run dev          # Uses nodemon for hot-reload
```

### 3. Set Up the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm run dev
```

### 4. Open the App

Visit: **http://localhost:5173**

---

## 📡 REST API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/tasks` | Get all tasks | — |
| `POST` | `/tasks` | Create a task | `{ title, description?, priority?, category?, dueDate? }` |
| `PUT` | `/tasks/:id` | Update a task | `{ title?, description?, priority?, category?, dueDate? }` |
| `PATCH` | `/tasks/:id/toggle` | Toggle completed | — |
| `DELETE` | `/tasks/:id` | Delete a task | — |

### Example Request

```javascript
// POST /api/tasks
const response = await fetch("http://localhost:5000/api/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Learn MERN Stack",
    description: "Build a full-stack app with MongoDB, Express, React, Node.js",
    priority: "high",
    category: "learning",
    dueDate: "2025-12-31"
  })
});
const data = await response.json();
// { success: true, data: { _id: "...", title: "...", ... } }
```

### Example Response

```json
{
  "success": true,
  "data": {
    "_id": "6507f1f77bcf86cd799439011",
    "title": "Learn MERN Stack",
    "description": "Build a full-stack app",
    "completed": false,
    "priority": "high",
    "category": "learning",
    "dueDate": "2025-12-31T00:00:00.000Z",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 🗄️ MongoDB Schema

```javascript
// server/models/TaskModel.js
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["work", "personal", "health", "learning", "finance", "other"],
      default: "personal",
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,  // Auto-adds createdAt and updatedAt
  }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
```

---

## 🧩 Key Components

### `useTasks.ts` — Custom React Hook
The brain of the frontend. Encapsulates all task state and CRUD operations. Components consume this hook and never touch the service layer directly.

```typescript
const {
  filteredTasks,    // Filtered + sorted task list
  stats,            // Aggregate statistics
  handleAddTask,    // POST /api/tasks
  handleToggleTask, // PATCH /api/tasks/:id/toggle
  handleDeleteTask, // DELETE /api/tasks/:id
  handleUpdateTask, // PUT /api/tasks/:id
} = useTasks();
```

### `TaskComponent.tsx` — Task Card
A "controlled" component that displays a single task and exposes edit/delete actions. Owns only local UI state (isEditing, showDeleteConfirm).

### `AddTaskForm.tsx` — Creation Form
A controlled form with client-side validation mirroring Mongoose schema rules. Opens as a modal overlay.

### `StatsPanel.tsx` — Dashboard
Renders aggregated statistics and achievement badges. Data comes from `useMemo` in `useTasks.ts`.

### `taskService.ts` — API Layer
The single place where HTTP requests are made. In production, swap localStorage calls with Axios calls to the Express API.

---

## 🎯 Interview Q&A

**Q: Why use a custom hook instead of putting state in App.tsx?**
> Separation of concerns. The hook handles *what* to do (business logic), the component handles *how to render* it. The hook is also independently testable with React Testing Library's `renderHook`.

**Q: What is Mongoose and why use it?**
> Mongoose is an Object Data Modeling (ODM) library for MongoDB. It adds schema validation, type casting, query building, and middleware (e.g., pre-save hooks for password hashing) on top of the native MongoDB driver.

**Q: What's the difference between PUT and PATCH?**
> `PUT` replaces the entire resource (idempotent full update). `PATCH` applies a partial update — we use it for the toggle endpoint since only one field changes.

**Q: How does optimistic UI work?**
> When the user toggles a task, we flip the UI immediately *before* the API call completes. This makes the app feel instant. If the API call fails, we roll back to the previous state.

**Q: How would you add authentication to this app?**
> Add a `User` model with bcrypt password hashing, a POST `/api/auth/login` route that returns a JWT, and an `authMiddleware` that verifies the JWT on every protected route. On the frontend, store the token in an HttpOnly cookie and attach it via an Axios interceptor.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Database | **MongoDB Atlas** | NoSQL document storage |
| ODM | **Mongoose** | Schema, validation, queries |
| Backend | **Node.js** + **Express** | REST API server |
| Frontend | **React 18** + **TypeScript** | UI components & state |
| Styling | **Tailwind CSS v4** | Utility-first CSS |
| Build Tool | **Vite** | Fast dev server & bundler |
| HTTP Client | **Axios** (production) | API requests |

---

## 📦 Dependencies

### Backend (`server/package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend (`client/package.json`)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^7.0.0"
  }
}
```

---

## 🚀 Deployment

### Backend → Railway / Render
```bash
# Set environment variables in dashboard:
# MONGO_URI, PORT, NODE_ENV=production, CLIENT_ORIGIN
npm start
```

### Frontend → Vercel / Netlify
```bash
npm run build
# Deploy the dist/ folder
# Set VITE_API_URL to your deployed backend URL
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

Built with ❤️ as a MERN Stack interview project.

**Technologies used:**
- 🍃 MongoDB — Document database
- ⚙️ Express.js — Web framework for Node.js
- ⚛️ React.js — Frontend UI library
- 🟢 Node.js — JavaScript runtime
- 🎨 Tailwind CSS — Utility-first styling
- 📘 TypeScript — Type-safe JavaScript

---

*"Clean code is not written by following a set of rules. Clean code is written by a programmer who cares."* — Robert C. Martin
