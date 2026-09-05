"use client";

import React from "react";
import type { CustomSection, CustomSectionItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface Props {
  section: CustomSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: CustomSection) => CustomSection) => void;
}

export function CustomSectionForm({ section, lang, onChange }: Props) {
  const { t: tr } = useTranslation();

  const handleAddItem = () => {
    const newItem: CustomSectionItem = {
      id: `custom-${generateId()}`,
      title: { [lang]: "" },
      subtitle: { [lang]: "" },
      date: "",
      url: "",
      description: { [lang]: "" },
      notes: { [lang]: "" },
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [...(sec.items || []), newItem],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<CustomSectionItem>) => {
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
          {tr("builder.forms.custom.title")} ({items.length})
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>+ {tr("builder.forms.custom.addItem")}</span>
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
                {item.title?.[lang] || tr("builder.forms.custom.newItem")}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item.id)}
                  title={item.visible ? tr("common.actions.hideFromCV") : tr("common.actions.showOnCV")}
                  aria-label={item.visible ? tr("a11y.forms.hideItem") : tr("a11y.forms.showItem")}
                  className="text-stone-500 dark:text-[#8b949e] hover:text-stone-700 dark:hover:text-[#f0f3f6] p-1 rounded hover:bg-stone-100 dark:hover:bg-[#21262d] min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title={tr("common.actions.remove")}
                  aria-label={tr("a11y.forms.deleteItem")}
                  className="text-stone-500 dark:text-[#8b949e] hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.custom.itemTitle")} ({lang.toUpperCase()}) *
                  </label>
                  <input
                    type="text"
                    placeholder={tr("builder.forms.custom.itemTitlePlaceholder")}
                    value={item.title?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        title: { ...item.title, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.custom.date")}
                  </label>
                  <input
                    type="text"
                    placeholder="2025"
                    value={item.date || ""}
                    onChange={(e) => handleUpdateItem(item.id, { date: e.target.value })}
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.custom.subtitle")} ({lang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    placeholder={tr("builder.forms.custom.subtitlePlaceholder")}
                    value={item.subtitle?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        subtitle: { ...item.subtitle, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.custom.url")}
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={item.url || ""}
                    onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                  {tr("builder.forms.custom.description")} ({lang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  placeholder={tr("builder.forms.custom.descriptionPlaceholder")}
                  value={item.description?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      description: { ...item.description, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded p-1.5 text-xs focus:ring-1 focus:ring-amber-500 resize-y"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
