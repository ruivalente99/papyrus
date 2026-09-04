"use client";

import React from "react";
import type { LanguagesSection, LanguageItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface Props {
  section: LanguagesSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: LanguagesSection) => LanguagesSection) => void;
}

export function LanguagesForm({ section, lang, onChange }: Props) {
  const { t: tr } = useTranslation(lang);

  const handleAddItem = () => {
    const newItem: LanguageItem = {
      id: `lang-${generateId()}`,
      name: { [lang]: "" },
      level: { [lang]: tr("builder.forms.languages.levelIntermediate") },
      cefr: "B2",
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [...(sec.items || []), newItem],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<LanguageItem>) => {
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
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-[#c9d1d9]">
          {tr("builder.forms.languages.title")} ({items.length})
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>+ {tr("builder.forms.languages.addLanguage")}</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border transition-all ${
              item.visible
                ? "bg-white dark:bg-[#161b22] border-stone-300 dark:border-[#30363d] shadow-2xs"
                : "bg-stone-100/70 dark:bg-[#161b22]/40 border-stone-200 dark:border-[#30363d]/60 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-[#30363d]">
              <span className="font-bold text-stone-700 dark:text-[#f0f3f6] text-xs">
                {item.name?.[lang] || tr("builder.forms.languages.newLanguage")}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item.id)}
                  title={item.visible ? tr("common.actions.hideFromCV") : tr("common.actions.showOnCV")}
                  aria-label={item.visible ? tr("a11y.forms.hideLanguage") : tr("a11y.forms.showLanguage")}
                  className="text-stone-500 dark:text-[#8b949e] hover:text-stone-700 dark:hover:text-[#f0f3f6] p-1 rounded min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title={tr("common.actions.remove")}
                  aria-label={tr("a11y.forms.deleteLanguage")}
                  className="text-stone-500 dark:text-[#8b949e] hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                  {tr("builder.forms.languages.name")} ({lang.toUpperCase()}) *
                </label>
                <input
                  type="text"
                  placeholder={tr("builder.forms.languages.namePlaceholder")}
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
                <label className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                  {tr("builder.forms.languages.level")} ({lang.toUpperCase()})
                </label>
                <input
                  type="text"
                  placeholder={tr("builder.forms.languages.levelPlaceholder")}
                  value={item.level?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      level: { ...item.level, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor={`cefr-select-${item.id}`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                  {tr("builder.forms.languages.cefr")}
                </label>
                <select
                  id={`cefr-select-${item.id}`}
                  aria-label={tr("a11y.forms.cefrSelect")}
                  value={item.cefr || "B2"}
                  onChange={(e) => handleUpdateItem(item.id, { cefr: e.target.value })}
                  className="w-full border border-stone-300 dark:border-[#363d47] bg-white dark:bg-[#0d1117] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs"
                >
                  <option value="C2 (Materno)">C2 (Native)</option>
                  <option value="C2">C2 (Proficient)</option>
                  <option value="C1">C1 (Advanced)</option>
                  <option value="B2">B2 (Upper Intermediate)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="A2">A2 (Elementary)</option>
                  <option value="A1">A1 (Beginner)</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
