"use client";

import React, { useState } from "react";
import type {
  CVDocument,
  SupportedLanguage,
  PersonalInfo,
  CVSection,
  SectionType,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
} from "@/types/cv";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { SectionCard } from "./SectionCard";
import { AddSectionModal } from "./AddSectionModal";
import { t, tUI } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";
import {
  User,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages,
  Award,
  Heart,
  FileText,
} from "lucide-react";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
  highlightedSectionId?: string | null;
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
  highlightedSectionId,
  onUpdatePersonalInfo,
  onUpdateSection,
  onToggleSectionVisibility,
  onMoveSection,
  onDeleteSection,
  onAddSection,
}: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
  });

  const { t: tr } = useTranslation();

  // Auto-expand when highlighted from preview click
  React.useEffect(() => {
    if (highlightedSectionId) {
      setExpandedSections((prev) => ({
        ...prev,
        [highlightedSectionId]: true,
      }));
    }
  }, [highlightedSectionId]);

  const isPersonalExpanded = expandedSections["personal"] !== false;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const areAllExpanded =
    isPersonalExpanded &&
    cv.sections.every((sec) => expandedSections[sec.id] !== false);

  const toggleExpandAll = () => {
    const nextState = !areAllExpanded;
    const updated: Record<string, boolean> = { personal: nextState };
    cv.sections.forEach((sec) => {
      updated[sec.id] = nextState;
    });
    setExpandedSections(updated);
  };

  const handleJumpTo = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: true,
    }));

    const scrollToAndFocus = () => {
      const targetId = id === "personal" ? "section-personal" : `section-${id}`;
      const element = document.getElementById(targetId);
      const container = document.querySelector(".builder-form-pane");

      if (element) {
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const elemRect = element.getBoundingClientRect();
          const currentScroll = container.scrollTop;
          const targetScroll = currentScroll + (elemRect.top - containerRect.top) - 16;
          container.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: "smooth",
          });
        } else {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        element.focus?.({ preventScroll: true });
        const focusable = element.querySelector<HTMLElement>(
          "input:not([disabled]):not([type='hidden']):not([type='file']), textarea:not([disabled])"
        );
        if (focusable) {
          focusable.focus?.({ preventScroll: true });
        }
      }
    };

    setTimeout(scrollToAndFocus, 50);
    setTimeout(scrollToAndFocus, 180);
  };

  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case "experience":
        return <Briefcase size={13} className="text-amber-700 dark:text-amber-400 shrink-0" />;
      case "education":
        return <GraduationCap size={13} className="text-amber-700 dark:text-amber-400 shrink-0" />;
      case "skills":
        return <Sparkles size={13} className="text-amber-700 dark:text-amber-400 shrink-0" />;
      case "languages":
        return <Languages size={13} className="text-amber-700 dark:text-amber-400 shrink-0" />;
      case "certifications":
        return <Award size={13} className="text-amber-700 dark:text-amber-400 shrink-0" />;
      case "hobbies":
        return <Heart size={13} className="text-amber-700 dark:text-amber-400 shrink-0" />;
      case "custom":
      default:
        return <FileText size={13} className="text-amber-700 dark:text-amber-400 shrink-0" />;
    }
  };

  const getSectionCount = (section: CVSection) => {
    switch (section.type) {
      case "experience":
        return (section as ExperienceSection).items?.length || 0;
      case "education":
        return (section as EducationSection).items?.length || 0;
      case "skills":
        return (section as SkillsSection).categories?.reduce((acc, c) => acc + (c.skills?.length || 0), 0) || 0;
      case "languages":
        return (section as LanguagesSection).items?.length || 0;
      default:
        return (section as any).items?.length || 0;
    }
  };

  const pillsRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isWrapMode, setIsWrapMode] = useState(false);

  const checkScroll = React.useCallback(() => {
    const el = pillsRef.current;
    if (!el || isWrapMode) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, [isWrapMode]);

  React.useEffect(() => {
    checkScroll();
    const el = pillsRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, cv.sections]);

  const scrollPills = (direction: "left" | "right") => {
    const el = pillsRef.current;
    if (!el) return;
    const distance = 200;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = pillsRef.current;
    if (!el || isWrapMode) return;
    if (e.deltaY !== 0) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const startScrollLeft = React.useRef(0);
  const hasDragged = React.useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = pillsRef.current;
    if (!el || isWrapMode) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - el.offsetLeft;
    startScrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = pillsRef.current;
    if (!isDragging.current || !el || isWrapMode) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDragged.current = true;
    }
    el.scrollLeft = startScrollLeft.current - walk;
    checkScroll();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const isPersonalHighlighted = highlightedSectionId === "personal";

  return (
    <div className="space-y-3.5 pb-12">
      {/* Quick Jump Pills & View Controls (Sticky Toolbar with Web Horizontal Scroll & Wrap) */}
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-5 px-3 sm:px-5 py-2 bg-stone-50/95 dark:bg-[#161b22]/95 backdrop-blur-md border-b border-stone-200/70 dark:border-[#30363d] flex items-center justify-between gap-1.5 shadow-2xs">
        {/* Left Scroll Arrow (Desktop/Web) */}
        {!isWrapMode && canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollPills("left")}
            title={tr("a11y.sectionList.scrollLeft")}
            aria-label={tr("a11y.sectionList.scrollLeft")}
            className="hidden sm:flex items-center justify-center w-6 h-6 min-w-[24px] min-h-[24px] rounded-full bg-white dark:bg-[#21262d] hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#f0f3f6] border border-stone-300/80 dark:border-[#363d47] shadow-2xs shrink-0 transition-transform active:scale-90"
          >
            <ChevronLeft size={13} />
          </button>
        )}

        {/* Scrollable / Wrappable Pills Track */}
        <div
          ref={pillsRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex items-center gap-1.5 py-0.5 flex-1 min-w-0 ${
            isWrapMode
              ? "flex-wrap overflow-visible"
              : "overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (!hasDragged.current) handleJumpTo("personal");
            }}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-[#21262d] hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#f0f3f6] border border-stone-200/80 dark:border-[#363d47] transition-all shadow-2xs shrink-0 active:scale-95"
          >
            <User size={12} className="text-amber-600 dark:text-amber-400" />
            <span>{tr("builder.sections.personalInfo")}</span>
          </button>

          {cv.sections.map((section) => {
            const count = getSectionCount(section);
            const title = t(section.title, lang, cv.defaultLanguage);
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  if (!hasDragged.current) handleJumpTo(section.id);
                }}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-[#21262d] hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#f0f3f6] border border-stone-200/80 dark:border-[#363d47] transition-all shadow-2xs shrink-0 active:scale-95"
              >
                {getSectionIcon(section.type)}
                <span className="truncate max-w-[130px]">{title}</span>
                {count > 0 && (
                  <span className="text-[9.5px] font-mono font-black bg-stone-100 dark:bg-[#161b22] text-stone-600 dark:text-[#c9d1d9] px-1.5 py-0.2 rounded-full ml-0.5">
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/40 transition-all shadow-2xs shrink-0 active:scale-95"
          >
            <Plus size={12} />
            <span>{tr("builder.sections.add")}</span>
          </button>
        </div>

        {/* Right Scroll Arrow (Desktop/Web) */}
        {!isWrapMode && canScrollRight && (
          <button
            type="button"
            onClick={() => scrollPills("right")}
            title={tr("a11y.sectionList.scrollRight")}
            aria-label={tr("a11y.sectionList.scrollRight")}
            className="hidden sm:flex items-center justify-center w-6 h-6 min-w-[24px] min-h-[24px] rounded-full bg-white dark:bg-[#21262d] hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#f0f3f6] border border-stone-300/80 dark:border-[#363d47] shadow-2xs shrink-0 transition-transform active:scale-90"
          >
            <ChevronRight size={13} />
          </button>
        )}

        {/* Right Action Controls: Wrap Toggle & Expand/Collapse */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Desktop Wrap / Carousel Toggle */}
          <button
            type="button"
            onClick={() => setIsWrapMode(!isWrapMode)}
            title={isWrapMode ? tr("a11y.sectionList.wrapCarousel") : tr("a11y.sectionList.wrapAll")}
            aria-label={isWrapMode ? tr("a11y.sectionList.wrapCarousel") : tr("a11y.sectionList.wrapAll")}
            className={`hidden md:flex items-center justify-center w-6 h-6 min-w-[24px] min-h-[24px] rounded-full border text-[11px] font-mono font-bold transition-all shadow-2xs ${
              isWrapMode
                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 border-amber-400 dark:border-amber-500"
                : "bg-white dark:bg-[#21262d] text-stone-600 hover:text-stone-800 dark:text-[#c9d1d9] dark:hover:text-[#f0f3f6] border-stone-200/80 dark:border-[#363d47]"
            }`}
          >
            {isWrapMode ? "⇄" : "⊞"}
          </button>

          {/* Global Expand/Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleExpandAll}
            title={areAllExpanded ? tr("a11y.sectionList.collapseAll") : tr("a11y.sectionList.expandAll")}
            aria-label={areAllExpanded ? tr("a11y.sectionList.collapseAll") : tr("a11y.sectionList.expandAll")}
            className="flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-stone-900 dark:text-[#c9d1d9] dark:hover:text-[#f0f3f6] bg-white dark:bg-[#21262d] border border-stone-200/80 dark:border-[#363d47] px-2 py-1 rounded-full shadow-2xs shrink-0 active:scale-95 min-h-[24px]"
          >
            <ChevronsUpDown size={12} />
            <span className="hidden sm:inline">
              {areAllExpanded ? tr("common.actions.collapse") : tr("common.actions.expand")}
            </span>
          </button>
        </div>
      </div>

      {/* 1. Personal Info Card */}
      <div
        id="section-personal"
        tabIndex={-1}
        className={`bg-white dark:bg-[#21262d] dark-elevation-card rounded-2xl border shadow-xs transition-all duration-300 outline-none ${
          isPersonalHighlighted
            ? "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-[#161b22] border-amber-500 dark:border-amber-500 shadow-md scale-[1.01] bg-amber-50/10 dark:bg-amber-950/20"
            : isPersonalExpanded
            ? "border-stone-300 dark:border-[#484f58] shadow-xs"
            : "border-stone-200 dark:border-[#363d47]"
        }`}
      >
        <div
          onClick={() => toggleSection("personal")}
          className="p-4 flex items-center justify-between gap-2 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 dark:border dark:border-amber-500/30 flex items-center justify-center font-bold shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-stone-900 dark:text-[#f0f3f6] text-sm truncate">
                {tUI("personalInfo", lang)}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-[#8b949e] truncate">
                {cv.personalInfo.fullName
                  ? `${cv.personalInfo.fullName} ${cv.personalInfo.headline ? `• ${t(cv.personalInfo.headline, lang, cv.defaultLanguage)}` : ""}`
                  : tr("builder.sections.summaries.personalDefault")}
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-stone-400 dark:text-[#8b949e] transition-transform duration-200 shrink-0 ${
              isPersonalExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {isPersonalExpanded && (
          <div className="px-5 pb-5 pt-1 border-t border-stone-100 dark:border-[#30363d] animate-in fade-in duration-150">
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
          isHighlighted={highlightedSectionId === section.id}
          isExpanded={expandedSections[section.id] !== false}
          onToggleExpand={() => toggleSection(section.id)}
          onUpdate={(updater) => onUpdateSection(section.id, updater)}
          onToggleVisibility={() => onToggleSectionVisibility(section.id)}
          onMoveUp={() => onMoveSection(section.id, "up")}
          onMoveDown={() => onMoveSection(section.id, "down")}
          onDelete={() => onDeleteSection(section.id)}
        />
      ))}

      {/* 3. Add New Section Button (Opens AddSectionModal) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-3.5 px-4 border-2 border-dashed border-stone-300 dark:border-[#363d47] hover:border-amber-700 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-[#21262d] rounded-2xl text-stone-600 dark:text-[#c9d1d9] hover:text-amber-800 dark:hover:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-[0.99]"
        >
          <Plus size={16} />
          <span>{tr("builder.sections.add")}</span>
        </button>
      </div>

      {/* Modal for adding sections */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        lang={lang}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={onAddSection}
      />
    </div>
  );
}
