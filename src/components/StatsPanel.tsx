/**
 * ============================================================
 *  StatsPanel.tsx  ·  Achievement & Statistics Dashboard
 * ============================================================
 *
 *  Displays computed aggregate statistics derived from the
 *  task list — similar to what a MongoDB aggregation pipeline
 *  ($group, $sum, $count) would return from the backend.
 *
 *  In a real MERN app this data would come from:
 *    GET /api/tasks/stats  →  Task.aggregate([...])
 *
 *  Interview talking points:
 *    • useMemo prevents re-computing stats on every render
 *    • Aggregation pipelines vs. computing in JS
 *    • Progress bar uses CSS custom property + animation
 * ============================================================
 */

import React from "react";
import { TaskStats } from "../types/task";

// ─── Props ────────────────────────────────────────────────────
interface StatsPanelProps {
  stats: TaskStats;
}

// ─── Individual Stat Card ─────────────────────────────────────
interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  subLabel?: string;
  accentColor: string;
  glowClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subLabel,
  accentColor,
  glowClass,
}) => (
  <div
    className={`glass-light rounded-2xl p-4 flex items-center gap-4 task-card ${glowClass ?? ""}`}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: accentColor }}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
      {subLabel && (
        <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{subLabel}</p>
      )}
    </div>
  </div>
);

// ─── Achievement Badge ────────────────────────────────────────
interface BadgeProps {
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

const AchievementBadge: React.FC<BadgeProps> = ({
  icon,
  title,
  desc,
  unlocked,
}) => (
  <div
    className={`rounded-2xl p-3 text-center transition-all task-card ${
      unlocked
        ? "glass-light border border-indigo-500/30"
        : "opacity-30"
    }`}
    style={
      unlocked
        ? { boxShadow: "0 0 15px rgba(99,102,241,0.15)" }
        : {}
    }
  >
    <div className={`text-2xl mb-1 ${!unlocked ? "grayscale" : ""}`}>
      {icon}
    </div>
    <p className="text-[10px] font-bold text-slate-300 leading-tight">{title}</p>
    <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{desc}</p>
  </div>
);

// ──────────────────────────────────────────────────────────────
const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const { total, completed, active, completionRate, highPriority, dueSoon, overdue } = stats;

  // ── Achievement Badges ─────────────────────────────────────
  const achievements = [
    {
      icon: "🚀",
      title: "First Task",
      desc: "Add your first task",
      unlocked: total >= 1,
    },
    {
      icon: "⚡",
      title: "Task Master",
      desc: "Add 5+ tasks",
      unlocked: total >= 5,
    },
    {
      icon: "🏆",
      title: "Achiever",
      desc: "Complete 3+ tasks",
      unlocked: completed >= 3,
    },
    {
      icon: "🔥",
      title: "On Fire",
      desc: "50%+ completion rate",
      unlocked: completionRate >= 50,
    },
    {
      icon: "💯",
      title: "Perfectionist",
      desc: "100% completion rate",
      unlocked: total > 0 && completionRate === 100,
    },
    {
      icon: "🌟",
      title: "Overachiever",
      desc: "Complete 10+ tasks",
      unlocked: completed >= 10,
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Section Header ────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Dashboard
        </h2>
      </div>

      {/* ── Completion Progress ────────────────────────── */}
      <div className="glass-light rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Overall Progress
            </p>
            <p className="text-3xl font-black text-white mt-0.5">
              {completionRate}
              <span className="text-lg text-slate-400">%</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-mono">
              {completed}/{total} tasks
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {active} remaining
            </p>
          </div>
        </div>

        {/* Animated progress bar */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: "8px", background: "rgba(30,41,59,0.8)" }}
        >
          <div
            className="h-full rounded-full progress-bar"
            style={{
              background:
                completionRate === 100
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
              "--progress-width": `${completionRate}%`,
              width: `${completionRate}%`,
            } as React.CSSProperties}
          />
        </div>

        {/* Mini stat chips */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            { label: "Active", value: active, color: "text-indigo-400" },
            { label: "Done", value: completed, color: "text-emerald-400" },
            { label: "Total", value: total, color: "text-slate-300" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1"
              style={{ background: "rgba(15,23,42,0.6)" }}
            >
              <span className={`text-sm font-bold ${color}`}>{value}</span>
              <span className="text-[10px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards Grid ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="🎯"
          label="High Priority"
          value={highPriority}
          subLabel="needs attention"
          accentColor="rgba(239,68,68,0.15)"
          glowClass={highPriority > 0 ? "" : ""}
        />
        <StatCard
          icon="⏰"
          label="Due Soon"
          value={dueSoon}
          subLabel="within 24 hours"
          accentColor="rgba(245,158,11,0.15)"
        />
        <StatCard
          icon="⚠️"
          label="Overdue"
          value={overdue}
          subLabel="past deadline"
          accentColor="rgba(239,68,68,0.1)"
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={completed}
          subLabel="tasks done"
          accentColor="rgba(16,185,129,0.15)"
          glowClass={completed > 0 ? "glow-green" : ""}
        />
      </div>

      {/* ── Achievements ──────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-500 to-orange-500" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Achievements
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {achievements.filter((a) => a.unlocked).length}/
            {achievements.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {achievements.map((badge) => (
            <AchievementBadge key={badge.title} {...badge} />
          ))}
        </div>
      </div>

      {/* ── MERN Stack Badge ──────────────────────────── */}
      <div
        className="glass-light rounded-2xl p-4"
        style={{ borderColor: "rgba(99,102,241,0.2)" }}
      >
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Tech Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "MongoDB", color: "text-emerald-400", bg: "rgba(16,185,129,0.1)" },
            { name: "Express", color: "text-slate-300", bg: "rgba(100,116,139,0.15)" },
            { name: "React", color: "text-cyan-400", bg: "rgba(6,182,212,0.1)" },
            { name: "Node.js", color: "text-green-400", bg: "rgba(34,197,94,0.1)" },
            { name: "Mongoose", color: "text-orange-400", bg: "rgba(249,115,22,0.1)" },
            { name: "Tailwind", color: "text-sky-400", bg: "rgba(14,165,233,0.1)" },
          ].map(({ name, color, bg }) => (
            <span
              key={name}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg ${color} font-mono`}
              style={{ background: bg }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
