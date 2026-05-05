/**
 * ============================================================
 *  TaskComponent.tsx  ·  Individual Task Card
 * ============================================================
 *
 *  Renders a single Task document returned from the MongoDB
 *  /api/tasks endpoint.  Responsibilities:
 *    • Display task data (title, description, priority, etc.)
 *    • Toggle completed status  →  PATCH /api/tasks/:id/toggle
 *    • Edit task inline         →  PUT  /api/tasks/:id
 *    • Delete task              →  DELETE /api/tasks/:id
 *
 *  This is a "controlled" component — it owns no data state.
 *  All state lives in the parent via the useTasks() hook.
 *
 *  Interview talking points:
 *    • Controlled vs. uncontrolled components
 *    • Props drilling vs. Context vs. custom hooks
 *    • Why we pass handlers as props (testability)
 *    • CSS animation + state flag for delete confirmation
 * ============================================================
 */

import React, { useState, useRef, useEffect } from "react";
import { Task, Priority, Category, UpdateTaskPayload } from "../types/task";

// ─── Props Interface ──────────────────────────────────────────
interface TaskComponentProps {
  task: Task;
  isDeleting: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, payload: UpdateTaskPayload) => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; className: string; icon: string }
> = {
  high: { label: "High", className: "priority-high", icon: "🔴" },
  medium: { label: "Medium", className: "priority-medium", icon: "🟡" },
  low: { label: "Low", className: "priority-low", icon: "🟢" },
};

