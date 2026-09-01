"use client";

import React, { useState } from "react";
import type {
  CVSection,
  SupportedLanguage,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
  CertificationsSection,
  HobbiesSection,
  CustomSection,
} from "@/types/cv";
import { t } from "@/lib/i18n";
import {
  ChevronDown,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages,
  Award,
  Heart,
  FileText,
} from "lucide-react";
import { ExperienceForm } from "./forms/ExperienceForm";
import { EducationForm } from "./forms/EducationForm";
import { SkillsForm } from "./forms/SkillsForm";
import { LanguagesForm } from "./forms/LanguagesForm";
import { CertificationsForm } from "./forms/CertificationsForm";
import { HobbiesForm } from "./forms/HobbiesForm";
import { CustomSectionForm } from "./forms/CustomSectionForm";

interface Props {
  section: CVSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  isFirst: boolean;
  isLast: boolean;
  isHighlighted?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onUpdate: (updater: (sec: CVSection) => CVSection) => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

function getSectionSummary(section: CVSection, lang: SupportedLanguage): string {
  const isPt = lang === "pt";
  switch (section.type) {
    case "experience": {
      const exp = section as ExperienceSection;
      const count = exp.items?.length || 0;
      return count === 1
        ? (isPt ? "1 cargo profissional" : "1 role")
        : `${count} ${isPt ? "cargos profissionais" : "roles"}`;
    }
    case "education": {
      const edu = section as EducationSection;
      const count = edu.items?.length || 0;
      return count === 1
        ? (isPt ? "1 formação académica" : "1 degree")
        : `${count} ${isPt ? "formações académicas" : "degrees"}`;
    }
    case "skills": {
      const sk = section as SkillsSection;
      const total = sk.categories?.reduce((acc, c) => acc + (c.skills?.length || 0), 0) || 0;
      return `${total} ${isPt ? "competências" : "skills"}`;
    }
    case "languages": {
      const lng = section as LanguagesSection;
      const count = lng.items?.length || 0;
      return count === 1
        ? (isPt ? "1 idioma" : "1 language")
        : `${count} ${isPt ? "idiomas" : "languages"}`;
    }
    case "certifications": {
      const cert = section as CertificationsSection;
      const count = cert.items?.length || 0;
      return count === 1
        ? (isPt ? "1 certificação" : "1 certification")
        : `${count} ${isPt ? "certificações" : "certifications"}`;
    }
    case "hobbies": {
      const hb = section as HobbiesSection;
      const count = hb.items?.length || 0;
      return count === 1
        ? (isPt ? "1 interesse" : "1 hobby")
        : `${count} ${isPt ? "interesses" : "hobbies"}`;
    }
    case "custom": {
      const cs = section as CustomSection;
      const count = cs.items?.length || 0;
      return `${count} ${count === 1 ? (isPt ? "item" : "item") : (isPt ? "itens" : "items")}`;
    }
    default:
      return "";
  }
}

export function SectionCard({
  section,
  lang,
  defaultLang,
  isFirst,
  isLast,
  isHighlighted,
  isExpanded: controlledExpanded,
  onToggleExpand,
  onUpdate,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  React.useEffect(() => {
    if (isHighlighted && controlledExpanded === undefined) {
      setInternalExpanded(true);
    }
  }, [isHighlighted, controlledExpanded]);

  const getSectionIcon = () => {
    switch (section.type) {
      case "experience":
        return <Briefcase size={16} className="text-amber-700 dark:text-amber-400" />;
      case "education":
        return <GraduationCap size={16} className="text-amber-700 dark:text-amber-400" />;
      case "skills":
        return <Sparkles size={16} className="text-amber-700 dark:text-amber-400" />;
      case "languages":
        return <Languages size={16} className="text-amber-700 dark:text-amber-400" />;
      case "certifications":
        return <Award size={16} className="text-amber-700 dark:text-amber-400" />;
      case "hobbies":
        return <Heart size={16} className="text-amber-700 dark:text-amber-400" />;
      case "custom":
      default:
        return <FileText size={16} className="text-amber-700 dark:text-amber-400" />;
    }
  };

  const sectionTitle = t(section.title, lang, defaultLang);

  return (
    <div
      id={`section-${section.id}`}
      className={`bg-white dark:bg-stone-900 rounded-2xl border transition-all duration-300 shadow-xs ${
        isHighlighted
          ? "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-stone-900 border-amber-500 dark:border-amber-500 shadow-md scale-[1.01]"
          : section.visible
          ? "border-stone-200 dark:border-stone-800"
          : "border-stone-200/60 dark:border-stone-800/60 bg-stone-50/70 dark:bg-stone-950/40 opacity-70"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between gap-2 select-none">
        <div
          onClick={handleToggle}
          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
            {getSectionIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2 truncate">
              <span className="truncate">{sectionTitle}</span>
              {!section.visible && (
                <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-1.5 py-0.5 rounded font-medium shrink-0">
                  {lang === "pt" ? "Oculta" : "Hidden"}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              {getSectionSummary(section, lang) || `${section.type} • #${section.order}`}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            title={lang === "pt" ? "Subir secção" : "Move up"}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            title={lang === "pt" ? "Descer secção" : "Move down"}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown size={14} />
          </button>

          <button
            type="button"
            onClick={onToggleVisibility}
            title={section.visible ? (lang === "pt" ? "Ocultar secção" : "Hide section") : (lang === "pt" ? "Mostrar secção" : "Show section")}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm(lang === "pt" ? "Eliminar esta secção permanentemente?" : "Permanently delete this section?")) {
                onDelete();
              }
            }}
            title={lang === "pt" ? "Eliminar secção" : "Delete section"}
            className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Trash2 size={14} />
          </button>

          <button
            type="button"
            onClick={handleToggle}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 ml-1"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded form content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-stone-100 dark:border-stone-800">
          {/* Custom Section Title Input */}
          <div className="mb-4 pt-2">
            <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 font-mono uppercase tracking-wider">
              {lang === "pt" ? "Título da Secção" : "Section Title"} ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={section.title?.[lang] || ""}
              onChange={(e) =>
                onUpdate((sec) => ({
                  ...sec,
                  title: { ...sec.title, [lang]: e.target.value },
                }))
              }
              placeholder="e.g. Work Experience / Experiência Profissional"
              className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-full px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Section Type Specific Forms */}
          {section.type === "experience" && (
            <ExperienceForm
              section={section}
              lang={lang}
              defaultLang={defaultLang}
              onChange={onUpdate as any}
            />
          )}

          {section.type === "education" && (
            <EducationForm
              section={section}
              lang={lang}
              defaultLang={defaultLang}
              onChange={onUpdate as any}
            />
          )}

          {section.type === "skills" && (
            <SkillsForm
              section={section}
              lang={lang}
              defaultLang={defaultLang}
              onChange={onUpdate as any}
            />
          )}

          {section.type === "languages" && (
            <LanguagesForm
              section={section}
              lang={lang}
              defaultLang={defaultLang}
              onChange={onUpdate as any}
            />
          )}

          {section.type === "certifications" && (
            <CertificationsForm
              section={section}
              lang={lang}
              defaultLang={defaultLang}
              onChange={onUpdate as any}
            />
          )}

          {section.type === "hobbies" && (
            <HobbiesForm
              section={section}
              lang={lang}
              defaultLang={defaultLang}
              onChange={onUpdate as any}
            />
          )}

          {section.type === "custom" && (
            <CustomSectionForm
              section={section}
              lang={lang}
              defaultLang={defaultLang}
              onChange={onUpdate as any}
            />
          )}
        </div>
      )}
    </div>
  );
}
