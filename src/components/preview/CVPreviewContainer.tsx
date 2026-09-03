"use client";

import React, { useState, useRef, useEffect } from "react";
import type { CVDocument, SupportedLanguage, TemplateId } from "@/types/cv";
import { CVPage } from "./CVPage";
import { exportToPdf, exportToPng, A4_H_PX, A4_W_PX } from "@/lib/pdfExport";
import { tUI } from "@/lib/i18n";
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
} from "lucide-react";
import { PreviewSettingsSheet, ACCENT_COLORS } from "./PreviewSettingsSheet";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
  onSetTemplate: (t: TemplateId) => void;
  onUpdateTheme: (theme: Partial<CVDocument["theme"]>) => void;
  onExportJson: () => void;
  onSelectSection?: (sectionId: string) => void;
  mobileTab?: "edit" | "preview";
}

export function CVPreviewContainer({
  cv,
  lang,
  onSetTemplate,
  onUpdateTheme,
  onSelectSection,
  mobileTab,
}: Props) {
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
  const pageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { t: tr } = useTranslation(lang);

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragMovedRef = useRef<number>(0);
  const pinchStartRef = useRef<{ distance: number; initialZoom: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  // Load alignment grid preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("papyrus_preview_grid");
      if (saved === "true") setShowGrid(true);
    } catch (e) {}
  }, []);

  const toggleGrid = () => {
    setShowGrid((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("papyrus_preview_grid", String(next));
      } catch (e) {}
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
    if (!pageRef.current) return;
    const height = pageRef.current.offsetHeight || A4_H_PX;
    setDocHeight(height);
    const pages = height <= A4_H_PX + 70 ? 1 : Math.ceil(height / A4_H_PX);
    setPageCount(pages);
  }, [cv, lang]);

  const isAutoFitRef = useRef<boolean>(isAutoFit);
  useEffect(() => {
    isAutoFitRef.current = isAutoFit;
  }, [isAutoFit]);

  // Responsive Auto-Fit calculation based on screen and container size
  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    const calcAutoFit = () => {
      if (!isAutoFitRef.current) return;
      const width = container.clientWidth;
      if (!width || width <= 0) return;
      // Provide comfortable breathing room: 16px on mobile, 40px on tablet/desktop
      const margin = width < 640 ? 16 : 40;
      const availableWidth = Math.max(260, width - margin);
      const calculatedScale = Math.min(1.2, Math.max(0.32, availableWidth / A4_W_PX));
      setZoom(Number(calculatedScale.toFixed(2)));
    };

    calcAutoFit();
    const rafId = requestAnimationFrame(calcAutoFit);
    const timeoutId = setTimeout(calcAutoFit, 80);

    const ro = new ResizeObserver(calcAutoFit);
    ro.observe(container);
    window.addEventListener("resize", calcAutoFit);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      ro.disconnect();
      window.removeEventListener("resize", calcAutoFit);
    };
  }, [isAutoFit, mobileTab, cv.template]);

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
      } catch (err) {}
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
      } catch (err) {}
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
    if (dragMovedRef.current > 6) return;
    if (onSelectSection) {
      onSelectSection(sectionId);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pageRef.current || isExporting) return;
    setIsExporting("pdf");
    try {
      const filename = `${(cv.personalInfo.fullName || "curriculum").toLowerCase().replace(/\s+/g, "_")}_cv.pdf`;
      await exportToPdf(pageRef.current, filename);
    } catch (e) {
      console.error("PDF export error:", e);
      alert("Error generating PDF.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadPng = async () => {
    if (!pageRef.current || isExporting) return;
    setIsExporting("png");
    try {
      const filename = `${(cv.personalInfo.fullName || "curriculum").toLowerCase().replace(/\s+/g, "_")}_cv.png`;
      await exportToPng(pageRef.current, filename);
    } catch (e) {
      console.error("PNG export error:", e);
      alert("Error exporting PNG.");
    } finally {
      setIsExporting(null);
    }
  };

  const actualDocHeight = Math.max(A4_H_PX, docHeight);

  return (
    <div className="flex flex-col h-full bg-stone-200/50 dark:bg-[#0d1117] text-stone-800 dark:text-[#c9d1d9] transition-colors">
      {/* Top Controls Toolbar - Charm Segmented Pill Toolbar */}
      <div className="bg-white/90 dark:bg-[#161b22]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-[#30363d] px-3 sm:px-4 py-2 shadow-2xs transition-colors shrink-0">
        {/* MOBILE TOOLBAR: Clean Single 44px Row */}
        <div className="flex sm:hidden items-center justify-between gap-2">
          {/* Left: Page Count Badge & Compact Zoom Pill */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10.5px] font-bold bg-stone-100 dark:bg-[#21262d] text-stone-700 dark:text-[#f0f3f6] px-2.5 py-1 rounded-full font-mono border border-stone-200 dark:border-[#363d47] shadow-2xs shrink-0">
              {pageCount} {pageCount === 1 ? tUI("pageCountSingle", lang) : tUI("pageCountPlural", lang)}
            </span>

            <div className="flex items-center bg-stone-100 dark:bg-[#21262d] rounded-full p-0.5 border border-stone-200 dark:border-[#363d47] text-stone-700 dark:text-[#c9d1d9] shadow-2xs shrink-0">
              <button
                onClick={() => handleZoomChange(-0.1)}
                title={tr("preview.canvas.zoomOut")}
                aria-label={tr("preview.canvas.zoomOut")}
                className="p-1 hover:text-stone-900 dark:hover:text-[#f0f3f6] min-w-[24px] min-h-[24px] flex items-center justify-center"
              >
                <ZoomOut size={12} />
              </button>
              <span className="text-[10px] font-mono px-1 min-w-[28px] text-center font-bold">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoomChange(0.1)}
                title={tr("preview.canvas.zoomIn")}
                aria-label={tr("preview.canvas.zoomIn")}
                className="p-1 hover:text-stone-900 dark:hover:text-[#f0f3f6] min-w-[24px] min-h-[24px] flex items-center justify-center"
              >
                <ZoomIn size={12} />
              </button>
              <button
                onClick={handleToggleAutoFit}
                title={tr("preview.canvas.fitToScreen")}
                aria-label={tr("preview.canvas.fitToScreen")}
                className={`p-1 border-l border-stone-200 dark:border-[#363d47] pl-1 transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center ${
                  isAutoFit
                    ? "text-amber-700 dark:text-amber-400 font-bold"
                    : "hover:text-stone-900 dark:hover:text-[#f0f3f6] text-stone-600 dark:text-[#8b949e]"
                }`}
              >
                <Maximize2 size={11} />
              </button>
            </div>
          </div>

          {/* Right: Estilo/Style Drawer Trigger & PDF Download Action */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label={tUI("customizeStyle", lang)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-stone-800 dark:text-[#f0f3f6] rounded-full text-xs font-bold border border-stone-200/80 dark:border-[#363d47] shadow-2xs transition-all active:scale-95 shrink-0"
            >
              <span
                className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 shrink-0"
                style={{ backgroundColor: cv.theme.primaryColor || "#005555" }}
              />
              <Palette size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{tUI("customizeStyle", lang)}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting !== null}
              className="flex items-center gap-1 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-full shadow-xs transition-all disabled:opacity-50 shrink-0"
            >
              {isExporting === "pdf" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              <span>{tUI("pdfBtn", lang)}</span>
            </button>
          </div>
        </div>

        {/* DESKTOP TOOLBAR: Structured Two-Row Layout */}
        <div className="hidden sm:flex flex-col gap-2">
          {/* Row 1: Document Style & Appearance */}
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-stone-200/50 dark:border-[#30363d]">
            {/* Template Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-stone-100 dark:bg-[#0d1117] rounded-full p-1 border border-stone-200 dark:border-[#363d47] shadow-2xs shrink-0">
                <button
                  onClick={() => onSetTemplate("lateralis")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "lateralis" || cv.template === "canva"
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tUI("templateLateralis", lang)}
                </button>
                <button
                  onClick={() => onSetTemplate("classic")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "classic" || cv.template === "latex"
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tUI("templateClassic", lang)}
                </button>
                <button
                  onClick={() => onSetTemplate("matrix")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "matrix" || cv.template === "europass"
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tUI("templateMatrix", lang)}
                </button>
              </div>
            </div>

            {/* Right: Spacing Density & Accent Colors */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Density Selector */}
              <div className="flex items-center bg-stone-100 dark:bg-[#0d1117] rounded-full p-1 border border-stone-200 dark:border-[#363d47] shadow-2xs shrink-0">
                <button
                  onClick={() => onUpdateTheme({ fontSize: "compact" })}
                  title="Compact spacing"
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                    cv.theme.fontSize === "compact"
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] font-bold shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tUI("densityCompact", lang)}
                </button>
                <button
                  onClick={() => onUpdateTheme({ fontSize: "normal" })}
                  title="Balanced spacing"
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                    cv.theme.fontSize === "normal" || !cv.theme.fontSize
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] font-bold shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tUI("densityNormal", lang)}
                </button>
                <button
                  onClick={() => onUpdateTheme({ fontSize: "spacious" })}
                  title="Spacious breathing room"
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                    cv.theme.fontSize === "spacious"
                      ? "bg-white dark:bg-[#21262d] text-stone-900 dark:text-[#f0f3f6] font-bold shadow-xs"
                      : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6]"
                  }`}
                >
                  {tUI("densitySpacious", lang)}
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

                {/* Custom Color "Outra" Picker */}
                <label
                  title={tr("preview.colors.customColor")}
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
            </div>
          </div>

          {/* Row 2: Navigation & Output Actions */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Left: Page count badge & Zoom controls with Auto-Fit & Grid */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10.5px] font-bold bg-stone-100 dark:bg-[#21262d] text-stone-700 dark:text-[#f0f3f6] px-2.5 py-1 rounded-full font-mono border border-stone-200 dark:border-[#363d47] shadow-2xs shrink-0">
                {pageCount} {pageCount === 1 ? tr("preview.toolbar.pageCountSingle") : tr("preview.toolbar.pageCountPlural")}
              </span>

              <div className="flex items-center bg-stone-100 dark:bg-[#21262d] rounded-full p-1 border border-stone-200 dark:border-[#363d47] text-stone-700 dark:text-[#c9d1d9] shadow-2xs shrink-0">
                <button
                  onClick={() => handleZoomChange(-0.1)}
                  title={tr("preview.canvas.zoomOut")}
                  aria-label={tr("preview.canvas.zoomOut")}
                  className="p-1 hover:text-stone-900 dark:hover:text-[#f0f3f6] min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] font-mono px-1 min-w-[34px] text-center font-bold">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => handleZoomChange(0.1)}
                  title={tr("preview.canvas.zoomIn")}
                  aria-label={tr("preview.canvas.zoomIn")}
                  className="p-1 hover:text-stone-900 dark:hover:text-[#f0f3f6] min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  onClick={handleToggleAutoFit}
                  title={tr("preview.canvas.fitToScreen")}
                  aria-label={tr("preview.canvas.fitToScreen")}
                  className={`p-1 border-l border-stone-200 dark:border-[#363d47] pl-1.5 transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center ${
                    isAutoFit
                      ? "text-amber-700 dark:text-amber-400 font-bold"
                      : "hover:text-stone-900 dark:hover:text-[#f0f3f6] text-stone-600 dark:text-[#8b949e]"
                  }`}
                >
                  <Maximize2 size={12} />
                </button>
                <button
                  onClick={toggleGrid}
                  title={showGrid ? tr("preview.canvas.hideGrid") : tr("preview.canvas.showGrid")}
                  aria-label={showGrid ? tr("preview.canvas.hideGrid") : tr("preview.canvas.showGrid")}
                  className={`p-1 border-l border-stone-200 dark:border-[#363d47] pl-1.5 transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center ${
                    showGrid
                      ? "text-amber-700 dark:text-amber-400 font-bold"
                      : "hover:text-stone-900 dark:hover:text-[#f0f3f6] text-stone-600 dark:text-[#8b949e]"
                  }`}
                >
                  <Grid size={12} />
                </button>
              </div>
            </div>

            {/* Right: PDF, PNG actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleDownloadPdf}
                disabled={isExporting !== null}
                className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1.5 rounded-full shadow-xs transition-all disabled:opacity-50 shrink-0"
              >
                {isExporting === "pdf" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                <span>{tUI("pdfBtn", lang)}</span>
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={isExporting !== null}
                className="hidden sm:flex items-center gap-1 text-xs font-semibold bg-white dark:bg-[#21262d] hover:bg-stone-50 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#f0f3f6] px-3 py-1.5 rounded-full border border-stone-200 dark:border-[#363d47] transition-all shadow-2xs disabled:opacity-50 shrink-0"
              >
                <ImageIcon size={13} />
                <span>{tUI("pngBtn", lang)}</span>
              </button>
            </div>
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
        className={`flex-1 relative overflow-hidden flex items-start justify-center charm-bg-dynamic min-h-0 select-none pt-4 sm:pt-6 pb-24 sm:pb-12 ${
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
          className="relative shrink-0 flex items-center justify-center will-change-transform z-10"
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
            <CVPage ref={pageRef} cv={cv} lang={lang} onSelectSection={handleSectionSelect} />

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

            {/* Visual A4 Page Break Guide when document exceeds 1 page */}
            {pageCount > 1 && (
              <div
                className="absolute left-0 right-0 border-b-2 border-dashed border-amber-600 pointer-events-none flex items-center justify-end px-3"
                style={{ top: `${A4_H_PX}px` }}
              >
                <span className="bg-amber-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full -translate-y-1/2 shadow-xs">
                  {tUI("pageLimitGuide", lang)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Miro-Style Canvas Control Bar */}
        <div
          data-testid="canvas-floating-toolbar"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border border-stone-200/80 dark:border-[#363d47] shadow-lg rounded-full p-1 text-stone-700 dark:text-[#c9d1d9] transition-all duration-200 hover:shadow-xl"
        >
          {/* Hand / Pointer Mode Toggle (Desktop only) */}
          <div className="hidden sm:flex items-center pr-1 border-r border-stone-200 dark:border-[#363d47]">
            <button
              onClick={() => handleSetToolMode("pointer")}
              title={tr("preview.canvas.selectionMode")}
              aria-label={tr("preview.canvas.selectionMode")}
              className={`p-1.5 rounded-full transition-all min-w-[28px] min-h-[28px] flex items-center justify-center ${
                toolMode === "pointer"
                  ? "bg-stone-200/80 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 font-bold"
                  : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
              }`}
            >
              <MousePointer size={13} />
            </button>
            <button
              onClick={() => handleSetToolMode("hand")}
              title={tr("preview.canvas.panMode")}
              aria-label={tr("preview.canvas.panMode")}
              className={`p-1.5 rounded-full transition-all min-w-[28px] min-h-[28px] flex items-center justify-center ${
                toolMode === "hand"
                  ? "bg-stone-200/80 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 font-bold"
                  : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
              }`}
            >
              <Hand size={13} />
            </button>
          </div>

          {/* Alignment Grid Toggle Button */}
          <button
            onClick={toggleGrid}
            title={showGrid ? tr("preview.canvas.hideGrid") : tr("preview.canvas.showGrid")}
            aria-label={showGrid ? tr("preview.canvas.hideGrid") : tr("preview.canvas.showGrid")}
            className={`p-1.5 rounded-full transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center ${
              showGrid
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold"
                : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
            }`}
          >
            <Grid size={13} />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => handleZoomChange(-0.1)}
            title={tr("preview.canvas.zoomOut")}
            aria-label={tr("preview.canvas.zoomOut")}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#21262d] transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center text-stone-600 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
          >
            <ZoomOut size={13} />
          </button>

          {/* Percentage badge (click to 100%) */}
          <button
            onClick={() => {
              setIsAutoFit(false);
              setZoom(1.0);
            }}
            title="100%"
            aria-label={tr("preview.canvas.resetZoom", { current: `${Math.round(zoom * 100)}%` })}
            className="px-2 py-0.5 text-[11px] font-mono font-bold hover:bg-stone-100 dark:hover:bg-[#21262d] rounded-md transition-colors min-w-[42px] min-h-[28px] text-center text-stone-700 dark:text-[#c9d1d9] flex items-center justify-center"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <button
            onClick={() => handleZoomChange(0.1)}
            title={tr("preview.canvas.zoomIn")}
            aria-label={tr("preview.canvas.zoomIn")}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#21262d] transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center text-stone-600 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
          >
            <ZoomIn size={13} />
          </button>

          {/* Auto-Fit */}
          <button
            onClick={handleToggleAutoFit}
            title={tr("preview.canvas.fitToScreen")}
            aria-label={tr("preview.canvas.fitToScreen")}
            className={`p-1.5 rounded-full transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center ${
              isAutoFit
                ? "bg-stone-200/80 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 font-bold"
                : "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
            }`}
          >
            <Maximize2 size={13} />
          </button>

          {/* Reset Viewport Position */}
          <button
            onClick={handleResetCanvas}
            title={tr("preview.canvas.resetView")}
            aria-label={tr("preview.canvas.resetView")}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6] transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Mobile iOS Style Settings Sheet */}
      <PreviewSettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        currentTemplate={cv.template}
        currentDensity={cv.theme.fontSize}
        currentColor={cv.theme.primaryColor}
        onSetTemplate={onSetTemplate}
        onUpdateTheme={onUpdateTheme}
      />
    </div>
  );
}
