/**
 * ============================================================
 *  App.tsx  ·  Root Component  ·  TaskFlow MERN Tracker
 * ============================================================
 *
 *  This is the top-level component — the React equivalent of
 *  the Express app object in server.js.  It:
 *    1. Calls the useTasks() custom hook (all state lives here)
 *    2. Composes the layout: Sidebar, Header, TaskList, Forms
 *    3. Passes down only the props each child component needs
 *
 *  Data flow (mirrors MERN architecture):
 *    MongoDB  →  Express API  →  taskService.ts  →  useTasks()
 *                                                      ↓
 *                    App.tsx (state owner & prop dispatcher)
 *                      ↙           ↓          ↘
 *               StatsPanel   TaskComponent  AddTaskForm
 *
 *  Interview talking points:
 *    • "Lifting state up" — useTasks hook owns all task data
 *    • Component composition over inheritance
 *    • Conditional rendering (loading / error / empty states)
 *    • Responsive layout with CSS Grid + Flexbox
 * ============================================================
 */

import React, { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import TaskComponent from "./components/TaskComponent";
import AddTaskForm from "./components/AddTaskForm";
import StatsPanel from "./components/StatsPanel";
import { FilterTab, SortOption } from "./types/task";

// ─── Filter Tab Config ────────────────────────────────────────
const FILTER_TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: "all", label: "All Tasks", icon: "📋" },
  { key: "active", label: "Active", icon: "⚡" },
  { key: "completed", label: "Completed", icon: "✅" },
];

// ─── Sort Options ─────────────────────────────────────────────
const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest First" },
  { key: "oldest", label: "Oldest First" },
  { key: "priority", label: "By Priority" },
  { key: "dueDate", label: "By Due Date" },
];

// ─── Category Filter Options ──────────────────────────────────
const CATEGORIES = [
  { key: "all", label: "All", icon: "🌐" },
  { key: "work", label: "Work", icon: "💼" },
  { key: "personal", label: "Personal", icon: "👤" },
  { key: "health", label: "Health", icon: "🏃" },
  { key: "learning", label: "Learning", icon: "📚" },
  { key: "finance", label: "Finance", icon: "💰" },
  { key: "other", label: "Other", icon: "📌" },
];

