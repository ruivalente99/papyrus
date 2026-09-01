"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { exportToLatex } from "@/lib/latexEngine";
import {
  FileCode2,
  FileJson,
  Check,
  Copy,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
  mode: "json" | "latex";
  onUpdateFromJson: (jsonStr: string) => { success: boolean; error?: string };
  onClose: () => void;
}

export function CodeEditorPane({
  cv,
  lang,
  mode,
  onUpdateFromJson,
  onClose,
}: Props) {
  const isPt = lang === "pt";

  // JSON State
  const initialJson = useMemo(() => JSON.stringify(cv, null, 2), [cv]);
  const [jsonContent, setJsonContent] = useState(initialJson);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Sync internal JSON when CV changes externally (unless user has dirty edits)
  useEffect(() => {
    try {
      if (JSON.stringify(JSON.parse(jsonContent)) === JSON.stringify(cv)) {
        return;
      }
    } catch (e) {}
    setJsonContent(JSON.stringify(cv, null, 2));
    setJsonError(null);
  }, [cv]);

  // LaTeX State
  const latexSource = useMemo(() => {
    try {
      return exportToLatex(cv, lang);
    } catch (e: any) {
      return `% Error generating LaTeX: ${e?.message || "Unknown error"}`;
    }
  }, [cv, lang]);

  const handleJsonChange = (newVal: string) => {
    setJsonContent(newVal);
    setAppliedSuccess(false);
    try {
      JSON.parse(newVal);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax");
    }
  };

  const handleApplyJson = () => {
    const result = onUpdateFromJson(jsonContent);
    if (!result.success) {
      setJsonError(result.error || "Failed to parse CV structure");
    } else {
      setJsonError(null);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 2000);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax");
    }
  };

  const handleCopy = () => {
    const textToCopy = mode === "json" ? jsonContent : latexSource;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (mode === "json") {
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${cv.personalInfo?.fullName?.toLowerCase().replace(/\s+/g, "-") || "papyrus"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([latexSource], { type: "text/x-tex" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${cv.personalInfo?.fullName?.toLowerCase().replace(/\s+/g, "-") || "resume"}.tex`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const isJson = mode === "json";

  return (
    <div className="flex flex-col h-full bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 overflow-hidden shadow-xl font-mono text-xs">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-950 border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          {isJson ? (
            <FileJson size={15} className="text-amber-500" />
          ) : (
            <FileCode2 size={15} className="text-cyan-400" />
          )}
          <span className="font-bold text-stone-200">
            {isJson ? "document.json" : "resume.tex"}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
            {isJson ? (isPt ? "Modo Bidirecional" : "Bidirectional") : (isPt ? "Compilável" : "Compilable")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isJson && (
            <>
              <button
                type="button"
                onClick={handleFormatJson}
                title={isPt ? "Formatar / Indentar JSON" : "Prettify JSON"}
                className="px-2 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1 transition-colors"
              >
                <Sparkles size={11} className="text-amber-400" />
                <span className="hidden sm:inline">{isPt ? "Formatar" : "Format"}</span>
              </button>

              <button
                type="button"
                onClick={handleApplyJson}
                disabled={Boolean(jsonError)}
                title={isPt ? "Aplicar ao documento em direto" : "Apply to live document"}
                className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:pointer-events-none text-stone-950 font-bold text-[11px] flex items-center gap-1 transition-colors active:scale-95"
              >
                {appliedSuccess ? <Check size={12} /> : <ArrowRight size={12} />}
                <span>{appliedSuccess ? (isPt ? "Aplicado!" : "Applied!") : isPt ? "Aplicar" : "Apply"}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title={isPt ? "Copiar código" : "Copy code"}
            className="p-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title={isPt ? "Descarregar ficheiro" : "Download file"}
            className="p-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* Syntax Error Banner */}
      {isJson && jsonError && (
        <div className="px-3.5 py-1.5 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-[11px] flex items-center gap-2 shrink-0">
          <AlertTriangle size={13} className="text-rose-400 shrink-0" />
          <span className="truncate">{jsonError}</span>
        </div>
      )}

      {/* Code Textarea Area */}
      <div className="flex-1 relative overflow-hidden flex bg-stone-950">
        <textarea
          value={isJson ? jsonContent : latexSource}
          onChange={(e) => isJson && handleJsonChange(e.target.value)}
          readOnly={!isJson}
          spellCheck={false}
          className="w-full h-full p-3.5 bg-transparent text-stone-200 resize-none outline-hidden font-mono text-[11px] leading-relaxed selection:bg-amber-500/30 overflow-y-auto"
        />
      </div>

      {/* Footer Info */}
      <div className="px-3.5 py-1.5 bg-stone-950 border-t border-stone-800 text-[10px] text-stone-500 flex items-center justify-between shrink-0">
        <div>
          {isJson
            ? isPt
              ? "Edição com reflexo em tempo real na folha A4."
              : "Edits synchronize in real time to the A4 preview."
            : isPt
            ? "Compatível com TeX Live, MacTeX e Overleaf."
            : "Compatible with TeX Live, MacTeX and Overleaf."}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-stone-400 hover:text-amber-400 transition-colors"
        >
          {isPt ? "Fechar código" : "Close code"}
        </button>
      </div>
    </div>
  );
}
