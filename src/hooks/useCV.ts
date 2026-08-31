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
  MultiLangString,
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
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("curricula_active_document") ||
        localStorage.getItem("cvana_active_document");

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.sections) {
          setCv(parsed);
          setActiveLang(parsed.currentLanguage || parsed.defaultLanguage || "en");
          setIsSetupOpen(false);
        } else if (!isCompleted) {
          setIsSetupOpen(true);
        }
      } else if (!isCompleted) {
        // First visit: open Setup Screen
        setIsSetupOpen(true);
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

  const updateTheme = useCallback((themeUpdater: Partial<CVTheme>) => {
    setCv((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...themeUpdater },
    }));
  }, []);

  // Section CRUD
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
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      ),
    }));
  }, []);

  const moveSection = useCallback((sectionId: string, direction: "up" | "down") => {
    setCv((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.sections.length - 1) return prev;

      const newSections = [...prev.sections];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const [moved] = newSections.splice(idx, 1);
      newSections.splice(targetIdx, 0, moved);

      // Re-index order
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

  const addSection = useCallback(
    (type: SectionType, customTitle?: string | MultiLangString) => {
      const newSectionId = `sec-${generateId()}`;
      let titleText: MultiLangString;

      if (typeof customTitle === "string") {
        titleText = { en: customTitle, pt: customTitle };
      } else if (customTitle && typeof customTitle === "object") {
        titleText = customTitle;
      } else {
        const defaultTitles: Record<SectionType, MultiLangString> = {
          experience: { en: "Work Experience", pt: "Experiência Profissional" },
          education: { en: "Education & Qualifications", pt: "Formação Académica" },
          skills: { en: "Skills & Competencies", pt: "Competências" },
          languages: { en: "Languages", pt: "Competências Linguísticas" },
          certifications: { en: "Certifications", pt: "Certificações" },
          hobbies: { en: "Interests & Volunteering", pt: "Interesses e Voluntariado" },
          custom: { en: "Custom Section", pt: "Secção Personalizada" },
        };
        titleText = defaultTitles[type] || { en: "New Section", pt: "Nova Secção" };
      }

      let newSection: CVSection;

      switch (type) {
        case "experience":
          newSection = {
            id: newSectionId,
            type: "experience",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "education":
          newSection = {
            id: newSectionId,
            type: "education",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "skills":
          newSection = {
            id: newSectionId,
            type: "skills",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            categories: [],
          };
          break;
        case "languages":
          newSection = {
            id: newSectionId,
            type: "languages",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "certifications":
          newSection = {
            id: newSectionId,
            type: "certifications",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "hobbies":
          newSection = {
            id: newSectionId,
            type: "hobbies",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "custom":
        default:
          newSection = {
            id: newSectionId,
            type: "custom",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
      }

      setCv((prev) => ({
        ...prev,
        sections: [...prev.sections, newSection],
      }));
    },
    [cv.sections.length]
  );

  // Preset loading
  const loadPreset = useCallback((presetId: string) => {
    const found = PRESET_SEEDS.find((p) => p.id === presetId);
    if (found) {
      setCv(found.cv);
      setActiveLang(found.cv.defaultLanguage || "en");
      setIsSetupOpen(false);
      localStorage.setItem(SETUP_COMPLETED_KEY, "true");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found.cv));
    }
  }, []);

  // Import / Export JSON
  const importJson = useCallback((jsonData: CVDocument) => {
    if (!jsonData || typeof jsonData !== "object" || !jsonData.sections) {
      throw new Error("Invalid JSON CV Document structure");
    }
    setCv(jsonData);
    setActiveLang(jsonData.currentLanguage || jsonData.defaultLanguage || "en");
    setIsSetupOpen(false);
    localStorage.setItem(SETUP_COMPLETED_KEY, "true");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonData));
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
