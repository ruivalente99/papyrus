"use client";

import React from "react";
import type { LanguagesSection, LanguageItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface Props {
  section: LanguagesSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: LanguagesSection) => LanguagesSection) => void;
}

export function LanguagesForm({ section, lang, onChange }: Props) {
  const isPt = lang === "pt";

  const handleAddItem = () => {
    const newItem: LanguageItem = {
      id: `lang-${generateId()}`,
      name: { [lang]: "" },
      level: { [lang]: isPt ? "Intermédio" : "Intermediate" },
      cefr: "B2",
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [...sec.items, newItem],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<LanguageItem>) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => (it.id === itemId ? { ...it, ...updater } : it)),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.filter((it) => it.id !== itemId),
    }));
  };

  const handleToggleVisibility = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => (it.id === itemId ? { ...it, visible: !it.visible } : it)),
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-stone-400">
          {isPt ? `Idiomas & Proficiência (${section.items.length})` : `Languages & Proficiency (${section.items.length})`}
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
        >
          <Plus size={13} />
          <span>{isPt ? "+ Adicionar Língua" : "+ Add Language"}</span>
        </button>
      </div>

      <div className="space-y-3">
        {section.items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border transition-all ${
              item.visible
                ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-800 shadow-2xs"
                : "bg-stone-100/70 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800/60 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-stone-700 dark:text-stone-200 text-xs">
                {item.name?.[lang] || (isPt ? "Novo Idioma" : "New Language")}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item.id)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded"
                >
                  {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                  {isPt ? "Língua / Idioma" : "Language Name"} ({lang.toUpperCase()}) *
                </label>
                <input
                  type="text"
                  placeholder={isPt ? "Ex: Inglês, Francês" : "e.g. English, German"}
                  value={item.name?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      name: { ...item.name, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                  {isPt ? "Nível Descritivo" : "Proficiency"} ({lang.toUpperCase()})
                </label>
                <input
                  type="text"
                  placeholder={isPt ? "Ex: Língua materna, Fluente" : "e.g. Native, Fluent"}
                  value={item.level?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      level: { ...item.level, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                  {isPt ? "Quadro CEFR" : "CEFR Matrix"}
                </label>
                <select
                  value={item.cefr || "B2"}
                  onChange={(e) => handleUpdateItem(item.id, { cefr: e.target.value })}
                  className="w-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs"
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
