"use client";

import React, { useState, useRef, useEffect } from "react";
import type { CVDocument, SupportedLanguage, TemplateId } from "@/types/cv";
import { CVPage } from "./CVPage";
import { exportToPdf, exportToPng, A4_H_PX, A4_W_PX } from "@/lib/pdfExport";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Download,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  Palette,
  Hand,
  MousePointer,
  RotateCcw,
  Grid,
  Pipette,
  GripVertical,
  Move,
  Printer,
  Mail,
  HelpCircle,
  Info,
} from "lucide-react";
import { PreviewSettingsSheet, ACCENT_COLORS } from "./PreviewSettingsSheet";
import { CoverLetterPreview } from "./CoverLetterPreview";
import type { CoverLetterDocument } from "@/types/coverLetter";
import { useToast } from "@/context/ToastContext";

interface Props {
  cv: CVDocument;
  coverLetter?: CoverLetterDocument;
  activeDocTab?: "cv" | "cover-letter";
  lang: SupportedLanguage;
  uiLang?: SupportedLanguage;
  onSetTemplate: (t: TemplateId) => void;
  onUpdateTheme: (theme: Partial<CVDocument["theme"]>) => void;
  onExportJson: () => void;
  onSelectSection?: (sectionId: string) => void;
  highlightedSectionId?: string | null;
  mobileTab?: "edit" | "preview";
}