const CATEGORY_COLORS: Record<Category, string> = {
  work: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  personal: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  health: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  learning: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  finance: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  other: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const CATEGORY_ICONS: Record<Category, string> = {
  work: "💼",
  personal: "👤",
  health: "🏃",
  learning: "📚",
  finance: "💰",
  other: "📌",
};

// ─── Helper: Format a due date for display ───────────────────
const formatDueDate = (
  dueDate: string | null
): { text: string; isOverdue: boolean; isDueSoon: boolean } => {
  if (!dueDate) return { text: "", isOverdue: false, isDueSoon: false };

  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = diffMs < 0;
  const isDueSoon = diffMs > 0 && diffMs <= 864e5; // within 24h

  let text: string;
  if (isOverdue) {
    const overdueDays = Math.abs(diffDays);
    text = overdueDays === 0 ? "Due today" : `Overdue by ${overdueDays}d`;
  } else if (diffDays === 0) {
    text = "Due today";
  } else if (diffDays === 1) {
    text = "Due tomorrow";
  } else if (diffDays <= 7) {
    text = `Due in ${diffDays}d`;
  } else {
    text = `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }

  return { text, isOverdue, isDueSoon };
};

// ──────────────────────────────────────────────────────────────
//  TaskComponent
// ──────────────────────────────────────────────────────────────
const TaskComponent: React.FC<TaskComponentProps> = ({
  task,
  isDeleting,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  // ── Local UI State ─────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Edit form state (initialised from task props)
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editCategory, setEditCategory] = useState<Category>(task.category);
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? task.dueDate.split("T")[0] : ""
  );

  // Ref to focus the edit input automatically
  const editInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the title input when edit mode opens
  useEffect(() => {
    if (isEditing) editInputRef.current?.focus();
  }, [isEditing]);

  // ── Derived Values ─────────────────────────────────────────
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const dueInfo = formatDueDate(task.dueDate);
  const formattedCreatedAt = new Date(task.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  // ── Handlers ───────────────────────────────────────────────

  /** Save edits — calls PUT /api/tasks/:id via parent handler */
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      const payload: UpdateTaskPayload = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        category: editCategory,
        dueDate: editDueDate || null,
      };
      await onUpdate(task._id, payload);
      setIsEditing(false);
    } catch {
      // Parent hook already sets error state
    } finally {
      setIsSaving(false);
    }
  };

  /** Cancel edit — restore original values */
  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setIsEditing(false);
  };

  /** Keyboard shortcut: Enter to save, Escape to cancel */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") handleCancelEdit();
  };

  // ── Render: Edit Mode ─────────────────────────────────────
  if (isEditing) {
    return (
      <div
        className="glass-light rounded-2xl p-5 task-card slide-in"
        style={{ borderColor: "rgba(99, 102, 241, 0.5)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs text-indigo-400 font-mono font-medium">
            EDITING TASK
          </span>
        </div>

        {/* Title Input */}
        <input
          ref={editInputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task title..."
          className="input-field w-full rounded-xl px-4 py-2.5 text-sm font-medium mb-3"
        />

        {/* Description Textarea */}
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description (optional)..."
          rows={2}
          className="input-field w-full rounded-xl px-4 py-2.5 text-sm mb-3 resize-none"
        />

        {/* Priority + Category + Due Date Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as Priority)}
            className="input-field rounded-xl px-3 py-2 text-xs"
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value as Category)}
            className="input-field rounded-xl px-3 py-2 text-xs"
          >
            <option value="work">💼 Work</option>
            <option value="personal">👤 Personal</option>
            <option value="health">🏃 Health</option>
            <option value="learning">📚 Learning</option>
            <option value="finance">💰 Finance</option>
            <option value="other">📌 Other</option>
          </select>

          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="input-field rounded-xl px-3 py-2 text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSaveEdit}
            disabled={isSaving || !editTitle.trim()}
            className="btn-primary flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
          >
            {isSaving ? "Saving…" : "✓ Save Changes"}
          </button>
          <button
            onClick={handleCancelEdit}
            className="flex-1 rounded-xl py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            style={{ background: "rgba(30,41,59,0.6)" }}
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Display Mode ──────────────────────────────────
  return (
    <div
      className={`glass-light rounded-2xl task-card ${isDeleting ? "fade-out" : "slide-in"} ${
        task.completed ? "opacity-70" : ""
      }`}
    >
      {/* ── Card Header ─────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 pb-0">
        {/* Completion Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task._id)}
          className="custom-checkbox mt-0.5"
          aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
        />

        {/* Title & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-semibold leading-snug break-words ${
                task.completed ? "strike-through" : "text-slate-100"
              }`}
            >
              {task.title}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Expand / Collapse */}
              {task.description && (
                <button
                  onClick={() => setIsExpanded((v) => !v)}
                  className="tooltip p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 transition-all"
                  data-tip={isExpanded ? "Collapse" : "Details"}
                  aria-label="Toggle details"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="tooltip p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                data-tip="Edit"
                aria-label="Edit task"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="tooltip p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                data-tip="Delete"
                aria-label="Delete task"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Priority Badge */}
            <span
              className={`category-badge ${priorityConfig.className} text-[10px]`}
            >
              {priorityConfig.icon} {priorityConfig.label}
            </span>

            {/* Category Badge */}
            <span
              className={`category-badge border text-[10px] ${
                CATEGORY_COLORS[task.category]
              }`}
            >
              {CATEGORY_ICONS[task.category]} {task.category}
            </span>

            {/* Due Date Badge */}
            {dueInfo.text && (
              <span
                className={`category-badge border text-[10px] ${
                  dueInfo.isOverdue
                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                    : dueInfo.isDueSoon
                    ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                    : "bg-slate-500/20 text-slate-400 border-slate-500/20"
                }`}
              >
                📅 {dueInfo.text}
              </span>
            )}

            {/* Completed Badge */}
            {task.completed && (
              <span className="category-badge border text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                ✅ Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Expandable Description ──────────────────────── */}
      {isExpanded && task.description && (
        <div className="px-4 pt-2 pb-3 ml-9">
          <p className="text-xs text-slate-400 leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      {/* ── Card Footer ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 mt-1 border-t border-white/5">
        <span className="text-[10px] text-slate-600 font-mono">
          Added {formattedCreatedAt}
        </span>
        <span className="text-[10px] text-slate-600 font-mono">
          ID: {task._id.slice(-8)}
        </span>
      </div>

      {/* ── Delete Confirmation Modal ────────────────────── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-sm w-full mx-4 modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-base font-bold text-white mb-1">
                Delete Task?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "<span className="text-slate-300">{task.title}</span>" will be
                permanently removed from MongoDB.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(task._id);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                style={{ background: "rgba(30,41,59,0.6)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskComponent;
