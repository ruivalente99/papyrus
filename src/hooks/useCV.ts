"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  technicalLatexSeed,
  emptySeed,
  PRESET_SEEDS,
} from "@/data/seeds";
import { analyzeCV } from "@/data/linterRules";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "papyrus_active_document";
const SETUP_COMPLETED_KEY = "papyrus_setup_completed";

export function useCV() {
  const [cv, setCvState] = useState<CVDocument>(technicalLatexSeed);
  const [activeLang, setActiveLang] = useState<SupportedLanguage>("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [hasCachedDoc, setHasCachedDoc] = useState(false);
  const [past, setPast] = useState<CVDocument[]>([]);
  const [future, setFuture] = useState<CVDocument[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const cvRef = useRef(cv);
  cvRef.current = cv;

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const burstBaseStateRef = useRef<CVDocument | null>(null);
  const isUndoRedoActionRef = useRef(false);

  const commitSnapshot = useCallback((snapshot: CVDocument) => {
    setPast((prev) => {
      const nextPast = [...prev, snapshot];
      return nextPast.length > 30 ? nextPast.slice(nextPast.length - 30) : nextPast;
    });
    setFuture([]);
  }, []);

  const setCv = useCallback(
    (updater: CVDocument | ((prev: CVDocument) => CVDocument)) => {
      setCvState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (next === prev) return prev;

        setSaveStatus("saving");

        if (isUndoRedoActionRef.current) {
          return next;
        }

        if (!burstBaseStateRef.current) {
          burstBaseStateRef.current = prev;
        }

        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }

        typingTimerRef.current = setTimeout(() => {
          if (burstBaseStateRef.current && burstBaseStateRef.current !== next) {
            commitSnapshot(burstBaseStateRef.current);
            burstBaseStateRef.current = null;
          }
          typingTimerRef.current = null;
        }, 400);

        return next;
      });
    },
    [commitSnapshot]
  );

  const undo = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    if (burstBaseStateRef.current && burstBaseStateRef.current !== cvRef.current) {
      const target = burstBaseStateRef.current;
      burstBaseStateRef.current = null;
      isUndoRedoActionRef.current = true;
      setFuture((f) => [cvRef.current, ...f.slice(0, 29)]);
      setCvState(target);
      setTimeout(() => {
        isUndoRedoActionRef.current = false;
      }, 0);
      return;
    }

    burstBaseStateRef.current = null;

    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      isUndoRedoActionRef.current = true;
      setFuture((f) => [cvRef.current, ...f.slice(0, 29)]);
      setCvState(previous);
      setTimeout(() => {
        isUndoRedoActionRef.current = false;
      }, 0);

      return newPast;
    });
  }, []);

  const redo = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    burstBaseStateRef.current = null;

    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      isUndoRedoActionRef.current = true;
      setPast((p) => [...p.slice(-29), cvRef.current]);
      setCvState(next);
      setTimeout(() => {
        isUndoRedoActionRef.current = false;
      }, 0);

      return newFuture;
    });
  }, []);

  const canUndo = past.length > 0 || (burstBaseStateRef.current !== null && burstBaseStateRef.current !== cv);
  const canRedo = future.length > 0;

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(SETUP_COMPLETED_KEY);
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("curricula_active_document") ||
        localStorage.getItem("cvana_active_document");

      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const forceSkipSetup =
        urlParams?.get("skipSetup") === "1" ||
        urlParams?.get("demo") === "1" ||
        urlParams?.get("builder") === "1";

      if (forceSkipSetup) {
        setIsSetupOpen(false);
        try {
          localStorage.setItem(SETUP_COMPLETED_KEY, "true");
        } catch (e) {}
      } else if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.sections) {
          setCv(parsed);
          setActiveLang(parsed.currentLanguage || parsed.defaultLanguage || "en");
          setHasCachedDoc(true);
          setIsSetupOpen(false);
          try {
            localStorage.setItem(SETUP_COMPLETED_KEY, "true");
          } catch (e) {}
        } else if (!isCompleted) {
          setIsSetupOpen(true);
        } else {
          setIsSetupOpen(false);
        }
      } else if (!isCompleted) {
        // First visit: open Setup Screen
        setIsSetupOpen(true);
      } else {
        setIsSetupOpen(false);
      }
    } catch (e) {
      console.warn("Failed to load CV from localStorage:", e);
      setIsSetupOpen(false);
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
      setHasCachedDoc(true);
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

  // Template & Theme
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
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      ),
    }));
  }, []);

  const moveSection = useCallback((sectionId: string, direction: "up" | "down") => {
    setCv((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.sections.length - 1) return prev;

      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const newSections = [...prev.sections];
      const temp = newSections[idx];
      newSections[idx] = newSections[targetIdx];
      newSections[targetIdx] = temp;

      return {
        ...prev,
        sections: newSections.map((s, i) => ({ ...s, order: i + 1 })),
      };
    });
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setCv((prev) => ({
      ...prev,
      sections: prev.sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i + 1 })),
    }));
  }, []);

  const addSection = useCallback(
    (type: SectionType, customTitleText?: string) => {
      const newId = generateId();
      let titleText: MultiLangString;

      switch (type) {
        case "experience":
          titleText = { en: "Experience", pt: "Experiência Profissional" };
          break;
        case "education":
          titleText = { en: "Education", pt: "Formação Académica" };
          break;
        case "skills":
          titleText = { en: "Skills", pt: "Competências & Tecnologias" };
          break;
        case "languages":
          titleText = { en: "Languages", pt: "Línguas & Idiomas" };
          break;
        case "certifications":
          titleText = { en: "Certifications", pt: "Certificações & Formações" };
          break;
        case "hobbies":
          titleText = { en: "Interests", pt: "Interesses & Voluntariado" };
          break;
        case "custom":
        default:
          titleText = {
            en: customTitleText || "Custom Section",
            pt: customTitleText || "Secção Personalizada",
          };
          break;
      }

      let newSection: CVSection;

      switch (type) {
        case "experience":
          newSection = {
            id: newId,
            type: "experience",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "education":
          newSection = {
            id: newId,
            type: "education",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "skills":
          newSection = {
            id: newId,
            type: "skills",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            categories: [],
          };
          break;
        case "languages":
          newSection = {
            id: newId,
            type: "languages",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "certifications":
          newSection = {
            id: newId,
            type: "certifications",
            title: titleText,
            visible: true,
            order: cv.sections.length + 1,
            items: [],
          };
          break;
        case "hobbies":
          newSection = {
            id: newId,
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
            id: newId,
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
      setHasCachedDoc(true);
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
    setHasCachedDoc(true);
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

  // Setup Screen handlers: Resume, Duplicate, Delete, Complete
  const openSetup = useCallback(() => {
    setIsSetupOpen(true);
  }, []);

  const resumeCV = useCallback(() => {
    setIsSetupOpen(false);
  }, []);

  const duplicateCV = useCallback(() => {
    const cloned: CVDocument = JSON.parse(JSON.stringify(cv));
    cloned.id = generateId();
    cloned.title = `${cloned.title || "Curriculum"} (Copy)`;
    cloned.updatedAt = new Date().toISOString();
    setCv(cloned);
    setIsSetupOpen(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloned));
    localStorage.setItem(SETUP_COMPLETED_KEY, "true");
    setHasCachedDoc(true);
  }, [cv]);

  const deleteCV = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETUP_COMPLETED_KEY);
      localStorage.removeItem("curricula_active_document");
      localStorage.removeItem("cvana_active_document");
    } catch (e) {}
    setCv(emptySeed);
    setHasCachedDoc(false);
  }, []);

  const completeSetup = useCallback((newCv: CVDocument) => {
    setCv(newCv);
    setActiveLang(newCv.defaultLanguage || "en");
    setIsSetupOpen(false);
    localStorage.setItem(SETUP_COMPLETED_KEY, "true");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCv));
    setHasCachedDoc(true);
  }, []);

  const updateFromJson = useCallback(
    (jsonString: string): { success: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed && parsed.id && parsed.sections) {
          setCv(parsed);
          return { success: true };
        }
        return { success: false, error: "Missing required CV fields (id or sections)" };
      } catch (err: any) {
        return { success: false, error: err.message || "Invalid JSON syntax" };
      }
    },
    [setCv]
  );

  // Global Keyboard Shortcuts: Cmd+Z (undo), Cmd+Shift+Z / Ctrl+Y (redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (!isInputFocused) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
        } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

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
    updateFromJson,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
    linterReport,
    isLoaded,
    isSetupOpen,
    openSetup,
    resumeCV,
    duplicateCV,
    deleteCV,
    hasCachedDoc,
    completeSetup,
  };
}
