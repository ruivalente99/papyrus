"use client";

import React, { useState } from "react";
import type {
  CVDocument,
  SupportedLanguage,
  PersonalInfo,
  CVSection,
  SectionType,
} from "@/types/cv";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { SectionCard } from "./SectionCard";
import { tUI } from "@/lib/i18n";
import {
  User,
  Plus,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages,
  Award,
  Heart,
  FileText,
  ChevronDown,
} from "lucide-react";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
  onUpdatePersonalInfo: (updater: Partial<PersonalInfo> | ((prev: PersonalInfo) => PersonalInfo)) => void;
  onUpdateSection: (sectionId: string, updater: (sec: CVSection) => CVSection) => void;
  onToggleSectionVisibility: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onDeleteSection: (sectionId: string) => void;
  onAddSection: (type: SectionType, customTitle?: string) => void;
}

export function SectionList({
  cv,
  lang,
  onUpdatePersonalInfo,
  onUpdateSection,
  onToggleSectionVisibility,
  onMoveSection,
  onDeleteSection,
  onAddSection,
}: Props) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(true);

  const availableSectionTypes: Array<{ type: SectionType; labelKey: any; icon: any }> = [
    { type: "experience", labelKey: "experience", icon: Briefcase },
    { type: "education", labelKey: "education", icon: GraduationCap },
    { type: "skills", labelKey: "skills", icon: Sparkles },
    { type: "languages", labelKey: "languages", icon: Languages },
    { type: "certifications", labelKey: "certifications", icon: Award },
    { type: "hobbies", labelKey: "hobbies", icon: Heart },
    { type: "custom", labelKey: "custom", icon: FileText },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Personal Info Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
        <div
          onClick={() => setIsPersonalExpanded(!isPersonalExpanded)}
          className="p-4 flex items-center justify-between gap-2 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <User size={16} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {tUI("personalInfo", lang)}
              </h3>
              <p className="text-[11px] text-stone-400">
                {cv.personalInfo.fullName || (lang === "pt" ? "Sem nome definido" : "No name defined")}
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-stone-400 transition-transform ${
              isPersonalExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {isPersonalExpanded && (
          <div className="px-5 pb-5 pt-1 border-t border-stone-100 dark:border-stone-800">
            <PersonalInfoForm
              data={cv.personalInfo}
              lang={lang}
              defaultLang={cv.defaultLanguage}
              onChange={onUpdatePersonalInfo}
            />
          </div>
        )}
      </div>

      {/* 2. Reorderable Dynamic Sections */}
      {cv.sections.map((section, idx) => (
        <SectionCard
          key={section.id}
          section={section}
          lang={lang}
          defaultLang={cv.defaultLanguage}
          isFirst={idx === 0}
          isLast={idx === cv.sections.length - 1}
          onUpdate={(updater) => onUpdateSection(section.id, updater)}
          onToggleVisibility={() => onToggleSectionVisibility(section.id)}
          onMoveUp={() => onMoveSection(section.id, "up")}
          onMoveDown={() => onMoveSection(section.id, "down")}
          onDelete={() => onDeleteSection(section.id)}
        />
      ))}

      {/* 3. Add New Section Button / Menu */}
      <div className="relative pt-2">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-3 px-4 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-700 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 rounded-2xl text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <Plus size={15} />
          <span>{tUI("addSection", lang)}</span>
        </button>

        {showAddMenu && (
          <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-2 z-40 animate-in fade-in duration-100 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {availableSectionTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    onAddSection(item.type);
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  <div className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-800 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Icon size={13} />
                  </div>
                  <span>{tUI(item.labelKey, lang)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
