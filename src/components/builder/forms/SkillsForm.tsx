"use client";

import React, { useState } from "react";
import type { SkillsSection, SkillCategory, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, X, Eye, EyeOff } from "lucide-react";

interface Props {
  section: SkillsSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: SkillsSection) => SkillsSection) => void;
}

export function SkillsForm({ section, lang, defaultLang, onChange }: Props) {
  const [newSkillInput, setNewSkillInput] = useState<{ [catId: string]: string }>({});
  const isPt = lang === "pt";

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: `cat-${generateId()}`,
      name: { [lang]: isPt ? "Nova Categoria" : "New Skill Category" },
      skills: [],
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      categories: [...sec.categories, newCat],
    }));
  };

  const handleUpdateCategoryName = (catId: string, nameVal: string) => {
    onChange((sec) => ({
      ...sec,
      categories: sec.categories.map((c) =>
        c.id === catId ? { ...c, name: { ...c.name, [lang]: nameVal } } : c
      ),
    }));
  };

  const handleDeleteCategory = (catId: string) => {
    onChange((sec) => ({
      ...sec,
      categories: sec.categories.filter((c) => c.id !== catId),
    }));
  };

  const handleToggleCategory = (catId: string) => {
    onChange((sec) => ({
      ...sec,
      categories: sec.categories.map((c) =>
        c.id === catId ? { ...c, visible: !c.visible } : c
      ),
    }));
  };

  const handleAddSkillTag = (catId: string) => {
    const val = (newSkillInput[catId] || "").trim();
    if (!val) return;

    onChange((sec) => ({
      ...sec,
      categories: sec.categories.map((c) => {
        if (c.id !== catId) return c;
        if (c.skills.includes(val)) return c;
        return {
          ...c,
          skills: [...c.skills, val],
        };
      }),
    }));

    setNewSkillInput((prev) => ({ ...prev, [catId]: "" }));
  };

  const handleRemoveSkillTag = (catId: string, skillIdx: number) => {
    onChange((sec) => ({
      ...sec,
      categories: sec.categories.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          skills: c.skills.filter((_, idx) => idx !== skillIdx),
        };
      }),
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-stone-400">
          {isPt ? `Categorias de Competências (${section.categories.length})` : `Skill Groups (${section.categories.length})`}
        </span>
        <button
          type="button"
          onClick={handleAddCategory}
          className="flex items-center gap-1 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
        >
          <Plus size={13} />
          <span>{isPt ? "+ Nova Categoria" : "+ Add Category"}</span>
        </button>
      </div>

      <div className="space-y-3">
        {section.categories.map((cat) => (
          <div
            key={cat.id}
            className={`p-3 rounded-xl border transition-all ${
              cat.visible
                ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-800 shadow-2xs"
                : "bg-stone-100/70 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800/60 opacity-60"
            }`}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
              <input
                type="text"
                value={cat.name?.[lang] || cat.name?.[defaultLang] || ""}
                onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                placeholder={isPt ? "Nome da Categoria (ex: Backend, Design)" : "Category Name (e.g. Backend, Design)"}
                className="font-bold text-stone-800 dark:text-stone-100 text-xs border-b border-dashed border-stone-300 dark:border-stone-700 bg-transparent px-1 py-0.5 focus:border-amber-500 focus:outline-hidden flex-1"
              />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleCategory(cat.id)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded"
                >
                  {cat.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Skills Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[28px] items-center">
              {cat.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-md text-[11px] font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillTag(cat.id, sIdx)}
                    className="text-amber-700 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400 p-0.5 rounded-full"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {cat.skills.length === 0 && (
                <span className="text-[11px] text-stone-400 italic">
                  {isPt ? "Nenhuma competência adicionada" : "No skills added"}
                </span>
              )}
            </div>

            {/* Add Skill Tag Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder={isPt ? "Adicionar competência (ex: Next.js, Figma, SQL)..." : "Add skill (e.g. Next.js, Figma, SQL)..."}
                value={newSkillInput[cat.id] || ""}
                onChange={(e) =>
                  setNewSkillInput((prev) => ({ ...prev, [cat.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkillTag(cat.id);
                  }
                }}
                className="flex-1 border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkillTag(cat.id)}
                className="bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white px-2.5 py-1 rounded text-xs font-semibold"
              >
                {isPt ? "Adicionar" : "Add"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
