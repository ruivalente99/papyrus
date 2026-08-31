"use client";

import React, { useState } from "react";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { exportToLatex, importFromLatex } from "@/lib/latexEngine";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import { Download, Copy, Check, Upload, FileCode, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cv: CVDocument;
  lang: SupportedLanguage;
  onImportCV: (doc: CVDocument) => void;
}

export function LatexModal({ open, onOpenChange, cv, lang, onImportCV }: Props) {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!open) return null;

  const isPt = lang === "pt";
  const latexCode = exportToLatex(cv, lang);

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${(cv.personalInfo.fullName || "curriculum").toLowerCase().replace(/\s+/g, "_")}_cv.tex`;
    const blob = new Blob([latexCode], { type: "text/x-tex;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setImportText(content);
      processImport(content);
    };
    reader.readAsText(file);
  };

  const processImport = (textToImport: string) => {
    try {
      const parsed = importFromLatex(textToImport);
      const merged: CVDocument = {
        ...cv,
        ...parsed,
        personalInfo: {
          ...cv.personalInfo,
          ...(parsed.personalInfo || {}),
        },
        sections: parsed.sections || cv.sections,
        updatedAt: new Date().toISOString(),
      };
      onImportCV(merged);
      setImportStatus(
        isPt
          ? "Documento TeX importado com sucesso!"
          : "TeX document imported successfully!"
      );
      setTimeout(() => {
        setImportStatus(null);
        onOpenChange(false);
      }, 1200);
    } catch (err: any) {
      setImportStatus((isPt ? "Erro ao analisar documento: " : "Parse error: ") + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header - Charm Minimalist */}
        <div className="px-5 py-3.5 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            <NanoBananaLogo size="sm" />
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              {isPt ? "Gestão TeX" : "TeX Management"}
            </h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-full hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher - Charm Pill Segmented */}
        <div className="px-6 pt-4 pb-1">
          <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700 shadow-2xs">
            <button
              onClick={() => setActiveTab("export")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                activeTab === "export"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {isPt ? "Exportar TeX (.tex)" : "Export TeX (.tex)"}
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                activeTab === "import"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {isPt ? "Importar TeX (.tex)" : "Import TeX (.tex)"}
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 pt-2 flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === "export" ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  {isPt ? "Idioma:" : "Language:"} <b>{lang.toUpperCase()}</b> • UTF-8 TeX
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs"
                  >
                    {copied ? <Check size={13} className="text-green-600 dark:text-green-400" /> : <Copy size={13} />}
                    <span>{copied ? (isPt ? "Copiado!" : "Copied!") : isPt ? "Copiar Código" : "Copy Source"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-4 py-1.5 rounded-full transition-colors shadow-xs"
                  >
                    <Download size={13} />
                    <span>{isPt ? "Descarregar .tex" : "Download .tex"}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-950 p-4 text-stone-100 font-mono text-[11px] leading-relaxed shadow-inner">
                <pre className="whitespace-pre">{latexCode}</pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-5 text-center hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <input
                  type="file"
                  id="latex-file-upload"
                  accept=".tex,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="latex-file-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <FileCode size={24} className="text-amber-700 dark:text-amber-400" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {isPt ? "Clique para carregar ficheiro .tex ou arraste para aqui" : "Click to upload a .tex file or drag and drop"}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {isPt ? "Suporta ficheiros de currículo em TeX padrão" : "Supports standard TeX curriculum files"}
                  </span>
                </label>
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {isPt ? "Ou cole o código TeX diretamente:" : "Or paste TeX code directly:"}
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="\begin{document} ... \end{document}"
                  className="flex-1 text-xs font-mono p-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none min-h-[120px]"
                />
              </div>

              {importStatus && (
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-2xl border border-amber-200 dark:border-amber-800">
                  {importStatus}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => processImport(importText)}
                  disabled={!importText.trim()}
                  className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-full transition-colors disabled:opacity-50 shadow-xs"
                >
                  <Upload size={13} />
                  <span>{isPt ? "Processar e Importar" : "Parse & Import"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
