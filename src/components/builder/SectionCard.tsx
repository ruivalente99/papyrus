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
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/context/ToastContext";
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

function getSectionSummary(section: CVSection, tr: (key: string, params?: any) => string): string {
  switch (section.type) {
    case "experience": {
      const exp = section as ExperienceSection;
      const count = exp.items?.length || 0;
      return count === 1
        ? tr("builder.sections.summaries.role_one")
        : tr("builder.sections.summaries.role_other", { count });
    }
    case "education": {
      const edu = section as EducationSection;
      const count = edu.items?.length || 0;
      return count === 1
        ? tr("builder.sections.summaries.degree_one")
        : tr("builder.sections.summaries.degree_other", { count });
    }
    case "skills": {
      const sk = section as SkillsSection;
      const total = sk.categories?.reduce((acc, c) => acc + (c.skills?.length || 0), 0) || 0;
      return tr("builder.sections.summaries.skill", { count: total });
    }
    case "languages": {
      const lng = section as LanguagesSection;
      const count = lng.items?.length || 0;
      return count === 1
        ? tr("builder.sections.summaries.language_one")
        : tr("builder.sections.summaries.language_other", { count });
    }
    case "certifications": {
      const cert = section as CertificationsSection;
      const count = cert.items?.length || 0;
      return count === 1
        ? tr("builder.sections.summaries.certification_one")
        : tr("builder.sections.summaries.certification_other", { count });
    }
    case "hobbies": {
      const hb = section as HobbiesSection;
      const count = hb.items?.length || 0;
      return count === 1
        ? tr("builder.sections.summaries.hobby_one")
        : tr("builder.sections.summaries.hobby_other", { count });
    }
    case "custom": {
      const cs = section as CustomSection;
      const count = cs.items?.length || 0;
      return count === 1
        ? tr("builder.sections.summaries.item_one")
        : tr("builder.sections.summaries.item_other", { count });
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

  const { t: tr } = useTranslation();
  const { confirmAction } = useToast();

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
      tabIndex={-1}
      data-testid={`section-card-${section.id}`}
      className={`bg-white dark:bg-[#21262d] dark-elevation-card rounded-2xl border transition-all duration-300 shadow-xs outline-none ${
        isHighlighted
          ? "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-[#161b22] border-amber-500 dark:border-amber-500 shadow-md scale-[1.01] bg-amber-50/10 dark:bg-amber-950/20"
          : isExpanded
          ? "border-stone-300 dark:border-[#484f58] shadow-xs"
          : "border-stone-200/90 dark:border-[#363d47] hover:border-stone-300 dark:hover:border-[#484f58]"
      } ${
        section.visible
          ? ""
          : "border-stone-200/60 dark:border-[#30363d] bg-stone-50/70 dark:bg-[#161b22]/70 opacity-70"
      }`}
    >
      {/* Header bar (Click to toggle expand) */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 select-none">
        <div
          onClick={handleToggle}
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#161b22] dark:border dark:border-[#30363d] flex items-center justify-center shrink-0">
            {getSectionIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-stone-900 dark:text-[#f0f3f6] text-sm flex items-center gap-2 truncate">
              <span className="truncate">{sectionTitle}</span>
              {!section.visible && (
                <span className="text-[10px] bg-stone-200 dark:bg-[#161b22] dark:border dark:border-[#363d47] text-stone-600 dark:text-[#8b949e] px-1.5 py-0.5 rounded font-medium shrink-0">
                  {tr("common.actions.hide")}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-[#8b949e] truncate">
              {getSectionSummary(section, tr) || `${section.type} • #${section.order}`}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            title={tr("common.actions.moveUp")}
            aria-label={tr("a11y.sectionCard.moveUp", { name: sectionTitle })}
            className="text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6] p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            title={tr("common.actions.moveDown")}
            aria-label={tr("a11y.sectionCard.moveDown", { name: sectionTitle })}
            className="text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6] p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <ArrowDown size={14} />
          </button>

          <button
            type="button"
            onClick={onToggleVisibility}
            title={section.visible ? tr("common.actions.hideFromCV") : tr("common.actions.showOnCV")}
            aria-label={section.visible ? tr("a11y.sectionCard.hide", { name: sectionTitle }) : tr("a11y.sectionCard.show", { name: sectionTitle })}
            className="text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6] p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#30363d] min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          <button
            type="button"
            onClick={async () => {
              const ok = await confirmAction({
                title: tr("common.actions.delete"),
                message: tr("builder.sections.confirmDelete"),
                confirmText: tr("common.actions.delete"),
                danger: true,
              });
              if (ok) {
                onDelete();
              }
            }}
            title={tr("common.actions.delete")}
            aria-label={tr("a11y.sectionCard.delete", { name: sectionTitle })}
            className="text-stone-500 dark:text-[#8b949e] hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-red-950/40 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <Trash2 size={14} />
          </button>

          <button
            type="button"
            onClick={handleToggle}
            title={isExpanded ? tr("common.actions.collapse") : tr("common.actions.expand")}
            aria-label={isExpanded ? tr("a11y.sectionCard.collapse", { name: sectionTitle }) : tr("a11y.sectionCard.expand", { name: sectionTitle })}
            aria-expanded={isExpanded}
            className="text-stone-500 dark:text-[#8b949e] hover:text-stone-800 dark:hover:text-[#f0f3f6] p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#30363d] ml-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
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
        <div className="px-5 pb-5 pt-1 border-t border-stone-100 dark:border-[#30363d]">
          {/* Custom Section Title Input */}
          <div className="mb-4 pt-2">
            <label className="block text-[11px] font-bold text-stone-500 dark:text-[#8b949e] mb-1 font-mono uppercase tracking-wider">
              {tr("builder.sections.titleField")} ({lang.toUpperCase()})
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
              className="w-full border border-stone-300 dark:border-[#363d47] bg-white dark:bg-[#0d1117] text-stone-900 dark:text-[#f0f3f6] dark:placeholder-[#6e7681] rounded-full px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
