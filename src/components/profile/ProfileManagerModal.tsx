"use client";

import React, { useState, useMemo } from "react";
import type { CVProfileMeta, MultiProfileBundle } from "@/types/profile";
import type { TemplateId } from "@/types/cv";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Briefcase,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  Download,
  Upload,
  Search,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: CVProfileMeta[];
  activeProfileId: string;
  onSwitchProfile: (id: string) => void;
  onCreateProfile: (name: string, templateId?: TemplateId, fromCurrent?: boolean) => void;
  onDuplicateProfile: (id: string, name?: string) => void;
  onRenameProfile: (id: string, newName: string) => void;
  onDeleteProfile: (id: string) => void;
  onExportBundle: () => MultiProfileBundle;
  onImportBundle: (bundle: MultiProfileBundle) => void;
}

export function ProfileManagerModal({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onCreateProfile,
  onDuplicateProfile,
  onRenameProfile,
  onDeleteProfile,
  onExportBundle,
  onImportBundle,
}: ProfileManagerModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [creationMode, setCreationMode] = useState<"fromActive" | "lateralis" | "classic" | "matrix">("fromActive");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.targetRole && p.targetRole.toLowerCase().includes(q)) ||
        p.template.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  const handleStartRename = (p: CVProfileMeta) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameProfile(id, editingName.trim());
    }
    setEditingId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (creationMode === "fromActive") {
      onCreateProfile(newName.trim(), undefined, true);
    } else {
      onCreateProfile(newName.trim(), creationMode, false);
    }

    setNewName("");
    setIsCreating(false);
    setStatusMessage({ text: t("profiles.createSuccess"), type: "success" });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExport = () => {
    try {
      const bundle = onExportBundle();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `papyrus-profiles-bundle-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: t("profiles.bundleExportSuccess"), type: "success" });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch {
      setStatusMessage({ text: "Failed to export bundle.", type: "error" });
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = evt.target?.result as string;
        const parsed = JSON.parse(raw);
        onImportBundle(parsed);
        setStatusMessage({ text: t("profiles.bundleImportSuccess"), type: "success" });
        setTimeout(() => setStatusMessage(null), 3500);
      } catch {
        setStatusMessage({ text: t("profiles.bundleImportError"), type: "error" });
        setTimeout(() => setStatusMessage(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-manager-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-[#30363d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 id="profile-manager-title" className="text-base font-bold text-stone-900 dark:text-[#f0f3f6]">
                {t("profiles.modalTitle")}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t("profiles.modalSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.actions.close") || "Close"}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#21262d] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-b ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
            }`}
          >
            {statusMessage.type === "success" ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="p-3 sm:px-5 border-b border-stone-200 dark:border-[#30363d] bg-stone-50/50 dark:bg-[#0d1117]/50 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-[#8b949e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("profiles.allProfiles")}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 dark:border-[#363d47] bg-white dark:bg-[#161b22] text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("profiles.new")}</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="p-1.5 rounded-full border border-stone-200 dark:border-[#363d47] hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#c9d1d9] text-xs transition-colors"
              title={t("profiles.exportBundle")}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <label
              className="p-1.5 rounded-full border border-stone-200 dark:border-[#363d47] hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#c9d1d9] text-xs transition-colors cursor-pointer"
              title={t("profiles.importBundle")}
            >
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Create Profile Drawer */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border-b border-amber-500/20 space-y-3 shrink-0"
          >
            <div className="text-xs font-bold text-stone-900 dark:text-[#f0f3f6] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t("profiles.createButton")}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-[#8b949e]">
                {t("profiles.createPromptTitle")}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("profiles.createPromptPlaceholder")}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-[#363d47] bg-white dark:bg-[#161b22] text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                autoFocus
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-[#8b949e]">
                {t("profiles.baseTemplate")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "fromActive", label: t("profiles.fromActive") },
                  { id: "lateralis", label: "Lateralis" },
                  { id: "classic", label: "Classic" },
                  { id: "matrix", label: "Matrix" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCreationMode(opt.id as any)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all text-left truncate ${
                      creationMode === opt.id
                        ? "border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold"
                        : "border-stone-200 dark:border-[#363d47] hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-600 dark:text-[#8b949e]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 text-xs text-stone-500 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6]"
              >
                {t("actions.cancel")}
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-full hover:bg-amber-700 shadow-2xs transition-all"
              >
                {t("actions.save")}
              </button>
            </div>
          </form>
        )}

        {/* Profile List */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-stone-400 dark:text-[#8b949e] text-xs">
              No profiles found matching your search.
            </div>
          ) : (
            filteredProfiles.map((p) => {
              const isActive = p.id === activeProfileId;
              const isEditing = editingId === p.id;
              const isDeleting = confirmDeleteId === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isActive
                      ? "border-amber-500/70 bg-amber-500/[0.04] shadow-xs"
                      : "border-stone-200 dark:border-[#30363d] bg-stone-50/30 dark:bg-[#21262d]/40 hover:border-stone-300 dark:hover:border-[#484f58]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 pb-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-amber-500 bg-white dark:bg-[#161b22] text-xs font-medium focus:outline-none w-full max-w-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(p.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(p.id)}
                            className="p-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-stone-900 dark:text-[#f0f3f6] truncate">
                            {p.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                              {t("profiles.active")}
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-wide font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#161b22] text-stone-500 dark:text-[#8b949e] border border-stone-200 dark:border-[#363d47]">
                            {p.template}
                          </span>
                          {p.atsScore !== undefined && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              ATS {p.atsScore}%
                            </span>
                          )}
                        </div>
                      )}

                      {p.targetRole && (
                        <div className="text-xs text-stone-500 dark:text-[#8b949e] mt-0.5 truncate">
                          {p.targetRole}
                        </div>
                      )}

                      <div className="text-[10px] text-stone-400 dark:text-[#8b949e]/80 mt-1 font-mono">
                        {t("profiles.lastUpdated", {
                          time: new Date(p.updatedAt).toLocaleDateString(),
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchProfile(p.id);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-[#30363d] hover:bg-stone-200 dark:hover:bg-[#3d444d] text-stone-800 dark:text-[#f0f3f6] text-xs font-bold transition-colors"
                        >
                          <span>{t("profiles.switch")}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartRename(p)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        title={t("profiles.rename")}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateProfile(p.id)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        title={t("profiles.duplicate")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-stone-400 hover:text-red-500 transition-colors"
                          title={t("profiles.delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete Confirmation Banner */}
                  {isDeleting && (
                    <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs flex items-center justify-between gap-2">
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {t("profiles.confirmDeleteDesc", { name: p.name })}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 rounded text-xs text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-stone-200"
                        >
                          {t("actions.cancel")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProfile(p.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700"
                        >
                          {t("actions.delete")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
