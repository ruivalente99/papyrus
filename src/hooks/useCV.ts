"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  CVDocument,
  SupportedLanguage,
  PersonalInfo,
  CVSection,
  SectionType,
  TemplateId,
  CVTheme,
} from "@/types/cv";
import {
  creativeSidebarSeed,
  technicalLatexSeed,
  executiveSeed,
  emptySeed,
  PRESET_SEEDS,
} from "@/data/seeds";
import { analyzeCV } from "@/data/linterRules";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "papyrus_active_document";
const SETUP_COMPLETED_KEY = "papyrus_setup_completed";

export function useCV() {
  const [cv, setCv] = useState<CVDocument>(technicalLatexSeed);
  const [activeLang, setActiveLang] = useState<SupportedLanguage>("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(SETUP_COMPLETED_KEY);
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!isCompleted) {
        // First visit: open Setup Screen
        setIsSetupOpen(true);
      } else if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.sections) {
          setCv(parsed);
          setActiveLang(parsed.currentLanguage || "en");
        }
      }
    } catch (e) {
      console.warn("Failed to load CV from localStorage:", e);
      setIsSetupOpen(true);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Auto-save to LocalStorage on update
  useEffect(() => {
    if (!isLoaded || isSetupOpen) return;
    try {
      const updatedCv = { ...cv, currentLanguage: activeLang, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCv));
      localStorage.setItem(SETUP_COMPLETED_KEY, "true");
    } catch (e) {
      console.warn("Failed to save CV to localStorage:", e);
    }
  }, [cv, activeLang, isLoaded, isSetupOpen]);

  // Set active language
  const switchLanguage = useCallback((lang: SupportedLanguage) => {
    setActiveLang(lang);
    setCv((prev) => ({ ...prev, currentLanguage: lang }));
  }, []);

  // Add new language to document
  const addLanguage = useCallback((code: string, label: string) => {
    setCv((prev) => {
      if (prev.availableLanguages.some((l) => l.code === code)) return prev;
      return {
        ...prev,
        availableLanguages: [...prev.availableLanguages, { code, label }],
      };
    });
    setActiveLang(code);
  }, []);

  // Update Personal Info
  const updatePersonalInfo = useCallback(
    (updater: Partial<PersonalInfo> | ((prev: PersonalInfo) => PersonalInfo)) => {
      setCv((prev) => ({
        ...prev,
        personalInfo:
          typeof updater === "function" ? updater(prev.personalInfo) : { ...prev.personalInfo, ...updater },
      }));
    },
    []
  );

  // Update Theme / Template
  const setTemplate = useCallback((template: TemplateId) => {
    setCv((prev) => ({ ...prev, template }));
  }, []);

  const updateTheme = useCallback((themeUpdate: Partial<CVTheme>) => {
    setCv((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...themeUpdate },
    }));
  }, []);

  // Section Management
  const updateSection = useCallback((sectionId: string, updater: (sec: CVSection) => CVSection) => {
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === sectionId ? updater(sec) : sec)),
    }));
  }, []);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? ({ ...sec, visible: !sec.visible } as CVSection) : sec
      ),
    }));
  }, []);

  const moveSection = useCallback((sectionId: string, direction: "up" | "down") => {
    setCv((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.sections.length - 1) return prev;

      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const newSections = [...prev.sections];
      const [moved] = newSections.splice(idx, 1);
      newSections.splice(targetIdx, 0, moved);

      return {
        ...prev,
        sections: newSections.map((sec, i) => ({ ...sec, order: i + 1 })),
      };
    });
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
  }, []);

  const addSection = useCallback((type: SectionType, customTitle?: string) => {
    setCv((prev) => {
      const newId = `sec-${generateId()}`;
      const defaultTitles: Record<SectionType, { en: string; pt: string }> = {
        experience: { en: "Work Experience", pt: "Experiência Profissional" },
        education: { en: "Education & Qualifications", pt: "Habilitações & Formação" },
        skills: { en: "Skills", pt: "Competências" },
        languages: { en: "Languages", pt: "Competências Linguísticas" },
        certifications: { en: "Certifications", pt: "Certificações" },
        hobbies: { en: "Interests & Activities", pt: "Interesses & Atividades" },
        custom: { en: customTitle || "Other Activities", pt: customTitle || "Outras Atividades" },
      };

      const base = {
        id: newId,
        type,
        title: defaultTitles[type],
        visible: true,
        order: prev.sections.length + 1,
      };

      let newSection: CVSection;
      switch (type) {
        case "experience":
          newSection = { ...base, type: "experience", items: [] };
          break;
        case "education":
          newSection = { ...base, type: "education", items: [] };
          break;
        case "skills":
          newSection = { ...base, type: "skills", categories: [] };
          break;
        case "languages":
          newSection = { ...base, type: "languages", items: [] };
          break;
        case "certifications":
          newSection = { ...base, type: "certifications", items: [] };
          break;
        case "hobbies":
          newSection = { ...base, type: "hobbies", items: [] };
          break;
        case "custom":
        default:
          newSection = { ...base, type: "custom", items: [] };
          break;
      }

      return {
        ...prev,
        sections: [...prev.sections, newSection],
      };
    });
  }, []);

  // Presets & Import / Export
  const loadPreset = useCallback((presetId: string) => {
    const found = PRESET_SEEDS.find((p) => p.id === presetId);
    let selected: CVDocument;

    if (found) {
      selected = JSON.parse(JSON.stringify(found.cv));
    } else if (presetId === "classic" || presetId === "technical-latex" || presetId === "latex") {
      selected = JSON.parse(JSON.stringify(technicalLatexSeed));
    } else if (presetId === "matrix" || presetId === "executive-pro" || presetId === "europass") {
      selected = JSON.parse(JSON.stringify(executiveSeed));
    } else if (presetId === "empty") {
      selected = JSON.parse(JSON.stringify(emptySeed));
    } else {
      selected = JSON.parse(JSON.stringify(creativeSidebarSeed));
    }

    setCv(selected);
    setActiveLang(selected.defaultLanguage || "en");
  }, []);

  const importJson = useCallback((jsonData: CVDocument) => {
    if (!jsonData || !jsonData.sections || !jsonData.personalInfo) {
      throw new Error("Invalid JSON CV Document structure");
    }
    setCv(jsonData);
    setActiveLang(jsonData.currentLanguage || jsonData.defaultLanguage || "en");
    setIsSetupOpen(false);
    localStorage.setItem(SETUP_COMPLETED_KEY, "true");
  }, []);

  const exportJson = useCallback(() => {
    const jsonStr = JSON.stringify(cv, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(cv.personalInfo.fullName || "curriculum").toLowerCase().replace(/\s+/g, "_")}_cv.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, [cv]);

  // Setup Screen handlers
  const openSetup = useCallback(() => {
    setIsSetupOpen(true);
  }, []);

  const completeSetup = useCallback((newCv: CVDocument) => {
    setCv(newCv);
    setActiveLang(newCv.defaultLanguage || "en");
    setIsSetupOpen(false);
    localStorage.setItem(SETUP_COMPLETED_KEY, "true");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCv));
  }, []);

  // Linter Report Calculation
  const linterReport = useMemo(() => {
    return analyzeCV(cv, activeLang);
  }, [cv, activeLang]);

  return {
    cv,
    setCv,
    activeLang,
    switchLanguage,
    addLanguage,
    updatePersonalInfo,
    setTemplate,
    updateTheme,
    updateSection,
    toggleSectionVisibility,
    moveSection,
    deleteSection,
    addSection,
    loadPreset,
    importJson,
    exportJson,
    linterReport,
    isLoaded,
    isSetupOpen,
    openSetup,
    completeSetup,
  };
}
