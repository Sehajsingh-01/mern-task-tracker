/**
 * ============================================================
 *  taskService.ts  ·  API Service Layer
 * ============================================================
 *
 *  In a real MERN application this file would use Axios to
 *  make HTTP requests to the Express backend:
 *
 *    import axios from "axios";
 *    const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
 *
 *  For this demo the data is persisted to localStorage, which
 *  lets you run the app without a running Node.js server while
 *  keeping the exact same function signatures / return shapes
 *  that the real Axios version would produce.
 *
 *  ── Swap Guide ───────────────────────────────────────────
 *  To connect a real backend, replace each function body with
 *  the commented Axios call shown above it.
 * ============================================================
 */

import { Task, NewTaskPayload, UpdateTaskPayload } from "../types/task";

// ─── Storage Key ──────────────────────────────────────────────
const STORAGE_KEY = "taskflow_tasks_v1";

// ─── Seed Data (shown on first load) ─────────────────────────
const SEED_TASKS: Task[] = [
  {
    _id: "seed_1",
    title: "Set up MERN project structure",
    description: "Initialize Node.js server, configure Express routes, and connect MongoDB Atlas.",
    completed: true,
    priority: "high",
    category: "work",
    dueDate: null,
    createdAt: new Date(Date.now() - 7 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 864e5).toISOString(),
  },
  {
    _id: "seed_2",
    title: "Design Mongoose Task Schema",
    description: "Define fields, types, validators, and default values in TaskModel.js.",
    completed: true,
    priority: "high",
    category: "work",
    dueDate: null,
    createdAt: new Date(Date.now() - 6 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 864e5).toISOString(),
  },
  {
    _id: "seed_3",
    title: "Study React hooks — useEffect & useCallback",
    description: "Deep dive into dependency arrays and cleanup functions to prevent memory leaks.",
    completed: false,
    priority: "medium",
    category: "learning",
    dueDate: new Date(Date.now() + 3 * 864e5).toISOString(),
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  {
    _id: "seed_4",
    title: "30-minute workout session",
    description: "Cardio + strength training. Stay consistent for the week.",
    completed: false,
    priority: "medium",
    category: "health",
    dueDate: new Date(Date.now() + 1 * 864e5).toISOString(),
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 864e5).toISOString(),
  },
  {
    _id: "seed_5",
    title: "Review monthly budget spreadsheet",
    description: "Check expenses vs. income and adjust savings plan accordingly.",
    completed: false,
    priority: "low",
    category: "finance",
    dueDate: new Date(Date.now() + 5 * 864e5).toISOString(),
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 864e5).toISOString(),
  },
];

// ─── Helper: Load tasks from localStorage ────────────────────
const loadFromStorage = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_TASKS;
    return JSON.parse(raw) as Task[];
  } catch {
    return SEED_TASKS;
  }
};

// ─── Helper: Save tasks to localStorage ──────────────────────
const saveToStorage = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

// ─── Helper: Generate MongoDB-style ObjectId string ──────────
const generateId = (): string => {
  // Real MongoDB ObjectIds are 24-char hex strings
  return (
    Math.floor(Date.now() / 1000).toString(16).padStart(8, "0") +
    "xxxxxxxxxxxxxxxx".replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    )
  );
};

// ─── Simulated network delay (mimics real API latency) ────────
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ============================================================
//  API Functions  (mirror the Express routes in server.js)
// ============================================================

/**
 *  GET /api/tasks
 *  Fetch all tasks, sorted newest-first (matches MongoDB sort)
 *
 *  Real Axios version:
 *    const res = await axios.get(`${API_BASE}/tasks`);
 *    return res.data.data;
 */
export const fetchTasks = async (): Promise<Task[]> => {
  await delay(300);
  const tasks = loadFromStorage();
  // Sort newest createdAt first — mirrors MongoDB .sort({ createdAt: -1 })
  return [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 *  POST /api/tasks
 *  Create a new task document
 *
 *  Real Axios version:
 *    const res = await axios.post(`${API_BASE}/tasks`, payload);
 *    return res.data.data;
 */
export const createTask = async (payload: NewTaskPayload): Promise<Task> => {
  await delay(200);

  // Validation mirrors Mongoose required-field validation
  if (!payload.title?.trim()) {
    throw new Error("Task title is required");
  }
  if (payload.title.length > 150) {
    throw new Error("Title cannot exceed 150 characters");
  }

  const now = new Date().toISOString();
  const newTask: Task = {
    _id: generateId(),
    title: payload.title.trim(),
    description: payload.description?.trim() ?? "",
    completed: false,
    priority: payload.priority ?? "medium",
    category: payload.category ?? "personal",
    dueDate: payload.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const tasks = loadFromStorage();
  saveToStorage([newTask, ...tasks]);
  return newTask;
};

/**
 *  PATCH /api/tasks/:id/toggle
 *  Toggle the completed boolean for a specific task
 *
 *  Real Axios version:
 *    const res = await axios.patch(`${API_BASE}/tasks/${id}/toggle`);
 *    return res.data.data;
 */
export const toggleTask = async (id: string): Promise<Task> => {
  await delay(150);

  const tasks = loadFromStorage();
  const index = tasks.findIndex((t) => t._id === id);

  if (index === -1) throw new Error("Task not found");

  tasks[index] = {
    ...tasks[index],
    completed: !tasks[index].completed,
    updatedAt: new Date().toISOString(),
  };

  saveToStorage(tasks);
  return tasks[index];
};

/**
 *  PUT /api/tasks/:id
 *  Full update — replace all editable fields
 *
 *  Real Axios version:
 *    const res = await axios.put(`${API_BASE}/tasks/${id}`, payload);
 *    return res.data.data;
 */
export const updateTask = async (
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> => {
  await delay(200);

  const tasks = loadFromStorage();
  const index = tasks.findIndex((t) => t._id === id);

  if (index === -1) throw new Error("Task not found");

  tasks[index] = {
    ...tasks[index],
    ...payload,
    _id: id, // Never overwrite the _id
    updatedAt: new Date().toISOString(),
  };

  saveToStorage(tasks);
  return tasks[index];
};

/**
 *  DELETE /api/tasks/:id
 *  Permanently remove a task document
 *
 *  Real Axios version:
 *    await axios.delete(`${API_BASE}/tasks/${id}`);
 */
export const deleteTask = async (id: string): Promise<void> => {
  await delay(200);

  const tasks = loadFromStorage();
  const filtered = tasks.filter((t) => t._id !== id);

  if (filtered.length === tasks.length) throw new Error("Task not found");

  saveToStorage(filtered);
};

/**
 *  Utility: Clear all tasks (useful for testing)
 */
export const clearAllTasks = async (): Promise<void> => {
  await delay(100);
  saveToStorage([]);
};
