"use client";

import React from "react";
import type { CertificationsSection, CertificationItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface Props {
  section: CertificationsSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: CertificationsSection) => CertificationsSection) => void;
}

export function CertificationsForm({ section, lang, onChange }: Props) {
  const { t: tr } = useTranslation();

  const handleAddItem = () => {
    const newItem: CertificationItem = {
      id: `cert-${generateId()}`,
      name: { [lang]: "" },
      issuer: "",
      date: "",
      url: "",
      notes: { [lang]: "" },
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [...(sec.items || []), newItem],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<CertificationItem>) => {
    onChange((sec) => ({
      ...sec,
      items: (sec.items || []).map((it) => (it.id === itemId ? { ...it, ...updater } : it)),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: (sec.items || []).filter((it) => it.id !== itemId),
    }));
  };

  const handleToggleVisibility = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: (sec.items || []).map((it) => (it.id === itemId ? { ...it, visible: !it.visible } : it)),
    }));
  };

  const items = Array.isArray(section.items) ? section.items : [];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center pb-1 border-b border-stone-200 dark:border-[#30363d]">
        <span className="font-semibold text-stone-600 dark:text-[#c9d1d9]">
          {tr("builder.forms.certifications.title")} ({items.length})
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>+ {tr("builder.forms.certifications.addCertification")}</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition-all ${
              item.visible
                ? "bg-white dark:bg-[#161b22] border-stone-300 dark:border-[#30363d] shadow-2xs"
                : "bg-stone-100/70 dark:bg-[#161b22]/40 border-stone-200 dark:border-[#30363d]/60 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-[#30363d]">
              <span className="font-bold text-stone-800 dark:text-[#f0f3f6] text-xs">
                {item.name?.[lang] || item.issuer || tr("builder.forms.certifications.newCertification")}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item.id)}
                  title={item.visible ? tr("common.actions.hideFromCV") : tr("common.actions.showOnCV")}
                  aria-label={item.visible ? tr("a11y.forms.hideCertification") : tr("a11y.forms.showCertification")}
                  className="text-stone-500 dark:text-[#8b949e] hover:text-stone-700 dark:hover:text-[#f0f3f6] p-1 rounded hover:bg-stone-100 dark:hover:bg-[#21262d] min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title={tr("common.actions.remove")}
                  aria-label={tr("a11y.forms.deleteCertification")}
                  className="text-stone-500 dark:text-[#8b949e] hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor={`cert-name-${item.id}`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.certifications.name")} ({lang.toUpperCase()}) *
                  </label>
                  <input
                    id={`cert-name-${item.id}`}
                    type="text"
                    placeholder={tr("builder.forms.certifications.namePlaceholder")}
                    value={item.name?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        name: { ...item.name, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor={`cert-issuer-${item.id}`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.certifications.issuer")} *
                  </label>
                  <input
                    id={`cert-issuer-${item.id}`}
                    type="text"
                    placeholder={tr("builder.forms.certifications.issuerPlaceholder")}
                    value={item.issuer}
                    onChange={(e) => handleUpdateItem(item.id, { issuer: e.target.value })}
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label htmlFor={`cert-date-${item.id}`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.certifications.date")}
                  </label>
                  <input
                    id={`cert-date-${item.id}`}
                    type="text"
                    placeholder="2024"
                    value={item.date || ""}
                    onChange={(e) => handleUpdateItem(item.id, { date: e.target.value })}
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor={`cert-url-${item.id}`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.certifications.url")}
                  </label>
                  <input
                    id={`cert-url-${item.id}`}
                    type="url"
                    placeholder="https://credly.com/your-badge"
                    value={item.url || ""}
                    onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`cert-notes-${item.id}`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                  {tr("builder.forms.certifications.notes")}
                </label>
                <input
                  id={`cert-notes-${item.id}`}
                  type="text"
                  placeholder={tr("builder.forms.certifications.notesPlaceholder")}
                  value={item.notes?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      notes: { ...item.notes, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
