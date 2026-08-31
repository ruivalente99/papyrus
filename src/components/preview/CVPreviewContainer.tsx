"use client";

import React, { useState, useRef, useEffect } from "react";
import type { CVDocument, SupportedLanguage, TemplateId } from "@/types/cv";
import { CVPage } from "./CVPage";
import { exportToPdf, exportToPng, printCV, A4_H_PX } from "@/lib/pdfExport";
import { tUI } from "@/lib/i18n";
import {
  Download,
  Printer,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
} from "lucide-react";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
  onSetTemplate: (t: TemplateId) => void;
  onUpdateTheme: (theme: Partial<CVDocument["theme"]>) => void;
  onExportJson: () => void;
}

const ACCENT_COLORS = [
  { name: "Teal (Lateralis)", hex: "#005555" },
  { name: "Royal Blue (Classic)", hex: "#004f90" },
  { name: "Navy Blue (Matrix)", hex: "#1e3a8a" },
  { name: "Emerald", hex: "#047857" },
  { name: "Amber / Bronze", hex: "#b45309" },
  { name: "Rose / Burgundy", hex: "#9f1239" },
  { name: "Slate / Charcoal", hex: "#334155" },
];

export function CVPreviewContainer({
  cv,
  lang,
  onSetTemplate,
  onUpdateTheme,
}: Props) {
  const [zoom, setZoom] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const pageRef = useRef<HTMLDivElement>(null);

  // Calculate live page count for indicator
  useEffect(() => {
    if (!pageRef.current) return;
    const height = pageRef.current.offsetHeight || A4_H_PX;
    const pages = height <= A4_H_PX + 70 ? 1 : Math.ceil(height / A4_H_PX);
    setPageCount(pages);
  }, [cv, lang]);

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

  return (
    <div className="flex flex-col h-full bg-stone-200/60 dark:bg-stone-950 text-stone-800 dark:text-stone-200 transition-colors">
      {/* Top Controls Toolbar */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs transition-colors">
        {/* Template, Density & Color Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Template Selector */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => onSetTemplate("lateralis")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                cv.template === "lateralis" || cv.template === "canva"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {tUI("templateLateralis", lang)}
            </button>
            <button
              onClick={() => onSetTemplate("classic")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                cv.template === "classic" || cv.template === "latex"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {tUI("templateClassic", lang)}
            </button>
            <button
              onClick={() => onSetTemplate("matrix")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                cv.template === "matrix" || cv.template === "europass"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {tUI("templateMatrix", lang)}
            </button>
          </div>

          {/* Density Selector */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => onUpdateTheme({ fontSize: "compact" })}
              title="Compact spacing"
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                cv.theme.fontSize === "compact"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-2xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              {tUI("densityCompact", lang)}
            </button>
            <button
              onClick={() => onUpdateTheme({ fontSize: "normal" })}
              title="Balanced spacing"
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                cv.theme.fontSize === "normal" || !cv.theme.fontSize
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-2xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              {tUI("densityNormal", lang)}
            </button>
            <button
              onClick={() => onUpdateTheme({ fontSize: "spacious" })}
              title="Spacious breathing room"
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                cv.theme.fontSize === "spacious"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-2xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              {tUI("densitySpacious", lang)}
            </button>
          </div>

          {/* Accent Color Circles */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-stone-200 dark:border-stone-700">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => onUpdateTheme({ primaryColor: c.hex })}
                title={c.name}
                className={`w-4 h-4 rounded-full transition-transform ${
                  cv.theme.primaryColor === c.hex
                    ? "scale-125 ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-stone-900"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Zoom & Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Page count pill */}
          <span className="text-[11px] font-semibold bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md font-mono border border-stone-300 dark:border-stone-700">
            {pageCount} {pageCount === 1 ? tUI("pageCountSingle", lang) : tUI("pageCountPlural", lang)}
          </span>

          {/* Zoom controls */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              title={tUI("zoomOut", lang)}
              className="p-1 hover:text-stone-900 dark:hover:text-white"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[11px] font-mono px-1.5 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              title={tUI("zoomIn", lang)}
              className="p-1 hover:text-stone-900 dark:hover:text-white"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => setZoom(0.85)}
              title={tUI("resetZoom", lang)}
              className="p-1 hover:text-stone-900 dark:hover:text-white border-l border-stone-200 dark:border-stone-700 pl-1.5"
            >
              <Maximize2 size={12} />
            </button>
          </div>

          {/* Action Export Buttons */}
          <button
            onClick={printCV}
            title="Native Print / PDF"
            className="flex items-center gap-1 text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">{tUI("printBtn", lang)}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting !== null}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors disabled:opacity-50"
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
            className="flex items-center gap-1 text-xs font-medium bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors disabled:opacity-50"
          >
            <ImageIcon size={13} />
            <span className="hidden sm:inline">{tUI("pngBtn", lang)}</span>
          </button>
        </div>
      </div>

      {/* Page Canvas Viewport */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="relative"
        >
          <CVPage ref={pageRef} cv={cv} lang={lang} />

          {/* Visual A4 Page Break Guide when document exceeds 1 page */}
          {pageCount > 1 && (
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-amber-600 pointer-events-none flex items-center justify-end px-3"
              style={{ top: `${A4_H_PX}px` }}
            >
              <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded -translate-y-1/2 shadow-xs">
                {tUI("pageLimitGuide", lang)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