function CanvasTooltip({
  label,
  shortcut,
  children,
  side = "top",
}: {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const [show, setShow] = useState(false);

  const sideClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none px-2.5 py-1 rounded-lg bg-stone-900/95 dark:bg-[#161b22]/95 backdrop-blur-md text-white border border-stone-700/60 dark:border-[#363d47] text-[10.5px] font-semibold shadow-xl whitespace-nowrap flex items-center gap-1.5 animate-in fade-in duration-100 ${sideClasses[side]}`}
        >
          <span>{label}</span>
          {shortcut && (
            <kbd className="px-1 py-0.2 rounded text-[9px] font-mono bg-stone-800 dark:bg-[#21262d] text-amber-400 border border-stone-600">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
}

export function CVPreviewContainer({
  cv,
  coverLetter,
  activeDocTab = "cv",
  lang,
  uiLang,
  onSetTemplate,
  onUpdateTheme,
  onSelectSection,
  highlightedSectionId,
  mobileTab,
}: Props) {
  const currentUiLang = uiLang || "pt";
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [toolMode, setToolMode] = useState<"pointer" | "hand">("pointer");
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [docHeight, setDocHeight] = useState<number>(A4_H_PX);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [dockEdge, setDockEdge] = useState<"bottom" | "top" | "left" | "right">("bottom");
  const [isDraggingToolbar, setIsDraggingToolbar] = useState<boolean>(false);
  const [isPrintEmulation, setIsPrintEmulation] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { t: tr } = useTranslation(currentUiLang);
  const { showToast } = useToast();

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragMovedRef = useRef<number>(0);
  const pinchStartRef = useRef<{ distance: number; initialZoom: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const cycleDockEdge = () => {
    setDockEdge((prev) => {
      if (prev === "bottom") return "right";
      if (prev === "right") return "top";
      if (prev === "top") return "left";
      return "bottom";
    });
  };

  const handleToolbarGripPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingToolbar(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleToolbarGripPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingToolbar) return;
    e.stopPropagation();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const distLeft = x;
    const distRight = rect.width - x;
    const distTop = y;
    const distBottom = rect.height - y;

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);
    if (minDist === distLeft && dockEdge !== "left") setDockEdge("left");
    else if (minDist === distRight && dockEdge !== "right") setDockEdge("right");
    else if (minDist === distTop && dockEdge !== "top") setDockEdge("top");
    else if (minDist === distBottom && dockEdge !== "bottom") setDockEdge("bottom");
  };

  const handleToolbarGripPointerUp = (e: React.PointerEvent) => {
    if (isDraggingToolbar) {
      setIsDraggingToolbar(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  // Load alignment grid preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("papyrus_preview_grid");
      if (saved === "true") setShowGrid(true);
    } catch {}
  }, []);

  const toggleGrid = () => {
    setShowGrid((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("papyrus_preview_grid", String(next));
      } catch {}
      return next;
    });
  };

  const handleSetToolMode = (mode: "pointer" | "hand") => {
    setToolMode(mode);
    setIsPanning(false);
    dragMovedRef.current = 0;
  };

  // Calculate live page count & actual height for scaling container
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const measure = () => {
      const innerCanvas = el.querySelector("#cover-letter-canvas") as HTMLElement | null;
      const height = innerCanvas
        ? Math.max(innerCanvas.scrollHeight, innerCanvas.offsetHeight, A4_H_PX)
        : Math.max(el.scrollHeight, el.offsetHeight, A4_H_PX);

      setDocHeight(height);
      const forcedCount = activeDocTab === "cover-letter"
        ? 0
        : (cv.sections || []).filter((s) => s && s.pageBreakBefore && s.visible).length;
      const basePages = height <= A4_H_PX + 40 && forcedCount === 0 ? 1 : Math.ceil(height / A4_H_PX);
      const pages = Math.max(1 + forcedCount, basePages);
      setPageCount(pages);
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [cv, lang, coverLetter, activeDocTab]);

  const isAutoFitRef = useRef<boolean>(isAutoFit);
  useEffect(() => {
    isAutoFitRef.current = isAutoFit;
  }, [isAutoFit]);

  // Responsive Auto-Fit calculation based on screen and container size
  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    const calcAutoFit = (force = false) => {
      if (!isAutoFitRef.current && !force) return;
      const width = container.clientWidth;
      if (!width || width <= 0) return;
      // Provide comfortable breathing room: 16px on mobile, 40px on tablet/desktop
      const margin = width < 640 ? 16 : 40;
      const availableWidth = Math.max(260, width - margin);
      const calculatedScale = Math.min(1.2, Math.max(0.32, availableWidth / A4_W_PX));
      setZoom(Number(calculatedScale.toFixed(2)));
    };

    calcAutoFit();
    const rafId = requestAnimationFrame(() => calcAutoFit());
    const timeoutId = setTimeout(() => calcAutoFit(), 80);

    const ro = new ResizeObserver(() => {
      calcAutoFit();
    });
    ro.observe(container);

    // When resolution changes (window resize, screen rotate, device emulation), always auto-adjust!
    const handleResolutionChange = () => {
      isAutoFitRef.current = true;
      setIsAutoFit(true);
      setPan({ x: 0, y: 0 });
      calcAutoFit(true);
    };

    window.addEventListener("resize", handleResolutionChange);
    window.addEventListener("orientationchange", handleResolutionChange);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      ro.disconnect();
      window.removeEventListener("resize", handleResolutionChange);
      window.removeEventListener("orientationchange", handleResolutionChange);
    };
  }, [mobileTab, cv.template]);

  // Listen for Spacebar on desktop for quick pan/hand mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !isSpacePressed &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  const handleZoomChange = (delta: number) => {
    isAutoFitRef.current = false;
    setIsAutoFit(false);
    setZoom((z) => Math.max(0.25, Math.min(2.5, Number((z + delta).toFixed(2)))));
  };

  const handleToggleAutoFit = () => {
    isAutoFitRef.current = true;
    setIsAutoFit(true);
    setPan({ x: 0, y: 0 });
  };

  const handleResetCanvas = () => {
    isAutoFitRef.current = false;
    setIsAutoFit(false);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Mouse & Pointer Panning
  const handlePointerDown = (e: React.PointerEvent) => {
    const targetElement = e.target as HTMLElement;
    // Don't pan or capture pointer when interacting with floating toolbar controls
    if (targetElement.closest("[data-testid='canvas-floating-toolbar']")) {
      return;
    }

    const isInsideDoc = targetElement.closest("#cv-printable-page") !== null;

    // In pointer mode:
    // - If clicking inside the CV document, DO NOT initiate canvas pan or capture pointer!
    //   This ensures the click event cleanly reaches the section element.
    // - If clicking on the backdrop (outside the CV document), or if spacebar is held,
    //   or middle button (button === 1), then initiate pan!
    // In hand mode:
    // - Clicking anywhere (inside or outside document) initiates pan!
    const shouldPan =
      toolMode === "hand" ||
      isSpacePressed ||
      e.button === 1 ||
      (toolMode === "pointer" && !isInsideDoc);

    if (shouldPan) {
      setIsPanning(true);
      dragMovedRef.current = 0;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    } else {
      dragMovedRef.current = 0;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragMovedRef.current += Math.hypot(dx, dy);

    setIsAutoFit(false);
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsPanning(false);
    }
  };

  // Touch Multitouch (Pinch-to-zoom & Pan on Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Check for double tap to toggle zoom
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (isAutoFit) {
          setIsAutoFit(false);
          setZoom(1.1);
          setPan({ x: 0, y: 0 });
        } else {
          handleToggleAutoFit();
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      setIsPanning(true);
      dragMovedRef.current = 0;
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      pinchStartRef.current = {
        distance,
        initialZoom: zoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      dragMovedRef.current += Math.hypot(dx, dy);

      setIsAutoFit(false);
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    } else if (e.touches.length === 2 && pinchStartRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const factor = currentDist / pinchStartRef.current.distance;
      const newZoom = Math.max(0.25, Math.min(2.5, Number((pinchStartRef.current.initialZoom * factor).toFixed(2))));

      setIsAutoFit(false);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsPanning(false);
      pinchStartRef.current = null;
    } else if (e.touches.length === 1) {
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
      pinchStartRef.current = null;
    }
  };

  // Wheel zoom with Ctrl or Pan with trackpad
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setIsAutoFit(false);
      const delta = -e.deltaY * 0.01;
      setZoom((z) => Math.max(0.25, Math.min(2.5, Number((z + delta).toFixed(2)))));
    } else {
      setIsAutoFit(false);
      setPan((p) => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY,
      }));
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    // In hand mode, ignore section click because hand tool is for canvas dragging
    if (toolMode === "hand") return;
    if (dragMovedRef.current > 14) return;
    if (onSelectSection) {
      onSelectSection(sectionId);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pageRef.current || isExporting) return;
    setIsExporting("pdf");
    try {
      const baseName = (cv.personalInfo.fullName || "document").toLowerCase().replace(/\s+/g, "_");
      const filename = activeDocTab === "cover-letter" ? `${baseName}_cover_letter.pdf` : `${baseName}_cv.pdf`;
      await exportToPdf(pageRef.current, filename);
    } catch (e) {
      console.error("PDF export error:", e);
      showToast(tr("preview.toasts.pdfError"), "error");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadPng = async () => {
    if (!pageRef.current || isExporting) return;
    setIsExporting("png");
    try {
      const baseName = (cv.personalInfo.fullName || "document").toLowerCase().replace(/\s+/g, "_");
      const filename = activeDocTab === "cover-letter" ? `${baseName}_cover_letter.png` : `${baseName}_cv.png`;
      await exportToPng(pageRef.current, filename);
      showToast(tr("preview.toasts.pngSuccess"), "success");
    } catch (e) {
      console.error("PNG export error:", e);
      showToast(tr("preview.toasts.pngError"), "error");
    } finally {
      setIsExporting(null);
    }
  };

  const actualDocHeight = Math.max(pageCount * A4_H_PX, docHeight);

  return (
    <div className="flex flex-col h-full bg-stone-200/50 dark:bg-[#0d1117] text-stone-800 dark:text-[#c9d1d9] transition-colors">
      {/* Top Controls Toolbar - Charm Segmented Pill Toolbar */}
      <div className="bg-white/90 dark:bg-[#161b22]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-[#30363d] px-3 sm:px-4 py-2 shadow-2xs transition-colors shrink-0">
        {/* MOBILE TOOLBAR: Style & Template Selection Only */}
        <div className="flex sm:hidden items-center justify-between gap-1.5 w-full overflow-x-auto no-scrollbar py-0.5">
          {/* Left: Template Selector or Cover Letter Badge */}
          {activeDocTab === "cover-letter" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-900 dark:text-amber-300 rounded-full border border-amber-500/20 text-xs font-bold shadow-2xs shrink-0">
              <Mail size={12} className="text-amber-600 dark:text-amber-400" />
              <span>{tr("builder.coverLetter.tabTitle")}</span>
            </div>
          ) : (
            <div className="flex items-center bg-stone-100 dark:bg-[#0d1117] rounded-full p-0.5 border border-stone-200 dark:border-[#363d47] shadow-2xs shrink-0">
              <button
                onClick={() => onSetTemplate("lateralis")}
                className={`px-2 py-1 text-[11px] font-bold rounded-full transition-all ${
                  cv.template === "lateralis" || cv.template === "canva"
                    ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e]"
                }`}
              >
                {tr("preview.templates.lateralis")}
              </button>
              <button
                onClick={() => onSetTemplate("classic")}
                className={`px-2 py-1 text-[11px] font-bold rounded-full transition-all ${
                  cv.template === "classic" || cv.template === "latex"
                    ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e]"
                }`}
              >
                {tr("preview.templates.classic")}
              </button>
              <button
                onClick={() => onSetTemplate("matrix")}
                className={`px-2 py-1 text-[11px] font-bold rounded-full transition-all ${
                  cv.template === "matrix" || cv.template === "europass"
                    ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e]"
                }`}
              >
                {tr("preview.templates.matrix")}
              </button>
            </div>
          )}

          {/* Right: Estilo/Style Drawer Trigger */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label={tr("preview.toolbar.style")}
              className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-stone-800 dark:text-[#f0f3f6] rounded-full text-xs font-bold border border-stone-200/80 dark:border-[#363d47] shadow-2xs transition-all active:scale-95 shrink-0"
            >
              <span
                className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 shrink-0"
                style={{ backgroundColor: cv.theme.primaryColor || "#005555" }}
              />
              <Palette size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{tr("preview.toolbar.style")}</span>
            </button>
          </div>
        </div>

        {/* DESKTOP TOOLBAR: Dedicated Exclusively to Styles & Document Appearance */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          {/* Template Selector or Cover Letter Badge */}
          {activeDocTab === "cover-letter" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-900 dark:text-amber-300 rounded-full border border-amber-500/20 text-xs font-bold shadow-2xs shrink-0">
              <Mail size={13} className="text-amber-600 dark:text-amber-400" />
              <span>{tr("builder.coverLetter.tabTitle")} (A4)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-stone-100 dark:bg-[#0d1117] rounded-full p-1 border border-stone-200 dark:border-[#363d47] shadow-2xs shrink-0">
                <button
                  data-template-tab="lateralis"
                  onClick={() => onSetTemplate("lateralis")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "lateralis" || cv.template === "canva"
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tr("preview.templates.lateralis")}
                </button>
                <button
                  data-template-tab="classic"
                  onClick={() => onSetTemplate("classic")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "classic" || cv.template === "latex"
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tr("preview.templates.classic")}
                </button>
                <button
                  data-template-tab="matrix"
                  onClick={() => onSetTemplate("matrix")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "matrix" || cv.template === "europass"
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tr("preview.templates.matrix")}
                </button>
              </div>
            </div>
          )}

          {/* Right: Density, Palette Colors, Custom Picker & Full Settings Trigger */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Density Selector */}
            <div className="flex items-center bg-stone-100 dark:bg-[#0d1117] rounded-full p-1 border border-stone-200 dark:border-[#363d47] shadow-2xs shrink-0">
              <button
                onClick={() => onUpdateTheme({ fontSize: "compact" })}
                title={tr("preview.toolbar.densityCompact")}
                aria-label={tr("preview.toolbar.densityCompact")}
                className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                  cv.theme.fontSize === "compact"
                    ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] font-bold shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                }`}
              >
                {tr("preview.toolbar.densityCompact")}
              </button>
              <button
                onClick={() => onUpdateTheme({ fontSize: "normal" })}
                title={tr("preview.toolbar.densityNormal")}
                aria-label={tr("preview.toolbar.densityNormal")}
                className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                  cv.theme.fontSize === "normal" || !cv.theme.fontSize
                    ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] font-bold shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                }`}
              >
                {tr("preview.toolbar.densityNormal")}
              </button>
              <button
                onClick={() => onUpdateTheme({ fontSize: "spacious" })}
                title={tr("preview.toolbar.densitySpacious")}
                aria-label={tr("preview.toolbar.densitySpacious")}
                className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                  cv.theme.fontSize === "spacious"
                    ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] font-bold shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                }`}
              >
                {tr("preview.toolbar.densitySpacious")}
              </button>
            </div>

            {/* Accent Color Circles */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 dark:border-[#363d47] shrink-0">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => onUpdateTheme({ primaryColor: c.hex })}
                  title={c.name}
                  aria-label={tr("preview.colors.colorLabel", { name: c.name })}
                  className={`w-6 h-6 min-w-[24px] min-h-[24px] rounded-full transition-transform flex items-center justify-center ${
                    cv.theme.primaryColor?.toLowerCase() === c.hex.toLowerCase()
                      ? "scale-110 ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-[#161b22] shadow-xs"
                      : "hover:scale-105 opacity-85 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}

              {/* Custom Color Picker with accessible hidden text */}
              <label
                title={tr("preview.colors.customColor")}
                aria-label={tr("preview.colors.customColor")}
                className={`w-6 h-6 min-w-[24px] min-h-[24px] rounded-full cursor-pointer relative flex items-center justify-center transition-transform ${
                  !ACCENT_COLORS.some((c) => c.hex.toLowerCase() === cv.theme.primaryColor?.toLowerCase())
                    ? "scale-110 ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-[#161b22] shadow-xs"
                    : "hover:scale-105 opacity-75 hover:opacity-100 border border-dashed border-stone-400 dark:border-[#363d47] bg-stone-100 dark:bg-[#21262d]"
                }`}
                style={{
                  backgroundColor: !ACCENT_COLORS.some((c) => c.hex.toLowerCase() === cv.theme.primaryColor?.toLowerCase())
                    ? cv.theme.primaryColor
                    : undefined,
                }}
              >
                <span className="sr-only">{tr("preview.colors.customColor")}</span>
                <input
                  type="color"
                  aria-label={tr("preview.colors.pickCustom")}
                  value={cv.theme.primaryColor || "#005555"}
                  onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                {ACCENT_COLORS.some((c) => c.hex.toLowerCase() === cv.theme.primaryColor?.toLowerCase()) && (
                  <Pipette size={11} className="text-stone-500 dark:text-[#8b949e] pointer-events-none" />
                )}
              </label>
            </div>

            {/* Personalizar Estilo button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label={tr("preview.toolbar.style")}
              className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-stone-800 dark:text-[#f0f3f6] rounded-full text-xs font-bold border border-stone-200/80 dark:border-[#363d47] shadow-2xs transition-all active:scale-95 shrink-0"
            >
              <Palette size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{tr("preview.toolbar.style")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Page Canvas Viewport with Miro-style Pan & Gestures */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`flex-1 relative overflow-hidden flex items-start justify-center min-h-0 select-none pt-4 sm:pt-6 pb-36 sm:pb-32 ${
          isPrintEmulation ? "print-emulation" : "charm-bg-dynamic"
        } ${
          isPanning
            ? "cursor-grabbing"
            : toolMode === "hand" || isSpacePressed
            ? "cursor-grab"
            : "cursor-default"
        }`}
        style={{ touchAction: "none" }}
      >
        {/* Alignment Grid Overlay on Canvas Background */}
        {showGrid && (
          <div
            data-testid="alignment-grid-overlay"
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `
                radial-gradient(circle, currentColor 1px, transparent 1px),
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px, 100px 100px, 100px 100px",
              opacity: 0.15,
            }}
          />
        )}

        {/* Canvas World Container (Pan translation) */}
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px)`,
            transition: isPanning ? "none" : "transform 0.15s ease-out",
          }}
          className="relative shrink-0 flex items-center justify-center will-change-transform z-10 mb-20 sm:mb-16"
        >
          {/* A4 Page Container (Scale zoom from top-center) */}
          <div
            style={{
              width: `${A4_W_PX}px`,
              height: `${actualDocHeight}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "center top",
              transition: isPanning ? "none" : "transform 0.15s ease-out",
            }}
            className="relative shadow-2xl rounded-xs bg-white dark:bg-[#161b22] dark:shadow-[0_12px_44px_rgba(0,0,0,0.8)] dark:ring-1 dark:ring-white/10"
          >
            {activeDocTab === "cover-letter" && coverLetter ? (
              <div ref={pageRef} id="cover-letter-preview-wrapper" style={{ width: "794px" }}>
                <CoverLetterPreview
                  letter={coverLetter}
                  cv={cv}
                  lang={lang}
                  pageCount={pageCount}
                />
              </div>
            ) : (
              <CVPage
                ref={pageRef}
                cv={cv}
                lang={lang}
                highlightedSectionId={highlightedSectionId}
                onSelectSection={handleSectionSelect}
              />
            )}

            {/* Alignment Grid Overlay on Document itself */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none z-10 border border-amber-500/40"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(217, 119, 6, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(217, 119, 6, 0.08) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            )}

            {/* Visual Multi-Page Break Guides (FEAT-013) */}
            {pageCount > 1 &&
              Array.from({ length: pageCount - 1 }, (_, idx) => {
                const p = idx + 1;
                return (
                  <div
                    key={`page-guide-${p}`}
                    data-testid={`page-break-guide-${p}`}
                    className="absolute left-0 right-0 border-b-2 border-dashed border-amber-600 pointer-events-none flex items-center justify-between px-3 z-20 print:hidden"
                    style={{ top: `${p * A4_H_PX}px` }}
                  >
                    <span className="bg-amber-700/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full -translate-y-1/2 shadow-xs">
                      {tr("preview.toolbar.pageIndicator", { current: p, total: pageCount })}
                    </span>
                    <span className="bg-amber-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full -translate-y-1/2 shadow-xs">
                      {tr("preview.toolbar.pageCutoff", { page: p })}
                    </span>
                  </div>
                );
              })}

            {/* Page Watermark Badges */}
            {Array.from({ length: pageCount }, (_, idx) => (
              <div
                key={`page-number-${idx + 1}`}
                className={`absolute right-3 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full select-none pointer-events-none print:hidden z-10 transition-opacity ${
                  isPrintEmulation
                    ? "bg-stone-900/85 text-white border border-stone-700 shadow-xs"
                    : "bg-stone-100/90 dark:bg-[#21262d]/90 text-stone-500 dark:text-[#8b949e] border border-stone-200 dark:border-[#363d47]"
                }`}
                style={{ top: `${idx * A4_H_PX + 12}px` }}
              >
                {tr("preview.toolbar.pageIndicator", { current: idx + 1, total: pageCount })}
              </div>
            ))}

            {/* High-Fidelity Print Emulation Sheet Dividers (FEAT-014) */}
            {isPrintEmulation &&
              pageCount > 1 &&
              Array.from({ length: pageCount - 1 }, (_, idx) => {
                const p = idx + 1;
                return (
                  <div
                    key={`print-sheet-divider-${p}`}
                    className="absolute -left-6 -right-6 h-3 bg-[#2b2f36] pointer-events-none z-30 shadow-inner flex items-center justify-center border-y border-black/40"
                    style={{ top: `${p * A4_H_PX - 6}px` }}
                  >
                    <span className="text-[8.5px] font-mono text-stone-400 font-bold tracking-wider uppercase bg-[#21262d] px-2 rounded-full border border-stone-600/50">
                      {tr("preview.print.sheetDivider", { current: p, next: p + 1 })}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Floating 4-Edge Dockable & Draggable Canvas Control Bar */}
        {(() => {
          const isVertical = dockEdge === "left" || dockEdge === "right";
          const tooltipSide = isVertical
            ? (dockEdge === "left" ? "right" : "left")
            : (dockEdge === "top" ? "bottom" : "top");
          const isPt = currentUiLang === "pt";

          return (
            <>
              <div
                data-testid="canvas-floating-toolbar"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                className={`absolute z-20 flex items-center bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border border-stone-200/80 dark:border-[#363d47] shadow-lg rounded-full p-1 text-stone-700 dark:text-[#c9d1d9] transition-all duration-200 hover:shadow-xl select-none ${
                  dockEdge === "bottom"
                    ? "bottom-4 left-1/2 -translate-x-1/2 flex-row gap-1 max-w-[96vw] overflow-x-auto"
                    : dockEdge === "top"
                    ? "top-14 sm:top-16 left-1/2 -translate-x-1/2 flex-row gap-1 max-w-[96vw] overflow-x-auto"
                    : dockEdge === "left"
                    ? "left-3 top-1/2 -translate-y-1/2 flex-col gap-1 max-h-[85vh] overflow-y-auto"
                    : "right-3 top-1/2 -translate-y-1/2 flex-col gap-1 max-h-[85vh] overflow-y-auto"
                }`}
              >
                {/* Grip Handle for Dragging or Cycling Edges */}
                <CanvasTooltip label={tr("preview.canvas.dockPosition")} side={tooltipSide}>
                  <button
                    type="button"
                    onPointerDown={handleToolbarGripPointerDown}
                    onPointerMove={handleToolbarGripPointerMove}
                    onPointerUp={handleToolbarGripPointerUp}
                    onPointerCancel={handleToolbarGripPointerUp}
                    onClick={cycleDockEdge}
                    title={tr("preview.canvas.dockPosition")}
                    aria-label={tr("preview.canvas.dockPosition")}
                    className={`p-1.5 rounded-full cursor-grab active:cursor-grabbing hover:bg-stone-100 dark:hover:bg-[#21262d] transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center ${
                      isDraggingToolbar
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                        : "text-stone-400 dark:text-[#8b949e] hover:text-stone-700 dark:hover:text-[#f0f3f6]"
                    }`}
                  >
                    {isDraggingToolbar ? (
                      <Move size={13} className="animate-spin" />
                    ) : (
                      <GripVertical
                        size={13}
                        className={isVertical ? "rotate-90" : ""}
                      />
                    )}
                  </button>
                </CanvasTooltip>

                {/* Divider */}
                <div className={isVertical ? "w-4 h-px bg-stone-200 dark:bg-[#363d47] my-0.5" : "h-4 w-px bg-stone-200 dark:bg-[#363d47] mx-0.5"} />

                {/* Page Count Badge */}
                <span
                  title={`${pageCount} ${pageCount === 1 ? tr("preview.toolbar.pageCountSingle") : tr("preview.toolbar.pageCountPlural")}`}
                  className="text-[10px] font-bold bg-stone-100 dark:bg-[#21262d] text-stone-700 dark:text-[#f0f3f6] px-2 py-0.5 rounded-full font-mono border border-stone-200 dark:border-[#363d47] shrink-0 whitespace-nowrap"
                >
                  {pageCount} {isVertical ? "p" : (pageCount === 1 ? tr("preview.toolbar.pageCountSingle") : tr("preview.toolbar.pageCountPlural"))}
                </span>

                {/* Divider */}
                <div className={isVertical ? "w-4 h-px bg-stone-200 dark:bg-[#363d47] my-0.5" : "h-4 w-px bg-stone-200 dark:bg-[#363d47] mx-0.5"} />

                {/* Zoom Controls: Out, Percent, In */}
                <div className={`flex items-center ${isVertical ? "flex-col gap-0.5" : "gap-0.5"}`}>
                  <CanvasTooltip label={tr("preview.canvas.zoomOut")} shortcut="-10%" side={tooltipSide}>
                    <button
                      onClick={() => handleZoomChange(-0.1)}
                      title={tr("preview.canvas.zoomOut")}
                      aria-label={tr("preview.canvas.zoomOut")}
                      className="p-1 hover:text-stone-900 dark:hover:text-[#f0f3f6] hover:bg-stone-100 dark:hover:bg-[#21262d] rounded-full min-w-[24px] min-h-[24px] flex items-center justify-center transition-colors"
                    >
                      <ZoomOut size={12} />
                    </button>
                  </CanvasTooltip>
                  <span className="text-[10.5px] font-mono px-0.5 min-w-[28px] text-center font-bold text-stone-700 dark:text-[#c9d1d9]">
                    {Math.round(zoom * 100)}%
                  </span>
                  <CanvasTooltip label={tr("preview.canvas.zoomIn")} shortcut="+10%" side={tooltipSide}>
                    <button
                      onClick={() => handleZoomChange(0.1)}
                      title={tr("preview.canvas.zoomIn")}
                      aria-label={tr("preview.canvas.zoomIn")}
                      className="p-1 hover:text-stone-900 dark:hover:text-[#f0f3f6] hover:bg-stone-100 dark:hover:bg-[#21262d] rounded-full min-w-[24px] min-h-[24px] flex items-center justify-center transition-colors"
                    >
                      <ZoomIn size={12} />
                    </button>
                  </CanvasTooltip>
                </div>

                {/* Auto-Fit & Reset View */}
                <div className={`flex items-center ${isVertical ? "flex-col gap-0.5" : "gap-0.5"}`}>
                  <CanvasTooltip label={tr("preview.canvas.fitToScreen")} shortcut="Auto" side={tooltipSide}>
                    <button
                      onClick={handleToggleAutoFit}
                      title={tr("preview.canvas.fitToScreen")}
                      aria-label={tr("preview.canvas.fitToScreen")}
                      className={`p-1.5 rounded-full transition-colors min-w-[26px] min-h-[26px] flex items-center justify-center ${
                        isAutoFit
                          ? "bg-stone-200/80 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 font-bold"
                          : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
                      }`}
                    >
                      <Maximize2 size={12} />
                    </button>
                  </CanvasTooltip>
                  <CanvasTooltip label={tr("preview.canvas.resetView")} shortcut="100%" side={tooltipSide}>
                    <button
                      onClick={handleResetCanvas}
                      title={tr("preview.canvas.resetView")}
                      aria-label={tr("preview.canvas.resetView")}
                      className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6] transition-colors min-w-[26px] min-h-[26px] flex items-center justify-center"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </CanvasTooltip>
                </div>

                {/* Divider */}
                <div className={isVertical ? "w-4 h-px bg-stone-200 dark:bg-[#363d47] my-0.5" : "h-4 w-px bg-stone-200 dark:bg-[#363d47] mx-0.5"} />

                {/* Pointer / Hand Tool Mode */}
                <div className={`flex items-center ${isVertical ? "flex-col gap-1" : "gap-1"}`}>
                  <CanvasTooltip label={tr("preview.canvas.selectionMode")} side={tooltipSide}>
                    <button
                      data-testid="tool-mode-pointer"
                      onClick={() => handleSetToolMode("pointer")}
                      title={tr("preview.canvas.selectionMode")}
                      aria-label={tr("preview.canvas.selectionMode")}
                      className={`p-1.5 rounded-full transition-all min-w-[26px] min-h-[26px] flex items-center justify-center ${
                        toolMode === "pointer"
                          ? "bg-stone-200/80 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 font-bold shadow-2xs"
                          : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
                      }`}
                    >
                      <MousePointer size={12} />
                    </button>
                  </CanvasTooltip>
                  <CanvasTooltip label={tr("preview.canvas.panMode")} shortcut="Espaço" side={tooltipSide}>
                    <button
                      data-testid="tool-mode-hand"
                      onClick={() => handleSetToolMode("hand")}
                      title={tr("preview.canvas.panMode")}
                      aria-label={tr("preview.canvas.panMode")}
                      className={`p-1.5 rounded-full transition-all min-w-[26px] min-h-[26px] flex items-center justify-center ${
                        toolMode === "hand"
                          ? "bg-stone-200/80 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 font-bold shadow-2xs"
                          : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
                      }`}
                    >
                      <Hand size={12} />
                    </button>
                  </CanvasTooltip>
                </div>

                {/* Grid Toggle */}
                <CanvasTooltip label={showGrid ? tr("preview.canvas.hideGrid") : tr("preview.canvas.showGrid")} side={tooltipSide}>
                  <button
                    onClick={toggleGrid}
                    title={showGrid ? tr("preview.canvas.hideGrid") : tr("preview.canvas.showGrid")}
                    aria-label={showGrid ? tr("preview.canvas.hideGrid") : tr("preview.canvas.showGrid")}
                    className={`p-1.5 rounded-full transition-colors min-w-[26px] min-h-[26px] flex items-center justify-center ${
                      showGrid
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold"
                        : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
                    }`}
                  >
                    <Grid size={12} />
                  </button>
                </CanvasTooltip>

                {/* Print Emulation Toggle (FEAT-014) */}
                <CanvasTooltip
                  label={
                    isPrintEmulation
                      ? tr("preview.toolbar.printEmulationActive")
                      : tr("preview.toolbar.printEmulation")
                  }
                  side={tooltipSide}
                >
                  <button
                    onClick={() => setIsPrintEmulation((prev) => !prev)}
                    title={
                      isPrintEmulation
                        ? tr("preview.toolbar.printEmulationActive")
                        : tr("preview.toolbar.printEmulationTooltip")
                    }
                    aria-label={
                      isPrintEmulation
                        ? tr("preview.toolbar.printEmulationActive")
                        : tr("preview.toolbar.printEmulation")
                    }
                    className={`p-1.5 rounded-full transition-colors min-w-[26px] min-h-[26px] flex items-center justify-center ${
                      isPrintEmulation
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold ring-1 ring-amber-500 shadow-2xs"
                        : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
                    }`}
                  >
                    <Printer size={12} />
                  </button>
                </CanvasTooltip>

                {/* Quick Legend & Cheat-Sheet Trigger */}
                <CanvasTooltip label={isPt ? "Legenda das Ações & Atalhos" : "Actions Legend & Shortcuts"} side={tooltipSide}>
                  <button
                    type="button"
                    onClick={() => setShowLegend(!showLegend)}
                    title={isPt ? "Legenda das Ações & Atalhos" : "Actions Legend & Shortcuts"}
                    aria-label={isPt ? "Legenda das Ações & Atalhos" : "Actions Legend & Shortcuts"}
                    className={`p-1.5 rounded-full transition-colors min-w-[26px] min-h-[26px] flex items-center justify-center ${
                      showLegend
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold"
                        : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-500 dark:text-[#8b949e]"
                    }`}
                  >
                    <HelpCircle size={12} />
                  </button>
                </CanvasTooltip>

                {/* Divider */}
                <div className={isVertical ? "w-4 h-px bg-stone-200 dark:bg-[#363d47] my-0.5" : "h-4 w-px bg-stone-200 dark:bg-[#363d47] mx-0.5"} />

                {/* Page Output Actions: PDF & PNG */}
                <div className={`flex items-center ${isVertical ? "flex-col gap-1" : "gap-1.5"}`}>
                  <CanvasTooltip label={tr("preview.toolbar.exportPdf")} side={tooltipSide}>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isExporting !== null}
                      title={tr("preview.toolbar.exportPdf")}
                      aria-label={tr("preview.toolbar.exportPdf")}
                      className="flex items-center gap-1 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-2.5 sm:px-3 py-1 rounded-full shadow-xs transition-all disabled:opacity-50 shrink-0 min-h-[26px]"
                    >
                      {isExporting === "pdf" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Download size={12} />
                      )}
                      {!isVertical && <span className="text-[11px] font-bold">{tr("preview.toolbar.pdf")}</span>}
                    </button>
                  </CanvasTooltip>

                  <CanvasTooltip label={tr("preview.toolbar.png")} side={tooltipSide}>
                    <button
                      onClick={handleDownloadPng}
                      disabled={isExporting !== null}
                      title={tr("preview.toolbar.png")}
                      aria-label={tr("preview.toolbar.png")}
                      className="flex items-center gap-1 text-xs font-semibold bg-stone-100 dark:bg-[#21262d] hover:bg-stone-200 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#f0f3f6] px-2.5 sm:px-3 py-1 rounded-full border border-stone-200 dark:border-[#363d47] transition-all shadow-2xs disabled:opacity-50 shrink-0 min-h-[26px]"
                    >
                      <ImageIcon size={12} />
                      {!isVertical && <span className="text-[11px] font-medium">{tr("preview.toolbar.png")}</span>}
                    </button>
                  </CanvasTooltip>
                </div>
              </div>

              {/* Floating Action Legend Popover Card */}
              {showLegend && (
                <div
                  className={`absolute z-30 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl border border-stone-200 dark:border-[#30363d] rounded-2xl shadow-2xl p-3 w-72 max-w-[90vw] text-xs animate-in fade-in zoom-in-95 duration-100 ${
                    dockEdge === "bottom"
                      ? "bottom-16 left-1/2 -translate-x-1/2"
                      : dockEdge === "top"
                      ? "top-28 left-1/2 -translate-x-1/2"
                      : dockEdge === "left"
                      ? "left-14 top-1/2 -translate-y-1/2"
                      : "right-14 top-1/2 -translate-y-1/2"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-stone-150 dark:border-[#30363d]">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-[#f0f3f6]">
                      <Info size={13} className="text-amber-600 dark:text-amber-400" />
                      <span>{isPt ? "Legenda da Barra de Ações" : "Action Bar Legend"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLegend(false)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-white p-0.5 rounded-full"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-stone-700 dark:text-[#c9d1d9]">
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ZoomIn size={12} className="text-amber-600 shrink-0" />
                        <span>{isPt ? "Zoom (+ / -)" : "Zoom Controls"}</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">Ctrl + Scroll</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Maximize2 size={12} className="text-amber-600 shrink-0" />
                        <span>{isPt ? "Ajustar ao Ecrã" : "Auto-Fit"}</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">{isPt ? "Duplo clique / Auto" : "Auto on resize"}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <RotateCcw size={12} className="text-amber-600 shrink-0" />
                        <span>{isPt ? "Repor Vista" : "Reset View"}</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">100%</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MousePointer size={12} className="text-amber-600 shrink-0" />
                        <span>{isPt ? "Ponteiro (Selecionar)" : "Pointer (Select)"}</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">{isPt ? "Clique para editar" : "Click to edit"}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Hand size={12} className="text-amber-600 shrink-0" />
                        <span>{isPt ? "Mão (Mover)" : "Hand (Pan)"}</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">{isPt ? "Espaço + Arrastar" : "Space + Drag"}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Grid size={12} className="text-amber-600 shrink-0" />
                        <span>{isPt ? "Grelha Alinhamento" : "Alignment Grid"}</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">{isPt ? "Milimétrica" : "Metric"}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Printer size={12} className="text-amber-600 shrink-0" />
                        <span>{isPt ? "Modo Impressão" : "Print Emulation"}</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">Folhas A4</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <GripVertical size={12} className="text-amber-600 shrink-0" />
                        <span>{isPt ? "Posição da Barra" : "Dock Position"}</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">{isPt ? "Clique / Arrastar" : "Click / Drag"}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Mobile iOS Style Settings Sheet */}
      <PreviewSettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={currentUiLang}
        currentTemplate={cv.template}
        currentDensity={cv.theme.fontSize}
        currentColor={cv.theme.primaryColor}
        currentFont={cv.theme.fontFamily || "inter"}
        onSetTemplate={onSetTemplate}
        onUpdateTheme={onUpdateTheme}
      />
    </div>
  );
}
