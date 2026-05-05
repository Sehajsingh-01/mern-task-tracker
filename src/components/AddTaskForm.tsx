/**
 * ============================================================
 *  AddTaskForm.tsx  ·  New Task Creation Form
 * ============================================================
 *
 *  A controlled form that collects all fields required by the
 *  POST /api/tasks endpoint (matches the Mongoose TaskModel
 *  schema fields).
 *
 *  Interview talking points:
 *    • Controlled form inputs — every field is wired to state
 *    • Client-side validation mirrors Mongoose schema rules
 *    • Why we reset the form on successful submission
 *    • Accessibility: aria-label, aria-required, etc.
 * ============================================================
 */

import React, { useState, useRef, useEffect } from "react";
import { NewTaskPayload, Priority, Category } from "../types/task";

// ─── Props ────────────────────────────────────────────────────
interface AddTaskFormProps {
  onAddTask: (payload: NewTaskPayload) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Default Form State ───────────────────────────────────────
const DEFAULT_STATE = {
  title: "",
  description: "",
  priority: "medium" as Priority,
  category: "personal" as Category,
  dueDate: "",
};

// ──────────────────────────────────────────────────────────────
const AddTaskForm: React.FC<AddTaskFormProps> = ({
  onAddTask,
  isOpen,
  onClose,
}) => {
  const [form, setForm] = useState(DEFAULT_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-focus title when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Field Change Handler ───────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "title") setValidationError(""); // Clear error on type
  };

  // ── Submit Handler ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation (mirrors Mongoose schema rules)
    if (!form.title.trim()) {
      setValidationError("Task title is required");
      titleRef.current?.focus();
      return;
    }
    if (form.title.length > 150) {
      setValidationError("Title must be 150 characters or fewer");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTask({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category,
        dueDate: form.dueDate || null,
      });
      // Reset form and close on success
      setForm(DEFAULT_STATE);
      setValidationError("");
      onClose();
    } catch {
      // Error is already set in the parent hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Keyboard: close on Escape ──────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop px-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="glass rounded-3xl p-6 w-full max-w-lg modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Create New Task</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              POST /api/tasks  ·  Mongoose model validation active
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            aria-label="Close form"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Title ─────────────────────────────────────── */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              maxLength={150}
              aria-required="true"
              className={`input-field w-full rounded-xl px-4 py-3 text-sm ${
                validationError ? "border-red-500/60" : ""
              }`}
            />
            <div className="flex justify-between mt-1">
              {validationError ? (
                <p className="text-xs text-red-400">{validationError}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-600">
                {form.title.length}/150
              </span>
            </div>
          </div>

          {/* ── Description ───────────────────────────────── */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Description <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add more context, notes, or sub-steps…"
              rows={3}
              className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
          </div>

          {/* ── Priority + Category Row ────────────────────── */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="input-field w-full rounded-xl px-4 py-3 text-sm"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input-field w-full rounded-xl px-4 py-3 text-sm"
              >
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="health">🏃 Health</option>
                <option value="learning">📚 Learning</option>
                <option value="finance">💰 Finance</option>
                <option value="other">📌 Other</option>
              </select>
            </div>
          </div>

          {/* ── Due Date ──────────────────────────────────── */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Due Date <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="input-field w-full rounded-xl px-4 py-3 text-sm"
            />
          </div>

          {/* ── Submit Button ─────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full rounded-xl py-3.5 text-sm font-bold text-white relative z-10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving to MongoDB…
              </span>
            ) : (
              "＋ Add Task"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm;
