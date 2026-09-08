"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface BoardTask {
  id: string;
  title: string;
  status: "shipped" | "progress" | "backlog" | "icebox";
  tags: string[];
  version: string;
  files: string;
  desc: string;
}

const INITIAL_TASKS: BoardTask[] = [
  {
    id: "FEAT-001",
    title: "Full Multilingual Decoupling (i18n)",
    status: "shipped",
    tags: ["i18n", "core"],
    version: "v1.1",
    files: "src/lib/i18n.ts, src/locales/*",
    desc: "Strict separation between UI/nationality language (uiLang) and CV document content language (cvLang). Real-time search and 0 missing keys.",
  },
  {
    id: "FEAT-002",
    title: "Floating Action Bar with 4-Edge Snapping",
    status: "shipped",
    tags: ["ui/ux", "mobile"],
    version: "v1.1",
    files: "src/components/preview/CVPreviewContainer.tsx",
    desc: "Floating action toolbar with magnetic docking to top, bottom, left, and right edges with mobile responsive layout.",
  },
  {
    id: "FEAT-003",
    title: "Avatar Modal with Crop, 90° Rotation & Drag-and-Drop",
    status: "shipped",
    tags: ["ui/ux", "media"],
    version: "v1.1",
    files: "src/components/builder/AvatarCropModal.tsx",
    desc: "Direct hover upload on avatar, full drag-and-drop support, 90° step rotation, and digital zoom canvas.",
  },
  {
    id: "FEAT-004",
    title: "Smart Command Palette (Cmd/Ctrl + K)",
    status: "shipped",
    tags: ["ui/ux", "accessibility"],
    version: "v1.1",
    files: "src/components/builder/CommandPalette.tsx",
    desc: "Categorized command search across templates, sections, actions, and user preferences with keyboard navigation.",
  },
  {
    id: "FEAT-005",
    title: "Mobile Top Bar Extreme Optimization",
    status: "shipped",
    tags: ["mobile", "responsive"],
    version: "v1.1.2",
    files: "src/components/builder/BuilderHeader.tsx",
    desc: "Total elimination of horizontal overflow on small devices (320px-390px), footprint reduced from 435px to 272px.",
  },
  {
    id: "FEAT-006",
    title: "Interactive Preview Targeting & Smooth Focus",
    status: "shipped",
    tags: ["preview", "editor"],
    version: "v1.1",
    files: "src/components/preview/CVPreviewContainer.tsx, src/app/page.tsx",
    desc: "Directly click any block on the live A4 preview to automatically open and scroll to the form field in the left editor.",
  },
  {
    id: "FEAT-007",
    title: "Bi-directional TeX (.tex) Export & Import Engine",
    status: "shipped",
    tags: ["latex", "export"],
    version: "v1.0",
    files: "src/lib/latexEngine.ts",
    desc: "Export and import compilable TeX files compatible with TeX Live and Overleaf with automated character escaping.",
  },
  {
    id: "FEAT-008",
    title: "Precision A4 PDF Engine with Clickable Hyperlinks",
    status: "shipped",
    tags: ["pdf", "export"],
    version: "v1.0",
    files: "src/lib/pdfExport.ts",
    desc: "Locked standard A4 dimensions (794x1123px at 96 DPI), smart page break boundary detection, and clickable links.",
  },
  {
    id: "FEAT-009",
    title: "Real-Time ATS Quality Audit & Linter (0–100%)",
    status: "shipped",
    tags: ["ats", "quality"],
    version: "v1.0",
    files: "src/lib/linter.ts, src/components/builder/linter/*",
    desc: "Real-time evaluation of action verbs, contact completeness, date ranges, and multilingual section parity.",
  },
  {
    id: "FEAT-010",
    title: "AI Agent Automation Skill (cv-agent) & CLI Suite",
    status: "shipped",
    tags: ["ai", "cli"],
    version: "v1.0",
    files: "scripts/cv-cli.ts, src/lib/cv-helper.ts",
    desc: "CLI scripts and programmatic TypeScript API for auditing, translating, mutating, and exporting resumes without a browser.",
  },
  {
    id: "FEAT-011",
    title: "Automated CI/CD Quality Gates & Semantic PR Flow",
    status: "shipped",
    tags: ["devops", "qa"],
    version: "v1.1",
    files: ".github/workflows/ci.yml",
    desc: "Enforced quality gates in GitHub Actions with E2E verification, strict type checks, and preview deployments on Vercel.",
  },
  {
    id: "FEAT-012",
    title: "Visual CV Comparator & Semantic Diff Engine",
    status: "progress",
    tags: ["diff", "ats"],
    version: "v1.2",
    files: "docs/CV_COMPARATOR_SPEC.md",
    desc: "Side-by-side synchronized scrolling between 2 CV versions, word-level inline diffs, and ATS keyword differentials.",
  },
  {
    id: "FEAT-013",
    title: "Visual Page Break Guide & Manual Page Split",
    status: "progress",
    tags: ["pdf", "editor"],
    version: "v1.2",
    files: "src/components/preview/CVPreviewContainer.tsx",
    desc: "Interactive ruler allowing users to manually drag or trigger page splits where preferred.",
  },
  {
    id: "FEAT-014",
    title: "High-Fidelity Print Mode Preview (CSS Print)",
    status: "progress",
    tags: ["preview", "styles"],
    version: "v1.2",
    files: "src/app/globals.css",
    desc: "Precise emulation of native browser print mode (Ctrl+P) automatically suppressing chrome and UI controls.",
  },
  {
    id: "FEAT-022",
    title: "Command Palette Full i18n Localization",
    status: "shipped",
    tags: ["i18n", "ui/ux", "accessibility"],
    version: "v1.2",
    files: "src/components/builder/CommandPalette.tsx, src/locales/*/builder.json",
    desc: "100% dictionary-backed localization of command items, categories, shortcuts, and multilingual search querying.",
  },
  {
    id: "FEAT-023",
    title: "Comprehensive UI/UX Audit: A11y Form Labels & Spacing Tokens",
    status: "shipped",
    tags: ["ui/ux", "a11y", "styling"],
    version: "v1.2",
    files: "src/components/builder/forms/*, src/components/builder/*",
    desc: "Explicit id and htmlFor on all CV form fields, aria-labels on icon buttons, top bar vs action bar deduplication, and standard spacing scale tokens.",
  },
  {
    id: "FEAT-024",
    title: "Design Tokens & i18n Hardcoded Strings Consolidation",
    status: "shipped",
    tags: ["refactor", "tokens", "i18n"],
    version: "v1.2",
    files: "src/components/builder/*, src/components/preview/*, src/app/globals.css",
    desc: "Eliminate raw inline isPt ? ... : ... ternaries and legacy tUI in favor of useTranslation, replacing arbitrary dark-mode hexes with CSS variables.",
  },
  {
    id: "FEAT-015",
    title: "Cover Letter Generator Engine",
    status: "backlog",
    tags: ["feature", "new-doc"],
    version: "v2.0",
    files: "src/components/cover-letter/*",
    desc: "Coordinated cover letter generation matching the color accents, header geometry, and typography of the active CV.",
  },
  {
    id: "FEAT-016",
    title: "AI-Assisted Bullet Point Polisher (Google XYZ)",
    status: "backlog",
    tags: ["ai", "ats"],
    version: "v2.0",
    files: "src/lib/aiWritingAssistant.ts",
    desc: "Actionable suggestions converting passive bullet points: 'Accomplished [X], measured by [Y], by doing [Z]'.",
  },
  {
    id: "FEAT-017",
    title: "ATS Job Vacancy Keyword Matcher",
    status: "backlog",
    tags: ["ats", "recruiter"],
    version: "v2.0",
    files: "src/lib/atsScanner.ts",
    desc: "Paste any job posting text and calculate instant ATS match rate and identify missing high-value technical keywords.",
  },
  {
    id: "FEAT-018",
    title: "Editorial Typography Selector",
    status: "backlog",
    tags: ["styling", "typography"],
    version: "v2.0",
    files: "src/types/cv.ts, src/components/preview/*",
    desc: "Curated typography pairings across Serif (Merriweather, Garamond) and Sans-Serif (Inter, Plus Jakarta Sans, JetBrains Mono).",
  },
  {
    id: "FEAT-019",
    title: "JSON Resume & Europass XML Schema Interoperability",
    status: "backlog",
    tags: ["standards"],
    version: "v2.0",
    files: "src/lib/schemaConverter.ts",
    desc: "Import and export interoperability with standard jsonresume.org schemas and Europass XML format.",
  },
  {
    id: "FEAT-020",
    title: "Header Vector QR Code Generator",
    status: "backlog",
    tags: ["contact", "modern"],
    version: "v2.0",
    files: "src/components/preview/templates/*",
    desc: "Embedded vector QR code in the resume header linking to personal portfolio, LinkedIn, or GitHub repository.",
  },
  {
    id: "FEAT-021",
    title: "PDF Encryption & PDF/UA Accessibility",
    status: "backlog",
    tags: ["pdf", "security"],
    version: "v2.0",
    files: "src/lib/pdfExport.ts",
    desc: "Password protection encryption and semantic tagging for screen reader compliance under PDF/UA standards.",
  },
  {
    id: "IDEA-001",
    title: "Private Cloud Sync (WebDAV / Nextcloud / Drive)",
    status: "icebox",
    tags: ["cloud", "privacy"],
    version: "v3.0",
    files: "src/lib/storageSync.ts",
    desc: "Optional end-to-end encrypted backup to private user cloud infrastructure while maintaining offline-first guarantees.",
  },
  {
    id: "IDEA-002",
    title: "Vector SVG Export Engine",
    status: "icebox",
    tags: ["design", "export"],
    version: "v3.0",
    files: "src/lib/svgExport.ts",
    desc: "Direct vector export allowing visual design teams to refine resumes inside Figma or Illustrator.",
  },
  {
    id: "IDEA-003",
    title: "Dark Mode PDF Export for Creative Portfolios",
    status: "icebox",
    tags: ["design", "creative"],
    version: "v3.0",
    files: "src/lib/pdfExport.ts",
    desc: "Dark background PDF export option tailored for multimedia designers and game developers.",
  },
  {
    id: "IDEA-004",
    title: "Multi-Profile Resume Management",
    status: "icebox",
    tags: ["profile", "ux"],
    version: "v3.0",
    files: "src/context/CVContext.tsx",
    desc: "Manage and switch instantly between multiple full profiles (e.g. Senior Frontend profile vs Tech Lead profile).",
  },
];

