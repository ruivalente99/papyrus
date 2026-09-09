"use client";

import React, { useState, useMemo } from "react";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import type { ExportPdfOptions } from "@/lib/pdfExport";
import { auditPdfAccessibility } from "@/lib/pdfSecurity";
import { useTranslation } from "@/hooks/useTranslation";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  FileCheck2,
  Download,
  KeyRound,
  Layers,
  Printer,
  Copy,
  Sun,
  Moon,
} from "lucide-react";

interface PdfSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: CVDocument;
  lang: SupportedLanguage;
  onExportPdf: (options: ExportPdfOptions) => void;
  onExportPackage?: (options: ExportPdfOptions) => void;
}

export function PdfSecurityModal({
  isOpen,
  onClose,
  cv,
  lang,
  onExportPdf,
  onExportPackage,
}: PdfSecurityModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"a11y" | "security">("a11y");

  // PDF/UA Accessibility State
  const [enablePdfUa, setEnablePdfUa] = useState(true);

  // PDF Color Theme State (Light vs Dark Mode)
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  // Security / Password State
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [allowModifying, setAllowModifying] = useState(false);

  // Run Real-time Accessibility Audit
  const auditReport = useMemo(() => {
    return auditPdfAccessibility(cv, lang);
  }, [cv, lang]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return "none";
    if (password.length < 6) return "weak";
    const hasNum = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (password.length >= 10 && hasNum && hasSpecial) return "strong";
    if (password.length >= 8 || (hasNum && hasSpecial)) return "medium";
    return "weak";
  }, [password]);

  const passwordsMatch = !enablePassword || password === confirmPassword;
  const canExport = !enablePassword || (password.trim().length > 0 && passwordsMatch);

  if (!isOpen) return null;

  const getExportOptions = (): ExportPdfOptions => {
    return {
      cv,
      lang,
      enablePdfUa,
      colorMode,
      encryption: enablePassword
        ? {
            userPassword: password,
            permissions: {
              allowPrinting,
              allowCopying,
              allowModifying,
            },
          }
        : undefined,
    };
  };

  const handleExportPdfClick = () => {
    if (!canExport) return;
    onExportPdf(getExportOptions());
    onClose();
  };

  const handleExportPackageClick = () => {
    if (!canExport || !onExportPackage) return;
    onExportPackage(getExportOptions());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-security-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-[#30363d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 id="pdf-security-title" className="text-base font-bold text-stone-900 dark:text-[#f0f3f6]">
                {t("pdfSecurity.modalTitle")}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t("pdfSecurity.modalSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#21262d] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div className="px-5 pt-3 pb-1 border-b border-stone-100 dark:border-[#21262d] flex items-center gap-2 shrink-0 bg-stone-50/50 dark:bg-[#0d1117]/50">
          <button
            type="button"
            onClick={() => setActiveTab("a11y")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "a11y"
                ? "bg-white dark:bg-[#21262d] text-amber-700 dark:text-amber-400 shadow-xs border border-stone-200 dark:border-[#363d47]"
                : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <FileCheck2 size={13} />
            <span>{t("pdfSecurity.tabA11y")}</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded-full font-mono">
              {auditReport.overallScore}%
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "security"
                ? "bg-white dark:bg-[#21262d] text-amber-700 dark:text-amber-400 shadow-xs border border-stone-200 dark:border-[#363d47]"
                : "text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <Lock size={13} />
            <span>{t("pdfSecurity.tabSecurity")}</span>
            {enablePassword && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm">
          {activeTab === "a11y" ? (
            /* Tab 1: PDF/UA Accessibility Audit */
            <div className="space-y-4">
              {/* Score & Status Card */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-[#30363d] bg-stone-50 dark:bg-[#0d1117] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-base border border-emerald-500/20">
                    {auditReport.overallScore}%
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[#8b949e]">
                      {t("pdfSecurity.a11yScore")}
                    </div>
                    <div className="text-sm font-bold text-stone-900 dark:text-[#f0f3f6]">
                      {auditReport.status === "compliant"
                        ? t("pdfSecurity.compliant")
                        : auditReport.status === "needs-attention"
                        ? t("pdfSecurity.needsAttention")
                        : t("pdfSecurity.nonCompliant")}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono text-stone-500 dark:text-[#8b949e]">
                  {auditReport.passedCount} / {auditReport.totalCount} rules passed
                </div>
              </div>

              {/* PDF/UA Tagging Toggle */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 dark:border-[#30363d] hover:bg-stone-50 dark:hover:bg-[#21262d]/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={enablePdfUa}
                  onChange={(e) => setEnablePdfUa(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-stone-900 dark:text-[#f0f3f6]">
                    {t("pdfSecurity.enablePdfUa")}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    {t("pdfSecurity.enablePdfUaHint")}
                  </div>
                </div>
              </label>

              {/* Audit Checklist Items */}
              <div className="space-y-2">
                <div className="text-xs font-bold font-mono uppercase tracking-wider text-stone-500 dark:text-[#8b949e] px-1">
                  ISO 14289-1 & WCAG 2.1 AA Audit Checklist
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {auditReport.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-stone-200/80 dark:border-[#21262d] bg-white dark:bg-[#161b22] text-xs flex items-start gap-2.5"
                    >
                      {item.status === "pass" ? (
                        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : item.status === "warn" ? (
                        <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-stone-800 dark:text-[#f0f3f6] truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-[#21262d] text-stone-600 dark:text-stone-300 shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: PDF Password Encryption */
            <div className="space-y-4">
              {/* Enable Password Toggle */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 dark:border-[#30363d] hover:bg-stone-50 dark:hover:bg-[#21262d]/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={enablePassword}
                  onChange={(e) => setEnablePassword(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-stone-900 dark:text-[#f0f3f6]">
                    {t("pdfSecurity.protectPassword")}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    {t("pdfSecurity.protectPasswordHint")}
                  </div>
                </div>
              </label>

              {enablePassword && (
                <div className="space-y-3.5 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 animate-in fade-in duration-200">
                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span>{t("pdfSecurity.password")}</span>
                      {password && (
                        <span
                          className={`text-[10px] font-bold uppercase font-mono ${
                            passwordStrength === "strong"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : passwordStrength === "medium"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {passwordStrength === "strong"
                            ? t("pdfSecurity.strengthStrong")
                            : passwordStrength === "medium"
                            ? t("pdfSecurity.strengthMedium")
                            : t("pdfSecurity.strengthWeak")}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("pdfSecurity.passwordPlaceholder")}
                        className="w-full text-xs px-3 py-2 pr-9 rounded-lg border border-stone-300 dark:border-[#363d47] bg-white dark:bg-[#0d1117] text-stone-900 dark:text-[#f0f3f6] focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {t("pdfSecurity.confirmPassword")}
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("pdfSecurity.confirmPasswordPlaceholder")}
                      className={`w-full text-xs px-3 py-2 rounded-lg border ${
                        !passwordsMatch && confirmPassword
                          ? "border-rose-500 focus:ring-rose-500"
                          : "border-stone-300 dark:border-[#363d47] focus:ring-amber-500"
                      } bg-white dark:bg-[#0d1117] text-stone-900 dark:text-[#f0f3f6] focus:outline-none focus:ring-1`}
                    />
                    {!passwordsMatch && confirmPassword && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        {t("pdfSecurity.passwordsMismatch")}
                      </p>
                    )}
                  </div>

                  {/* Permissions & Restrictions */}
                  <div className="pt-2 border-t border-stone-200 dark:border-[#30363d] space-y-2">
                    <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-stone-500 dark:text-[#8b949e]">
                      {t("pdfSecurity.permissions")}
                    </div>
                    <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowPrinting}
                        onChange={(e) => setAllowPrinting(e.target.checked)}
                        className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500"
                      />
                      <Printer size={13} className="text-stone-400 shrink-0" />
                      <span>{t("pdfSecurity.allowPrinting")}</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowCopying}
                        onChange={(e) => setAllowCopying(e.target.checked)}
                        className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500"
                      />
                      <Copy size={13} className="text-stone-400 shrink-0" />
                      <span>{t("pdfSecurity.allowCopying")}</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowModifying}
                        onChange={(e) => setAllowModifying(e.target.checked)}
                        className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500"
                      />
                      <ShieldCheck size={13} className="text-stone-400 shrink-0" />
                      <span>{t("pdfSecurity.allowModifying")}</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-[#30363d] bg-stone-50 dark:bg-[#0d1117] flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold text-stone-600 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              {t("pdfSecurity.cancel")}
            </button>

            {/* Theme Toggle Pill */}
            <div className="flex items-center gap-0.5 bg-stone-200/70 dark:bg-[#21262d] p-0.5 rounded-xl border border-stone-200 dark:border-[#363d47]">
              <button
                type="button"
                onClick={() => setColorMode("light")}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  colorMode === "light"
                    ? "bg-white dark:bg-[#30363d] text-stone-900 dark:text-[#f0f3f6] shadow-xs"
                    : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-stone-200"
                }`}
                title={t("pdfSecurity.lightModeTitle")}
              >
                <Sun size={12} className="text-amber-500" />
                <span>{t("pdfSecurity.light")}</span>
              </button>
              <button
                type="button"
                onClick={() => setColorMode("dark")}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  colorMode === "dark"
                    ? "bg-stone-900 text-white shadow-xs dark:bg-amber-600 dark:text-white"
                    : "text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-stone-200"
                }`}
                title={t("pdfSecurity.darkModeTitle")}
              >
                <Moon size={12} className={colorMode === "dark" ? "text-amber-300" : "text-indigo-400"} />
                <span>{t("pdfSecurity.dark")}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onExportPackage && (
              <button
                type="button"
                onClick={handleExportPackageClick}
                disabled={!canExport}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-[#363d47] hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-800 dark:text-[#f0f3f6] transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                <Layers size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>{t("pdfSecurity.exportPackage")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportPdfClick}
              disabled={!canExport}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {enablePassword ? <KeyRound size={13} /> : <Download size={13} />}
              <span>{t("pdfSecurity.exportPdf")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