// ──────────────────────────────────────────────────────────────
//  App Component
// ──────────────────────────────────────────────────────────────
const App: React.FC = () => {
  // ── All task state comes from the custom hook ──────────────
  const {
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
  } = useTasks();

  // ── UI-only state (lives in App, not the hook) ─────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ── Empty State Message ───────────────────────────────────
  const getEmptyMessage = () => {
    if (searchQuery)
      return {
        icon: "🔍",
        title: "No tasks match your search",
        sub: `Try a different keyword for "${searchQuery}"`,
      };
    if (activeFilter === "completed")
      return {
        icon: "🏆",
        title: "No completed tasks yet",
        sub: "Mark some tasks as done to see them here",
      };
    if (activeFilter === "active")
      return {
        icon: "🎉",
        title: "All tasks completed!",
        sub: "Great job! Add new tasks to keep going.",
      };
    return {
      icon: "✨",
      title: "No tasks yet",
      sub: "Click \"Add Task\" to create your first task",
    };
  };

  const emptyMsg = getEmptyMessage();

  return (
    <div className="min-h-screen animated-bg relative overflow-x-hidden">
      {/* ── Floating Orbs (background decoration) ─────────── */}
      <div
        className="orb w-96 h-96 opacity-20"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          top: "-10%",
          left: "-5%",
        }}
      />
      <div
        className="orb w-80 h-80 opacity-15"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          top: "50%",
          right: "-8%",
          animationDelay: "4s",
        }}
      />
      <div
        className="orb w-64 h-64 opacity-10"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          bottom: "10%",
          left: "30%",
          animationDelay: "8s",
        }}
      />

      {/* ── Top Navigation Bar ────────────────────────────── */}
      <header
        className="glass sticky top-0 z-40 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-lg pulse-glow"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                ⚡
              </div>
              <div>
                <h1 className="text-base font-black text-white leading-none">
                  TaskFlow
                </h1>
                <p className="text-[9px] text-indigo-400 font-mono leading-none mt-0.5">
                  MERN Stack App
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks…"
                className="input-field w-full rounded-xl pl-10 pr-4 py-2.5 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            {/* Stats chips */}
            <div className="hidden md:flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(99,102,241,0.15)" }}
              >
                <span className="text-xs font-bold text-indigo-400">
                  {stats.total}
                </span>
                <span className="text-xs text-slate-500">tasks</span>
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <span className="text-xs font-bold text-emerald-400">
                  {stats.completionRate}%
                </span>
                <span className="text-xs text-slate-500">done</span>
              </div>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white relative z-10"
            >
              <span className="text-base leading-none">＋</span>
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 relative z-10">
        {/* ══════════════════════════════════════════════════
             LEFT COLUMN — Task List
            ══════════════════════════════════════════════════ */}
        <main className="min-w-0">
          {/* ── Filter Tabs ─────────────────────────────── */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === tab.key ? "tab-active" : "tab-inactive"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.key === "all" && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}
                  >
                    {stats.total}
                  </span>
                )}
                {tab.key === "active" && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}
                  >
                    {stats.active}
                  </span>
                )}
                {tab.key === "completed" && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}
                  >
                    {stats.completed}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Category Filter Chips ────────────────────── */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                    : "border border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-700/30"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* ── Toolbar (Sort + Search mobile + Count) ────── */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-xs text-slate-500 font-mono flex-shrink-0">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-2">
              {/* Mobile Search */}
              <div className="sm:hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="input-field rounded-xl px-3 py-1.5 text-xs w-32"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="input-field rounded-xl px-3 py-1.5 text-xs"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Global Error Banner ──────────────────────── */}
          {error && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-4 slide-in"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <span className="text-red-400">⚠️</span>
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* ── Loading Skeleton ─────────────────────────── */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shimmer rounded-2xl h-24"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            /* ── Empty State ────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">{emptyMsg.icon}</div>
              <h3 className="text-lg font-bold text-slate-400 mb-2">
                {emptyMsg.title}
              </h3>
              <p className="text-sm text-slate-600 max-w-xs mb-6">
                {emptyMsg.sub}
              </p>
              {!searchQuery && activeFilter === "all" && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white relative z-10"
                >
                  ＋ Create First Task
                </button>
              )}
            </div>
          ) : (
            /* ── Task List ──────────────────────────────── */
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskComponent
                  key={task._id}
                  task={task}
                  isDeleting={deletingIds.has(task._id)}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              ))}

              {/* Bottom Actions */}
              {filteredTasks.length > 0 && stats.completed > 0 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors font-mono flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear all tasks
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ══════════════════════════════════════════════════
             RIGHT COLUMN — Stats Sidebar (desktop)
            ══════════════════════════════════════════════════ */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <StatsPanel stats={stats} />
          </div>
        </aside>
      </div>

      {/* ══════════════════════════════════════════════════════
           MOBILE SIDEBAR DRAWER
          ══════════════════════════════════════════════════════ */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 modal-backdrop"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setIsSidebarOpen(false)}
          />
          <div
            className="fixed right-0 top-0 bottom-0 z-50 w-80 glass overflow-y-auto p-5 modal-content"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Dashboard</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <StatsPanel stats={stats} />
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════
           ADD TASK MODAL
          ══════════════════════════════════════════════════════ */}
      <AddTaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAddTask={handleAddTask}
      />

      {/* ══════════════════════════════════════════════════════
           CLEAR ALL CONFIRMATION MODAL
          ══════════════════════════════════════════════════════ */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop px-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="glass rounded-3xl p-6 max-w-sm w-full modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🗑️</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Clear All Tasks?
              </h3>
              <p className="text-sm text-slate-400">
                This will permanently delete all{" "}
                <span className="text-white font-semibold">{stats.total} tasks</span>{" "}
                from the database. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                }}
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                style={{ background: "rgba(30,41,59,0.6)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Action Button (mobile) ───────────────── */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full btn-primary flex items-center justify-center text-2xl text-white relative z-30 shadow-2xl"
        style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}
        aria-label="Add new task"
      >
        <span className="relative z-10">＋</span>
      </button>
    </div>
  );
};

export default App;