const COLUMNS: { id: BoardTask["status"]; label: string; color: string; badgeColor: string }[] = [
  { id: "shipped", label: "Shipped (Completed)", color: "bg-emerald-500", badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "progress", label: "In Progress (v1.2)", color: "bg-amber-500", badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "backlog", label: "Priority Backlog", color: "bg-indigo-500", badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { id: "icebox", label: "Icebox / Future", color: "bg-purple-500", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
];

export default function BoardPage() {
  const [tasks, setTasks] = useState<BoardTask[]>(INITIAL_TASKS);
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

  // Load from localStorage if present and valid
  useEffect(() => {
    try {
      const stored = localStorage.getItem("papyrus_board_tasks_en");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      }
    } catch {}
  }, []);

  const saveTasks = (newTaskList: BoardTask[]) => {
    setTasks(newTaskList);
    try {
      localStorage.setItem("papyrus_board_tasks_en", JSON.stringify(newTaskList));
    } catch {}
  };

  const handleResetToDefaults = () => {
    saveTasks(INITIAL_TASKS);
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
                  v1.1.2
                </span>
              </h1>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] p-1 rounded-xl shadow-2xs">
              <button
                onClick={() => setActiveView("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === "kanban"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                }`}
              >
                <Kanban size={13} />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setActiveView("roadmap")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === "roadmap"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                }`}
              >
                <Map size={13} />
                <span>Roadmap</span>
              </button>
              <button
                onClick={() => setActiveView("metrics")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === "metrics"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                }`}
              >
                <Activity size={13} />
                <span>Metrics</span>
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>

            <button
              onClick={copyMarkdown}
              title="Copy Board state as Markdown"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#161b22] hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-700 dark:text-[#f0f3f6] border border-stone-200 dark:border-[#30363d] rounded-xl text-xs font-semibold transition-all shadow-2xs"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy MD"}</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              title="Reset tasks to initial state"
              className="p-2 bg-white dark:bg-[#161b22] hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e] border border-stone-200 dark:border-[#30363d] rounded-xl text-xs transition-all shadow-2xs"
            >
              <RotateCcw size={13} />
            </button>

            <ThemeSelector />
          </div>
        </header>

        {/* KPI Metrics Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#161b22] border border-stone-200/80 dark:border-[#30363d] rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs font-semibold text-stone-500 dark:text-[#8b949e]">Shipped (Completed)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.shipped}</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {stats.shippedPct}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-stone-200/80 dark:border-[#30363d] rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-xs font-semibold text-stone-500 dark:text-[#8b949e]">Current Sprint</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.progress}</span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                v1.2
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
            <span className="text-xs font-semibold text-stone-500 dark:text-[#8b949e]">Code Health & CI</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-emerald-500">100%</span>
              <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                0 Bugs
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
            {["all", "i18n", "ui/ux", "pdf", "ats", "ai"].map((tag) => (
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
              Strategic Release Roadmap
            </h2>

            <div className="relative border-l-2 border-stone-200 dark:border-[#363d47] ml-4 space-y-8 py-2">
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#161b22]" />
                <div className="bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-500">v1.0.0 • Initial Release (Completed)</span>
                    <span className="text-[11px] text-stone-400">August 2026</span>
                  </div>
                  <h3 className="font-bold text-sm">Split-Pane Interactive Builder & TeX/PDF Engine</h3>
                  <p className="text-xs text-stone-500 dark:text-[#8b949e]">
                    MVP launch with 3 core resume templates (Lateralis, Classic, Matrix), live synchronized A4 preview, compilable TeX export/import, and dynamic 0–100% linter.
                  </p>
                </div>
              </div>

              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#161b22]" />
                <div className="bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-500">v1.1.2 • Mobile UX & Stability (Completed)</span>
                    <span className="text-[11px] text-stone-400">September 2026</span>
                  </div>
                  <h3 className="font-bold text-sm">Full i18n Decoupling, 4-Edge Action Bar & Avatar Crop</h3>
                  <p className="text-xs text-stone-500 dark:text-[#8b949e]">
                    Clean separation of UI/nationality language from CV document language, mobile top bar overflow fix, circular avatar crop & rotation, exhaustive 40 missing translation keys fix, and preview click-to-focus.
                  </p>
                </div>
              </div>

              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white dark:ring-[#161b22]" />
                <div className="bg-stone-50 dark:bg-[#0d1117] border border-amber-500/40 p-4 rounded-xl space-y-1 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-500">v1.2.0 • Current Sprint (In Progress)</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Active</span>
                  </div>
                  <h3 className="font-bold text-sm">Visual CV Comparator & Manual Page Breaks</h3>
                  <p className="text-xs text-stone-500 dark:text-[#8b949e]">
                    Side-by-side synchronized comparison with word-level semantic diff and ATS score matrix. Manual page break insertions (\pagebreak) and native print mode fidelity.
                  </p>
                </div>
              </div>

              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#161b22]" />
                <div className="bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">v2.0.0 • Unified Application Suite</span>
                    <span className="text-[11px] text-stone-400">Planned Q4 2026</span>
                  </div>
                  <h3 className="font-bold text-sm">Cover Letters, ATS Vacancy Scanner & Typography Selector</h3>
                  <p className="text-xs text-stone-500 dark:text-[#8b949e]">
                    Thematically coordinated cover letter engine, ATS job description keyword matcher, open standard JSON Resume format compatibility, and curated font families.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: METRICS VIEW */}
        {activeView === "metrics" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8b949e]">Automated Verification</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-100 dark:border-[#30363d]">
                  <span>E2E Verification (5 Presets)</span>
                  <span className="font-bold font-mono text-emerald-500">100% Pass</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100 dark:border-[#30363d]">
                  <span>Field Editing Stress Test</span>
                  <span className="font-bold font-mono text-emerald-500">100% Pass</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100 dark:border-[#30363d]">
                  <span>TypeScript Strict Check</span>
                  <span className="font-bold font-mono text-emerald-500">0 Errors</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>ESLint Code Quality</span>
                  <span className="font-bold font-mono text-emerald-500">0 Errors</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8b949e]">Performance & Dimensions</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-100 dark:border-[#30363d]">
                  <span>Next.js Build Time</span>
                  <span className="font-bold font-mono text-amber-500">~2.8s</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100 dark:border-[#30363d]">
                  <span>First Load JS Bundle</span>
                  <span className="font-bold font-mono text-emerald-500">336 kB</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100 dark:border-[#30363d]">
                  <span>A4 Dimension Accuracy</span>
                  <span className="font-bold font-mono text-emerald-500">794 × 1123 px</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>PDF Export Resolution</span>
                  <span className="font-bold font-mono text-stone-400">96 DPI / 210x297mm</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8b949e]">Technology Stack</h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">Next.js 15</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">React 19</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">TypeScript 5</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">Tailwind CSS 4</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">jsPDF Links</span>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] rounded-lg text-xs font-semibold">Radix UI</span>
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
                <span className="font-bold text-stone-400 dark:text-[#8b949e] uppercase tracking-wider text-[10px]">
                  Description & Scope:
                </span>
                <p className="mt-1 text-stone-700 dark:text-[#c9d1d9] leading-relaxed">
                  {selectedTask.desc}
                </p>
              </div>

              <div>
                <span className="font-bold text-stone-400 dark:text-[#8b949e] uppercase tracking-wider text-[10px]">
                  Tags:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTask.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-stone-100 dark:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-stone-400 dark:text-[#8b949e] uppercase tracking-wider text-[10px]">
                  Target Files & Modules:
                </span>
                <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400 bg-stone-100 dark:bg-[#0d1117] p-2 rounded-xl border border-stone-200 dark:border-[#30363d] mt-1">
                  {selectedTask.files}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-[#30363d]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => moveTask(selectedTask.id, -1)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] rounded-lg text-xs font-bold transition-all"
                >
                  ← Move Left
                </button>
                <button
                  onClick={() => moveTask(selectedTask.id, 1)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] rounded-lg text-xs font-bold transition-all"
                >
                  Move Right →
                </button>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all"
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
              <h3 className="text-sm font-bold">Create New Task</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-[#f0f3f6]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Feature Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Export resume as DOCX format"
                  className="w-full px-3 py-2 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-[#f0f3f6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Column / Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-[#f0f3f6]"
                  >
                    <option value="backlog">Priority Backlog</option>
                    <option value="progress">In Progress (v1.2)</option>
                    <option value="shipped">Shipped (Completed)</option>
                    <option value="icebox">Icebox / Future</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Target Version</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="v1.3.0"
                    className="w-full px-3 py-2 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-[#f0f3f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="core, export, ui/ux"
                  className="w-full px-3 py-2 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-[#f0f3f6]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description / Acceptance Criteria</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Specification details and expected outcomes..."
                  className="w-full px-3 py-2 bg-stone-100 dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] rounded-xl text-xs focus:outline-hidden focus:border-amber-500 text-stone-900 dark:text-[#f0f3f6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-[#363d47] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Add to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
