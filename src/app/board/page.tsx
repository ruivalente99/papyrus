"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import {
  ArrowLeft,
  Kanban,
  Map,
  Activity,
  Plus,
  Search,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { BoardData, BoardTask, parseBoardMarkdown } from "@/lib/boardParser";

const COLUMNS: { id: BoardTask["status"]; label: string; color: string; badgeColor: string }[] = [
  { id: "shipped", label: "Shipped (Completed)", color: "bg-emerald-500", badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "progress", label: "In Progress (v1.2)", color: "bg-amber-500", badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "backlog", label: "Priority Backlog", color: "bg-indigo-500", badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { id: "icebox", label: "Icebox / Future", color: "bg-purple-500", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
];

export default function BoardPage() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"kanban" | "roadmap" | "metrics">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<BoardTask["status"]>("backlog");
  const [newVersion, setNewVersion] = useState("v1.3.0");
  const [newTags, setNewTags] = useState("core, feature");
  const [newDesc, setNewDesc] = useState("");

  const loadBoard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/board.md", { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        const parsed = parseBoardMarkdown(text);
        setBoardData(parsed);
        setTasks(parsed.tasks);
        setIsLoading(false);
        return;
      }
    } catch {}

    try {
      const res = await fetch("/api/board", { cache: "no-store" });
      if (res.ok) {
        const parsed: BoardData = await res.json();
        setBoardData(parsed);
        setTasks(parsed.tasks);
        setIsLoading(false);
        return;
      }
    } catch {}

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const saveTasks = (newTaskList: BoardTask[]) => {
    setTasks(newTaskList);
    try {
      localStorage.setItem("papyrus_board_tasks_en", JSON.stringify(newTaskList));
    } catch {}
  };

  const handleResetToDefaults = () => {
    loadBoard();
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tasks.filter((t) => {
      const matchesTag = selectedTag === "all" || t.tags.includes(selectedTag);
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesTag && matchesSearch;
    });
  }, [tasks, searchQuery, selectedTag]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length || 1;
    const shipped = tasks.filter((t) => t.status === "shipped").length;
    const progress = tasks.filter((t) => t.status === "progress").length;
    const backlog = tasks.filter((t) => t.status === "backlog").length;
    return {
      total,
      shipped,
      progress,
      backlog,
      shippedPct: Math.round((shipped / total) * 100),
      progressPct: Math.round((progress / total) * 100),
      backlogPct: Math.round((backlog / total) * 100),
    };
  }, [tasks]);

  const moveTask = (taskId: string, direction: -1 | 1) => {
    const order: BoardTask["status"][] = ["icebox", "backlog", "progress", "shipped"];
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const currentOrderIdx = order.indexOf(task.status);
    const newIdx = currentOrderIdx + direction;
    if (newIdx >= 0 && newIdx < order.length) {
      const updated = [...tasks];
      updated[taskIndex] = { ...task, status: order[newIdx] };
      saveTasks(updated);
      if (selectedTask?.id === taskId) {
        setSelectedTask(updated[taskIndex]);
      }
    }
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const nextNum = tasks.length + 1;
    const id = `FEAT-${String(nextNum).padStart(3, "0")}`;
    const tags = newTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newTask: BoardTask = {
      id,
      title: newTitle.trim(),
      status: newStatus,
      version: newVersion.trim() || "v1.3.0",
      tags: tags.length ? tags : ["core"],
      desc: newDesc.trim() || "Feature specification and implementation.",
      files: "src/components/builder/*",
    };

    saveTasks([...tasks, newTask]);
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDesc("");
  };

  const copyMarkdown = () => {
    let md = "# PAPYRUS — Current Board State\n\n";
    md += `*Exported on ${new Date().toISOString()}*\n\n`;
    COLUMNS.forEach((col) => {
      md += `### ${col.label.toUpperCase()}\n`;
      tasks
        .filter((t) => t.status === col.id)
        .forEach((t) => {
          md += `- [${t.status === "shipped" ? "x" : " "}] **[${t.id}]** ${t.title} (\`${t.tags.join(", ")}\`)\n`;
        });
      md += "\n";
    });

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#090d13] text-stone-900 dark:text-[#f0f3f6] p-3 sm:p-6 transition-colors font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#30363d]">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              title="Return to CV Editor"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#161b22] dark:hover:bg-[#21262d] text-stone-700 dark:text-[#c9d1d9] rounded-full text-xs font-bold border border-stone-200 dark:border-[#363d47] transition-all shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>Editor</span>
            </Link>

            <div className="flex items-center gap-2">
              <NanoBananaLogo size="sm" glow />
              <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <span>PAPYRUS Board</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {boardData?.stableVersion || "v1.1.2"}
                </span>
              </h1>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* View Selector Tabs */}
            <div className="flex items-center bg-stone-200/60 dark:bg-[#161b22] border border-stone-300 dark:border-[#30363d] p-1 rounded-xl shadow-2xs">
              <button
                onClick={() => setActiveView("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeView === "kanban"
                    ? "bg-white dark:bg-[#090d13] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                }`}
              >
                <Kanban size={13} />
                <span>Kanban</span>
              </button>

              <button
                onClick={() => setActiveView("roadmap")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeView === "roadmap"
                    ? "bg-white dark:bg-[#090d13] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                }`}
              >
                <Map size={13} />
                <span>Roadmap</span>
              </button>

              <button
                onClick={() => setActiveView("metrics")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeView === "metrics"
                    ? "bg-white dark:bg-[#090d13] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                }`}
              >
                <Activity size={13} />
                <span>Metrics</span>
              </button>
            </div>

            {/* Reload from board.md */}
            <button
              onClick={handleResetToDefaults}
              title="Reload data directly from board.md"
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-[#161b22] dark:hover:bg-[#21262d] text-stone-700 dark:text-[#c9d1d9] rounded-xl text-xs font-bold border border-stone-200 dark:border-[#30363d] transition-all shadow-2xs"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Sync board.md</span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={copyMarkdown}
              title="Copy Board Summary as Markdown"
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-[#161b22] dark:hover:bg-[#21262d] text-stone-700 dark:text-[#c9d1d9] rounded-xl text-xs font-bold border border-stone-200 dark:border-[#30363d] transition-all shadow-2xs"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Export MD"}</span>
            </button>

            {/* Add Task Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-600/20"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>

            <ThemeSelector />
          </div>
        </header>

        {/* Top Summary Metrics Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#161b22] border border-stone-200/80 dark:border-[#30363d] rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs font-semibold text-stone-500 dark:text-[#8b949e]">Shipped Features</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.shipped}</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {stats.shippedPct}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-stone-200/80 dark:border-[#30363d] rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs font-semibold text-stone-500 dark:text-[#8b949e]">In Progress</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.progress}</span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Sprint v1.2
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-stone-200/80 dark:border-[#30363d] rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs font-semibold text-stone-500 dark:text-[#8b949e]">Priority Backlog</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.backlog}</span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                v1.3+
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-stone-200/80 dark:border-[#30363d] rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs font-semibold text-stone-500 dark:text-[#8b949e]">Total Tracked</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-stone-800 dark:text-stone-200">{stats.total}</span>
              <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 dark:bg-[#21262d] px-2 py-0.5 rounded-full">
                Tickets
              </span>
            </div>
          </div>
        </section>

        {/* Global Progress Bar */}
        <div className="w-full bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-full h-2.5 overflow-hidden flex shadow-inner">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${stats.shippedPct}%` }} title={`Shipped: ${stats.shippedPct}%`} />
          <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${stats.progressPct}%` }} title={`In Progress: ${stats.progressPct}%`} />
          <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${stats.backlogPct}%` }} title={`Backlog: ${stats.backlogPct}%`} />
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#161b22] border border-stone-200/80 dark:border-[#30363d] p-3 rounded-2xl shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-[#8b949e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, tags, IDs..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-[#f0f3f6]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {["all", "i18n", "ui/ux", "pdf", "ats", "ai", "core"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  selectedTag === tag
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "text-stone-500 hover:text-stone-900 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                }`}
              >
                {tag === "all" ? "All" : tag.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW 1: KANBAN BOARD */}
        {activeView === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-white dark:bg-[#161b22] border border-stone-200/80 dark:border-[#30363d] rounded-2xl p-3.5 flex flex-col gap-3 min-h-[450px] shadow-2xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-[#30363d]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <h2 className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-[#f0f3f6]">
                        {col.label}
                      </h2>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.length === 0 ? (
                      <p className="text-[11px] text-stone-400 dark:text-[#8b949e] italic py-4 text-center">
                        No tasks match filter
                      </p>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="bg-stone-50 dark:bg-[#0d1117] hover:bg-stone-100 dark:hover:bg-[#1f242c] border border-stone-200/70 dark:border-[#30363d] hover:border-amber-500/50 p-3 rounded-xl transition-all shadow-xs cursor-pointer group space-y-2"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                              {task.id}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-stone-200 dark:bg-[#21262d] text-stone-700 dark:text-[#c9d1d9]">
                              {task.version}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-stone-900 dark:text-[#f0f3f6] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                            {task.title}
                          </h4>

                          <p className="text-[11px] text-stone-500 dark:text-[#8b949e] line-clamp-2 leading-relaxed">
                            {task.desc}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-[#30363d]/60">
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-stone-200 dark:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => moveTask(task.id, -1)}
                                title="Move Left"
                                className="p-1 hover:bg-stone-200 dark:hover:bg-[#30363d] rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-[#f0f3f6] transition-colors"
                              >
                                <ChevronLeft size={12} />
                              </button>
                              <button
                                onClick={() => moveTask(task.id, 1)}
                                title="Move Right"
                                className="p-1 hover:bg-stone-200 dark:hover:bg-[#30363d] rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-[#f0f3f6] transition-colors"
                              >
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: ROADMAP VIEW */}
        {activeView === "roadmap" && (
          <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl p-6 shadow-2xs space-y-6">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Map className="w-5 h-5 text-amber-500" />
              Strategic Release Roadmap (from board.md)
            </h2>

            <div className="relative border-l-2 border-stone-200 dark:border-[#363d47] ml-4 space-y-8 py-2">
              {boardData?.timeline && boardData.timeline.length > 0 ? (
                boardData.timeline.map((group, idx) => (
                  <div key={group.version} className="relative pl-6">
                    <span
                      className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ring-4 ring-white dark:ring-[#161b22] ${
                        idx === 0 || idx === 1
                          ? "bg-emerald-500"
                          : idx === 2
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                      }`}
                    />
                    <div className="bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          {group.version}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">Milestone</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="px-2.5 py-1 bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-medium text-stone-700 dark:text-[#c9d1d9]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic">No roadmap items parsed from board.md.</p>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: METRICS VIEW */}
        {activeView === "metrics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8b949e] flex items-center justify-between">
                <span>Project Health & Metrics (from board.md)</span>
                <span className="text-[10px] font-mono lowercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                  {boardData?.systemStatus || "Active"}
                </span>
              </h3>
              <div className="space-y-3 text-xs">
                {boardData?.metrics && boardData.metrics.length > 0 ? (
                  boardData.metrics.map((m) => (
                    <div
                      key={m.metric}
                      className="flex justify-between items-center py-1.5 border-b border-stone-100 dark:border-[#30363d]"
                    >
                      <div>
                        <div className="font-semibold text-stone-800 dark:text-[#f0f3f6]">{m.metric}</div>
                        <div className="text-[10px] text-stone-400 font-mono">Target: {m.target}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono text-stone-900 dark:text-[#f0f3f6]">{m.value}</div>
                        <div className="text-[10px]">{m.status}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 italic">No metrics parsed from board.md.</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8b949e]">
                Core Architecture & Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">Next.js 15 (App Router)</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">React 19</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">TypeScript 5</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">Tailwind CSS 4</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">jsPDF Links & Smart Breaks</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">Radix UI Primitives</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">Lucide Icons</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#0d1117] rounded-xl border border-stone-200 dark:border-[#30363d] text-xs text-stone-600 dark:text-[#8b949e] leading-relaxed">
                PAPYRUS parses <code className="text-amber-500 font-mono">board.md</code> as the project&apos;s single source of truth. Any commit to the markdown specification automatically synchronizes the visual board, live API routes, and release roadmap.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-stone-200 dark:border-[#30363d] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {selectedTask.id}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#21262d] text-stone-700 dark:text-[#c9d1d9]">
                    {selectedTask.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-[#f0f3f6] mt-1">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-[#f0f3f6] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-stone-500 dark:text-[#8b949e]">Milestone / Version</span>
                <p className="font-mono text-stone-800 dark:text-[#f0f3f6] mt-0.5">{selectedTask.version}</p>
              </div>

              {selectedTask.files && (
                <div>
                  <span className="font-semibold text-stone-500 dark:text-[#8b949e]">Key Files & References</span>
                  <p className="font-mono text-stone-800 dark:text-[#f0f3f6] mt-0.5">{selectedTask.files}</p>
                </div>
              )}

              <div>
                <span className="font-semibold text-stone-500 dark:text-[#8b949e]">Description</span>
                <p className="text-stone-700 dark:text-[#c9d1d9] mt-0.5 leading-relaxed">{selectedTask.desc}</p>
              </div>

              <div>
                <span className="font-semibold text-stone-500 dark:text-[#8b949e]">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTask.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-100 dark:bg-[#21262d] text-stone-600 dark:text-[#8b949e] border border-stone-200 dark:border-[#30363d]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-[#30363d]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveTask(selectedTask.id, -1)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  <ChevronLeft size={13} />
                  <span>Demote</span>
                </button>
                <button
                  onClick={() => moveTask(selectedTask.id, 1)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  <span>Advance</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-[#30363d] dark:hover:bg-[#363d47] text-stone-800 dark:text-[#f0f3f6] rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#30363d] pb-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-[#f0f3f6]">Create New Board Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-[#f0f3f6] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 dark:text-[#c9d1d9] block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Export to Docx format"
                  className="w-full px-3 py-1.5 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-[#c9d1d9] block mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as BoardTask["status"])}
                    className="w-full px-3 py-1.5 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="progress">In Progress</option>
                    <option value="backlog">Backlog</option>
                    <option value="icebox">Icebox</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 dark:text-[#c9d1d9] block mb-1">Version</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="v1.3.0"
                    className="w-full px-3 py-1.5 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-[#c9d1d9] block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="export, word, core"
                  className="w-full px-3 py-1.5 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-[#c9d1d9] block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Technical details and requirements..."
                  className="w-full px-3 py-1.5 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
