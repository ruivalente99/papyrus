"use client";

import React, { useState } from "react";
import type { SkillsSection, SkillCategory, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Trash2, X, Eye, EyeOff } from "lucide-react";

interface Props {
  section: SkillsSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: SkillsSection) => SkillsSection) => void;
}

export function SkillsForm({ section, lang, defaultLang, onChange }: Props) {
  const [newSkillInput, setNewSkillInput] = useState<{ [catId: string]: string }>({});
  const { t: tr } = useTranslation(lang);

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: `cat-${generateId()}`,
      name: { [lang]: tr("builder.forms.skills.newCategory") },
      skills: [],
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      categories: [...(sec.categories || []), newCat],
    }));
  };

  const handleUpdateCategoryName = (catId: string, nameVal: string) => {
    onChange((sec) => ({
      ...sec,
      categories: (sec.categories || []).map((c) =>
        c.id === catId
          ? {
              ...c,
              name: {
                ...(typeof c.name === "object" ? c.name : {}),
                [lang]: nameVal,
              },
            }
          : c
      ),
    }));
  };

  const handleDeleteCategory = (catId: string) => {
    onChange((sec) => ({
      ...sec,
      categories: (sec.categories || []).filter((c) => c.id !== catId),
    }));
  };

  const handleToggleCategory = (catId: string) => {
    onChange((sec) => ({
      ...sec,
      categories: (sec.categories || []).map((c) =>
        c.id === catId ? { ...c, visible: !c.visible } : c
      ),
    }));
  };

  const handleAddSkillTag = (catId: string) => {
    const val = (newSkillInput[catId] || "").trim();
    if (!val) return;

    onChange((sec) => ({
      ...sec,
      categories: (sec.categories || []).map((c) => {
        if (c.id !== catId) return c;
        const currentSkills = Array.isArray(c.skills) ? c.skills : [];
        if (currentSkills.includes(val)) return c;
        return {
          ...c,
          skills: [...currentSkills, val],
        };
      }),
    }));

    setNewSkillInput((prev) => ({ ...prev, [catId]: "" }));
  };

  const handleRemoveSkillTag = (catId: string, skillIdx: number) => {
    onChange((sec) => ({
      ...sec,
      categories: (sec.categories || []).map((c) => {
        if (c.id !== catId) return c;
        const currentSkills = Array.isArray(c.skills) ? c.skills : [];
        return {
          ...c,
          skills: currentSkills.filter((_, idx) => idx !== skillIdx),
        };
      }),
    }));
  };

  const categories = Array.isArray(section.categories) ? section.categories : [];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-[#c9d1d9]">
          {tr("builder.forms.skills.title")} ({categories.length})
        </span>
        <button
          type="button"
          onClick={handleAddCategory}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>+ {tr("builder.forms.skills.addCategory")}</span>
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`p-3 rounded-xl border transition-all ${
              cat.visible
                ? "bg-white dark:bg-[#161b22] border-stone-300 dark:border-[#30363d] shadow-2xs"
                : "bg-stone-100/70 dark:bg-[#161b22]/40 border-stone-200 dark:border-[#30363d]/60 opacity-60"
            }`}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-[#30363d]">
              <input
                type="text"
                value={cat.name?.[lang] || cat.name?.[defaultLang] || ""}
                onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                aria-label={tr("builder.forms.skills.categoryPlaceholder")}
                placeholder={tr("builder.forms.skills.categoryPlaceholder")}
                className="font-bold text-stone-800 dark:text-[#f0f3f6] text-xs border-b border-dashed border-stone-300 dark:border-[#363d47] bg-transparent px-1 py-0.5 focus:border-amber-500 focus:outline-hidden flex-1 min-w-0"
              />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleCategory(cat.id)}
                  title={cat.visible ? tr("common.actions.hideFromCV") : tr("common.actions.showOnCV")}
                  aria-label={cat.visible ? tr("a11y.forms.hideCategory") : tr("a11y.forms.showCategory")}
                  className="text-stone-500 dark:text-[#8b949e] hover:text-stone-700 dark:hover:text-[#f0f3f6] p-1 rounded min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  {cat.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  title={tr("common.actions.remove")}
                  aria-label={tr("a11y.forms.deleteCategory")}
                  className="text-stone-500 dark:text-[#8b949e] hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 min-w-[24px] min-h-[24px] flex items-center justify-center"
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
                  className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-md text-[11px] font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillTag(cat.id, sIdx)}
                    title={tr("a11y.forms.deleteSkill", { skill })}
                    aria-label={tr("a11y.forms.deleteSkill", { skill })}
                    className="text-amber-700 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full min-w-[24px] min-h-[24px] flex items-center justify-center"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {cat.skills.length === 0 && (
                <span className="text-[11px] text-stone-400 dark:text-[#8b949e] italic">
                  {tr("builder.forms.skills.noSkills")}
                </span>
              )}
            </div>

            {/* Add Skill Tag Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                aria-label={tr("builder.forms.skills.skillPlaceholder")}
                placeholder={tr("builder.forms.skills.skillPlaceholder")}
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
                className="flex-1 min-w-0 border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkillTag(cat.id)}
                className="bg-stone-800 dark:bg-[#21262d] dark:border dark:border-[#363d47] hover:bg-stone-900 dark:hover:bg-[#30363d] text-white dark:text-[#f0f3f6] px-2.5 py-1 rounded text-xs font-semibold shadow-2xs"
              >
                {tr("builder.forms.skills.addSkill")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
