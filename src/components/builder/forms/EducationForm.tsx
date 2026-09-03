"use client";

import React from "react";
import type { EducationSection, EducationItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface Props {
  section: EducationSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: EducationSection) => EducationSection) => void;
}

export function EducationForm({ section, lang, onChange }: Props) {
  const isPt = lang === "pt";
  const { t: tr } = useTranslation(lang);

  const handleAddItem = () => {
    const newItem: EducationItem = {
      id: `edu-${generateId()}`,
      degree: { [lang]: "" },
      institution: "",
      location: { [lang]: "" },
      startDate: "",
      endDate: "",
      isCurrent: false,
      url: "",
      details: { [lang]: "" },
      notes: { [lang]: "" },
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [newItem, ...(sec.items || [])],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<EducationItem>) => {
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

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-stone-400">
          {tr("builder.forms.education.title")} ({section.items.length})
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>+ {tr("builder.forms.education.addEducation")}</span>
        </button>
      </div>

      <div className="space-y-3">
        {(section.items || []).map((item, index) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition-all ${
              item.visible
                ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-800 shadow-2xs"
                : "bg-stone-100/70 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800/60 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-stone-700 dark:text-stone-200 text-xs">
                #{index + 1} {item.degree?.[lang] || item.institution || tr("builder.forms.education.newDegree")}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item.id)}
                  title={item.visible ? tr("common.actions.hideFromCV") : tr("common.actions.showOnCV")}
                  aria-label={item.visible ? tr("a11y.forms.hideEducation") : tr("a11y.forms.showEducation")}
                  className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title={tr("common.actions.remove")}
                  aria-label={tr("a11y.forms.deleteEducation")}
                  className="text-stone-500 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {tr("builder.forms.education.degree")} ({lang.toUpperCase()}) *
                  </label>
                  <input
                    type="text"
                    placeholder={tr("builder.forms.education.degreePlaceholder")}
                    value={item.degree?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        degree: { ...item.degree, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {tr("builder.forms.education.institution")} *
                  </label>
                  <input
                    type="text"
                    placeholder={tr("builder.forms.education.institutionPlaceholder")}
                    value={item.institution}
                    onChange={(e) => handleUpdateItem(item.id, { institution: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {tr("builder.forms.education.location")} ({lang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    placeholder={tr("builder.forms.education.locationPlaceholder")}
                    value={item.location?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        location: { ...item.location, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {tr("builder.forms.education.startDate")} (YYYY)
                  </label>
                  <input
                    type="text"
                    placeholder="2018"
                    value={item.startDate}
                    onChange={(e) => handleUpdateItem(item.id, { startDate: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="font-medium text-stone-600 dark:text-stone-400">
                      {tr("builder.forms.education.endDate")}
                    </label>
                    <label className="flex items-center gap-1 text-[10.5px] text-amber-700 dark:text-amber-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isCurrent}
                        onChange={(e) =>
                          handleUpdateItem(item.id, {
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? "" : item.endDate,
                          })
                        }
                        className="rounded text-amber-700"
                      />
                      <span>{tr("builder.forms.education.current")}</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder={item.isCurrent ? (isPt ? "Presente" : "Present") : "2022"}
                    disabled={item.isCurrent}
                    value={item.endDate || ""}
                    onChange={(e) => handleUpdateItem(item.id, { endDate: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {tr("builder.forms.education.url")}
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={item.url || ""}
                    onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {tr("builder.forms.education.qeq")}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nível no QEQ: 6"
                    value={item.qeq || ""}
                    onChange={(e) => handleUpdateItem(item.id, { qeq: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                  {tr("builder.forms.education.details")} ({lang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  placeholder={tr("builder.forms.education.detailsPlaceholder")}
                  value={item.details?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      details: { ...item.details, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded p-1.5 text-xs focus:ring-1 focus:ring-amber-500 resize-y"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
