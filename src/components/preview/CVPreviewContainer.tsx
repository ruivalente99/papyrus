"use client";

import React, { useState, useRef, useEffect } from "react";
import type { CVDocument, SupportedLanguage, TemplateId } from "@/types/cv";
import { CVPage } from "./CVPage";
import { exportToPdf, exportToPng, A4_H_PX, A4_W_PX } from "@/lib/pdfExport";
import { tUI } from "@/lib/i18n";
import {
  Download,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  Palette,
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
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [docHeight, setDocHeight] = useState<number>(A4_H_PX);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const pageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Calculate live page count & actual height for scaling container
  useEffect(() => {
    if (!pageRef.current) return;
    const height = pageRef.current.offsetHeight || A4_H_PX;
    setDocHeight(height);
    const pages = height <= A4_H_PX + 70 ? 1 : Math.ceil(height / A4_H_PX);
    setPageCount(pages);
  }, [cv, lang]);

  // Responsive Auto-Fit calculation based on screen and container size
  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    const calcAutoFit = () => {
      if (!isAutoFit) return;
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

  const handleZoomChange = (delta: number) => {
    setIsAutoFit(false);
    setZoom((z) => Math.max(0.3, Math.min(1.5, Number((z + delta).toFixed(2)))));
  };

  const handleToggleAutoFit = () => {
    setIsAutoFit(true);
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
    <div className="flex flex-col h-full bg-stone-200/50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 transition-colors">
      {/* Top Controls Toolbar - Charm Segmented Pill Toolbar */}
      {/* Top Controls Toolbar - Charm Segmented Pill Toolbar */}
      <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-3 sm:px-4 py-2 shadow-2xs transition-colors shrink-0">
        {/* MOBILE TOOLBAR: Clean Single 44px Row */}
        <div className="flex sm:hidden items-center justify-between gap-2">
          {/* Left: Page Count Badge & Compact Zoom Pill */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10.5px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-full font-mono border border-stone-200 dark:border-stone-700 shadow-2xs shrink-0">
              {pageCount} {pageCount === 1 ? tUI("pageCountSingle", lang) : tUI("pageCountPlural", lang)}
            </span>

            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-full p-0.5 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 shadow-2xs shrink-0">
              <button
                onClick={() => handleZoomChange(-0.1)}
                title={tUI("zoomOut", lang)}
                className="p-1 hover:text-stone-900 dark:hover:text-white"
              >
                <ZoomOut size={12} />
              </button>
              <span className="text-[10px] font-mono px-1 min-w-[28px] text-center font-bold">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoomChange(0.1)}
                title={tUI("zoomIn", lang)}
                className="p-1 hover:text-stone-900 dark:hover:text-white"
              >
                <ZoomIn size={12} />
              </button>
              <button
                onClick={handleToggleAutoFit}
                title={lang === "pt" ? "Ajustar ao tamanho do ecrã" : "Fit to screen size"}
                className={`p-1 border-l border-stone-200 dark:border-stone-700 pl-1 transition-colors ${
                  isAutoFit
                    ? "text-amber-700 dark:text-amber-400 font-bold"
                    : "hover:text-stone-900 dark:hover:text-white text-stone-400"
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-200 rounded-full text-xs font-bold border border-stone-200/80 dark:border-stone-700 shadow-2xs transition-all active:scale-95 shrink-0"
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
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-stone-200/50 dark:border-stone-800/50">
            {/* Template Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-full p-1 border border-stone-200 dark:border-stone-700 shadow-2xs shrink-0">
                <button
                  onClick={() => onSetTemplate("lateralis")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "lateralis" || cv.template === "canva"
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  {tUI("templateLateralis", lang)}
                </button>
                <button
                  onClick={() => onSetTemplate("classic")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "classic" || cv.template === "latex"
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  {tUI("templateClassic", lang)}
                </button>
                <button
                  onClick={() => onSetTemplate("matrix")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    cv.template === "matrix" || cv.template === "europass"
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  {tUI("templateMatrix", lang)}
                </button>
              </div>
            </div>

            {/* Right: Spacing Density & Accent Colors */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Density Selector */}
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-full p-1 border border-stone-200 dark:border-stone-700 shadow-2xs shrink-0">
                <button
                  onClick={() => onUpdateTheme({ fontSize: "compact" })}
                  title="Compact spacing"
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                    cv.theme.fontSize === "compact"
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  {tUI("densityCompact", lang)}
                </button>
                <button
                  onClick={() => onUpdateTheme({ fontSize: "normal" })}
                  title="Balanced spacing"
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                    cv.theme.fontSize === "normal" || !cv.theme.fontSize
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  {tUI("densityNormal", lang)}
                </button>
                <button
                  onClick={() => onUpdateTheme({ fontSize: "spacious" })}
                  title="Spacious breathing room"
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all ${
                    cv.theme.fontSize === "spacious"
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  {tUI("densitySpacious", lang)}
                </button>
              </div>

              {/* Accent Color Circles */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 dark:border-stone-700 shrink-0">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onUpdateTheme({ primaryColor: c.hex })}
                    title={c.name}
                    className={`w-4.5 h-4.5 rounded-full transition-transform ${
                      cv.theme.primaryColor === c.hex
                        ? "scale-125 ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-stone-900 shadow-xs"
                        : "hover:scale-110 opacity-85 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Navigation & Output Actions */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Left: Page count badge & Zoom controls with Auto-Fit */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10.5px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-full font-mono border border-stone-200 dark:border-stone-700 shadow-2xs shrink-0">
                {pageCount} {pageCount === 1 ? tUI("pageCountSingle", lang) : tUI("pageCountPlural", lang)}
              </span>

              <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-full p-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 shadow-2xs shrink-0">
                <button
                  onClick={() => handleZoomChange(-0.1)}
                  title={tUI("zoomOut", lang)}
                  className="p-1 hover:text-stone-900 dark:hover:text-white"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] font-mono px-1 min-w-[34px] text-center font-bold">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => handleZoomChange(0.1)}
                  title={tUI("zoomIn", lang)}
                  className="p-1 hover:text-stone-900 dark:hover:text-white"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  onClick={handleToggleAutoFit}
                  title={lang === "pt" ? "Ajustar ao tamanho do ecrã" : "Fit to screen size"}
                  className={`p-1 border-l border-stone-200 dark:border-stone-700 pl-1.5 transition-colors ${
                    isAutoFit
                      ? "text-amber-700 dark:text-amber-400 font-bold"
                      : "hover:text-stone-900 dark:hover:text-white text-stone-400"
                  }`}
                >
                  <Maximize2 size={12} />
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
                className="hidden sm:flex items-center gap-1 text-xs font-semibold bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 transition-all shadow-2xs disabled:opacity-50 shrink-0"
              >
                <ImageIcon size={13} />
                <span>{tUI("pngBtn", lang)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Canvas Viewport with Dynamic Warm Backdrop and Box Containment */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-auto p-2 sm:p-5 flex items-start charm-bg-dynamic min-h-0 select-none pb-24 sm:pb-8"
        style={{ touchAction: "pan-y" }}
      >
        <div
          style={{
            width: `${A4_W_PX * zoom}px`,
            height: `${actualDocHeight * zoom}px`,
            transition: "width 0.15s ease-out, height 0.15s ease-out",
          }}
          className="relative shrink-0 m-auto"
        >
          <div
            style={{
              width: `${A4_W_PX}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
            }}
            className="absolute top-0 left-0"
          >
            <CVPage ref={pageRef} cv={cv} lang={lang} onSelectSection={onSelectSection} />

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
