/**
 * ============================================================
 *  task.ts  ·  TypeScript Type Definitions
 * ============================================================
 *
 *  Centralising types in one file means:
 *    • A single source of truth for Task shape across the app
 *    • Any schema change in MongoDB / Mongoose is one edit here
 *    • IDE auto-complete works across every component
 *
 *  These types mirror the Mongoose TaskModel.js schema fields
 *  exactly so the frontend and backend speak the same language.
 * ============================================================
 */

// ─── Priority Levels ──────────────────────────────────────────
export type Priority = "low" | "medium" | "high";

// ─── Category Tags ────────────────────────────────────────────
export type Category =
  | "work"
  | "personal"
  | "health"
  | "learning"
  | "finance"
  | "other";

// ─── Filter Tabs ──────────────────────────────────────────────
export type FilterTab = "all" | "active" | "completed";

// ─── Sort Options ─────────────────────────────────────────────
export type SortOption = "newest" | "oldest" | "priority" | "dueDate";

// ─── Core Task Document (mirrors MongoDB document shape) ──────
export interface Task {
  /** MongoDB ObjectId as string */
  _id: string;

  /** Task title — required, max 150 chars */
  title: string;

  /** Optional longer description */
  description: string;

  /** Has the user completed this task? */
  completed: boolean;

  /** Urgency level */
  priority: Priority;

  /** Organisational category */
  category: Category;

  /** Optional due date (ISO string or null) */
  dueDate: string | null;

  /** Automatically set by Mongoose { timestamps: true } */
  createdAt: string;

  /** Automatically updated by Mongoose on every save */
  updatedAt: string;
}

// ─── Payload for POST /api/tasks ─────────────────────────────
export interface NewTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string | null;
}

// ─── Payload for PUT /api/tasks/:id ──────────────────────────
export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string | null;
  completed?: boolean;
}

// ─── Statistics Object ────────────────────────────────────────
export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number;     // 0–100
  highPriority: number;
  dueSoon: number;            // Due within 24 hours
  overdue: number;
}
