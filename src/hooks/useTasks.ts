/**
 * ============================================================
 *  useTasks.ts  ·  Custom React Hook for Task Management
 * ============================================================
 *
 *  Encapsulates ALL task-related state and business logic in
 *  a single reusable hook.  Components that consume this hook
 *  receive clean data + actions — they never call the service
 *  layer directly, keeping UI components "dumb" and testable.
 *
 *  Interview talking points:
 *    • Separation of concerns — hook vs. component
 *    • useCallback to prevent unnecessary re-renders
 *    • Optimistic UI updates vs. pessimistic (server-first)
 *    • Error boundary vs. inline error state
 * ============================================================
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchTasks,
  createTask,
  toggleTask,
  deleteTask,
  updateTask,
  clearAllTasks,
} from "../services/taskService";
import {
  Task,
  NewTaskPayload,
  UpdateTaskPayload,
  TaskStats,
  FilterTab,
  SortOption,
} from "../types/task";

// ─── Return Type of the hook ─────────────────────────────────
interface UseTasksReturn {
  // Data
  tasks: Task[];
  filteredTasks: Task[];
  stats: TaskStats;
  isLoading: boolean;
  error: string | null;

  // Filter & Sort State
  activeFilter: FilterTab;
  setActiveFilter: (f: FilterTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;

  // CRUD Actions
  handleAddTask: (payload: NewTaskPayload) => Promise<void>;
  handleToggleTask: (id: string) => Promise<void>;
  handleDeleteTask: (id: string) => Promise<void>;
  handleUpdateTask: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  handleClearAll: () => Promise<void>;

  // UI state
  deletingIds: Set<string>;
}

// ─── Priority Weight Map (for sort-by-priority) ──────────────
const PRIORITY_WEIGHT: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

// ──────────────────────────────────────────────────────────────
//  Hook Implementation
// ──────────────────────────────────────────────────────────────
export const useTasks = (): UseTasksReturn => {
  // ── State ──────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ── Load Tasks on Mount ────────────────────────────────────
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []); // Empty dependency → runs once after initial render

  // ── Derived Statistics (memoised for performance) ──────────
  const stats = useMemo<TaskStats>(() => {
    const now = Date.now();
    const oneDayMs = 864e5;

    const completed = tasks.filter((t) => t.completed).length;
    const active = tasks.length - completed;
    const highPriority = tasks.filter(
      (t) => t.priority === "high" && !t.completed
    ).length;
    const dueSoon = tasks.filter(
      (t) =>
        t.dueDate &&
        !t.completed &&
        new Date(t.dueDate).getTime() - now > 0 &&
        new Date(t.dueDate).getTime() - now <= oneDayMs
    ).length;
    const overdue = tasks.filter(
      (t) =>
        t.dueDate && !t.completed && new Date(t.dueDate).getTime() < now
    ).length;

    return {
      total: tasks.length,
      completed,
      active,
      completionRate:
        tasks.length === 0
          ? 0
          : Math.round((completed / tasks.length) * 100),
      highPriority,
      dueSoon,
      overdue,
    };
  }, [tasks]);

  // ── Filtered & Sorted Task List (memoised) ─────────────────
  const filteredTasks = useMemo<Task[]>(() => {
    let result = [...tasks];

    // 1. Filter by completion status
    if (activeFilter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (activeFilter === "completed") {
      result = result.filter((t) => t.completed);
    }

    // 2. Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // 3. Full-text search across title + description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "priority":
          return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        case "dueDate": {
          const aD = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bD = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return aD - bD;
        }
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [tasks, activeFilter, searchQuery, sortOption, selectedCategory]);

  // ── CRUD Handlers ──────────────────────────────────────────

  /**
   *  Add Task — calls POST /api/tasks then prepends to local state.
   *  useCallback prevents this function from being recreated on
   *  every render, which matters when passing it as a prop.
   */
  const handleAddTask = useCallback(async (payload: NewTaskPayload) => {
    try {
      setError(null);
      const newTask = await createTask(payload);
      // Prepend so it appears at the top (mirrors sort: createdAt desc)
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      throw err; // Re-throw so the form can reset its own loading state
    }
  }, []);

  /**
   *  Toggle Task — optimistic update: flip the UI immediately,
   *  then sync with the backend.  Roll back on failure.
   */
  const handleToggleTask = useCallback(async (id: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t
      )
    );

    try {
      const updated = await toggleTask(id);
      // Sync with server response
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      // Roll back on error
      setTasks((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, completed: !t.completed } : t
        )
      );
      setError("Failed to update task");
    }
  }, []);

  /**
   *  Delete Task — marks task for fade-out animation, waits,
   *  then removes it from state + calls DELETE /api/tasks/:id.
   */
  const handleDeleteTask = useCallback(async (id: string) => {
    // Add to deleting set to trigger fade-out CSS class
    setDeletingIds((prev) => new Set(prev).add(id));

    // Wait for animation to complete
    await new Promise((r) => setTimeout(r, 350));

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError("Failed to delete task");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  /**
   *  Update Task — calls PUT /api/tasks/:id with the new payload.
   */
  const handleUpdateTask = useCallback(
    async (id: string, payload: UpdateTaskPayload) => {
      try {
        setError(null);
        const updated = await updateTask(id, payload);
        setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      } catch (err) {
        setError("Failed to update task");
        throw err;
      }
    },
    []
  );

  /**
   *  Clear All — removes every task (useful for demo resets).
   */
  const handleClearAll = useCallback(async () => {
    try {
      await clearAllTasks();
      setTasks([]);
    } catch {
      setError("Failed to clear tasks");
    }
  }, []);

  return {
    tasks,
    filteredTasks,
    stats,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    selectedCategory,
    setSelectedCategory,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
    handleUpdateTask,
    handleClearAll,
    deletingIds,
  };
};
