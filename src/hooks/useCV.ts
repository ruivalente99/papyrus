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
import {
  exportToJsonResume,
  importFromJsonResume,
  exportToEuropassXml,
  importFromEuropassXml,
  detectResumeFormat,
} from "@/lib/schemaInterop";
import { importFromLatex } from "@/lib/latexEngine";
import type { CoverLetterDocument } from "@/types/coverLetter";
import { softwareEngineerCoverLetter } from "@/data/seeds/coverLetterSeeds";
import type { CVProfileMeta, MultiProfileBundle } from "@/types/profile";
import {
  initProfiles,
  loadProfile,
  saveProfileData,
  createNewProfile as createProfileStorage,
  duplicateProfile as duplicateProfileStorage,
  renameProfile as renameProfileStorage,
  deleteProfile as deleteProfileStorage,
  exportAllProfilesBundle,
  importProfilesBundle as importProfilesBundleStorage,
  ACTIVE_PROFILE_KEY,
} from "@/lib/profileStorage";

const STORAGE_KEY = "papyrus_active_document";
const COVER_LETTER_STORAGE_KEY = "papyrus_active_cover_letter";
const SETUP_COMPLETED_KEY = "papyrus_setup_completed";
const UI_LANG_STORAGE_KEY = "papyrus_ui_lang";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  snapshot: CVDocument;
}

export function useCV() {
  const [cv, setCvState] = useState<CVDocument>(technicalLatexSeed);
  const [uiLang, setUiLangState] = useState<SupportedLanguage>("pt");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [hasCachedDoc, setHasCachedDoc] = useState(false);
  const [past, setPast] = useState<CVDocument[]>([]);
  const [future, setFuture] = useState<CVDocument[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [coverLetter, setCoverLetter] = useState<CoverLetterDocument>(softwareEngineerCoverLetter);
  const [activeDocTab, setActiveDocTab] = useState<"cv" | "cover-letter">("cv");
  const [profiles, setProfiles] = useState<CVProfileMeta[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>("profile-default");

  const activeProfileIdRef = useRef(activeProfileId);
  activeProfileIdRef.current = activeProfileId;

  const cvRef = useRef(cv);
  cvRef.current = cv;

  const cvLang: SupportedLanguage = cv.currentLanguage || cv.defaultLanguage || "en";
  const activeLang = cvLang;

  const uiLangRef = useRef(uiLang);
  uiLangRef.current = uiLang;

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const burstBaseStateRef = useRef<CVDocument | null>(null);
  const isUndoRedoActionRef = useRef(false);

  const commitSnapshot = useCallback((snapshot: CVDocument, actionLabel?: string) => {
    setPast((prev) => {
      const nextPast = [...prev, snapshot];
      return nextPast.length > 30 ? nextPast.slice(nextPast.length - 30) : nextPast;
    });
    setFuture([]);

    const fallbackLabel =
      uiLangRef.current === "pt" ? "Edição no documento" : "Document edit";

    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        label: actionLabel || fallbackLabel,
        snapshot,
      };
      return [entry, ...prev.slice(0, 4)];
    });
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

  const restoreHistoryEntry = useCallback((id: string) => {
    const target = history.find((h) => h.id === id);
    if (!target) return;
    if (cvRef.current) {
      const preLabel =
        uiLangRef.current === "pt"
          ? "Antes de restaurar versão"
          : "Before restoring version";
      commitSnapshot(cvRef.current, preLabel);
    }
    isUndoRedoActionRef.current = true;
    setCvState(target.snapshot);

    setTimeout(() => {
      isUndoRedoActionRef.current = false;
    }, 0);
  }, [history, commitSnapshot]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedUiLang = localStorage.getItem(UI_LANG_STORAGE_KEY);
      if (savedUiLang) {
        setUiLangState(savedUiLang);
      }

      // Initialize Profiles
      const { activeId, profiles: loadedProfiles } = initProfiles(
        technicalLatexSeed,
        softwareEngineerCoverLetter
      );
      setProfiles(loadedProfiles);
      setActiveProfileId(activeId);

      const activeProfileData = loadProfile(activeId);
      if (activeProfileData) {
        setCvState(activeProfileData.cv);
        cvRef.current = activeProfileData.cv;
        setCoverLetter(activeProfileData.coverLetter || softwareEngineerCoverLetter);
        setHasCachedDoc(true);
      }

      const isCompleted = localStorage.getItem(SETUP_COMPLETED_KEY);
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const forceSkipSetup =
        urlParams?.get("skipSetup") === "1" ||
        urlParams?.get("demo") === "1" ||
        urlParams?.get("builder") === "1";

      if (forceSkipSetup) {
        setIsSetupOpen(false);
        try {
          localStorage.setItem(SETUP_COMPLETED_KEY, "true");
        } catch {}
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
      const updatedCv = { ...cv, currentLanguage: cvLang, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCv));
      localStorage.setItem(SETUP_COMPLETED_KEY, "true");
      localStorage.setItem(COVER_LETTER_STORAGE_KEY, JSON.stringify(coverLetter));

      const { profiles: updatedProfiles } = saveProfileData(
        activeProfileIdRef.current,
        updatedCv,
        coverLetter
      );
      setProfiles(updatedProfiles);
      setHasCachedDoc(true);
    } catch (e) {
      console.warn("Failed to save CV to localStorage:", e);
    }
  }, [cv, cvLang, coverLetter, isLoaded, isSetupOpen]);

  const updateCoverLetter = useCallback(
    (updater: CoverLetterDocument | ((prev: CoverLetterDocument) => CoverLetterDocument)) => {
      setCoverLetter((prev) => (typeof updater === "function" ? updater(prev) : updater));
    },
    []
  );

  const resetCoverLetter = useCallback(() => {
    setCoverLetter(softwareEngineerCoverLetter);
  }, []);

  // Set UI / application interface language (does not alter CV content)
  const setUiLang = useCallback((lang: SupportedLanguage) => {
    setUiLangState(lang);
    try {
      localStorage.setItem(UI_LANG_STORAGE_KEY, lang);
    } catch {}
  }, []);

  // Set active CV document content language (never mutates uiLang)
  const switchCvLanguage = useCallback((lang: SupportedLanguage) => {
    setCv((prev) => ({ ...prev, currentLanguage: lang }));
  }, [setCv]);

  // Add new language to CV document (never mutates uiLang)
  const addCvLanguage = useCallback((code: string, label: string) => {
    setCv((prev) => {
      const exists = prev.availableLanguages.some((l) => l.code === code);
      return {
        ...prev,
        currentLanguage: code,
        availableLanguages: exists
          ? prev.availableLanguages
          : [...prev.availableLanguages, { code, label }],
      };
    });
  }, [setCv]);

  // Compatibility aliases
  const switchLanguage = switchCvLanguage;
  const addLanguage = addCvLanguage;

  // Update Personal Info
  const updatePersonalInfo = useCallback(
    (updater: Partial<PersonalInfo> | ((prev: PersonalInfo) => PersonalInfo)) => {
      setCv((prev) => ({
        ...prev,
        personalInfo:
          typeof updater === "function" ? updater(prev.personalInfo) : { ...prev.personalInfo, ...updater },
      }));
    },
    [setCv]
  );

  // Template & Theme
  const setTemplate = useCallback((template: TemplateId) => {
    setCv((prev) => ({ ...prev, template }));
  }, [setCv]);

  const updateTheme = useCallback((themeUpdate: Partial<CVTheme>) => {
    setCv((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...themeUpdate },
    }));
  }, [setCv]);

  // Section Management
  const updateSection = useCallback((sectionId: string, updater: (sec: CVSection) => CVSection) => {
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === sectionId ? updater(sec) : sec)),
    }));
  }, [setCv]);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setCv((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      ),
    }));
  }, [setCv]);

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
  }, [setCv]);

  const deleteSection = useCallback((sectionId: string) => {
    setCv((prev) => ({
      ...prev,
      sections: prev.sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i + 1 })),
    }));
  }, [setCv]);

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
    [cv.sections.length, setCv]
  );

  // Preset loading
  const loadPreset = useCallback((presetId: string) => {
    const found = PRESET_SEEDS.find((p) => p.id === presetId);
    if (found) {
      setCv(found.cv);
      setIsSetupOpen(false);
      localStorage.setItem(SETUP_COMPLETED_KEY, "true");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found.cv));
      setHasCachedDoc(true);
    }
  }, [setCv]);

  // Import / Export JSON
  const importJson = useCallback((jsonData: CVDocument) => {
    if (!jsonData || typeof jsonData !== "object" || !jsonData.sections) {
      throw new Error("Invalid JSON CV Document structure");
    }
    setCv(jsonData);
    setIsSetupOpen(false);
    localStorage.setItem(SETUP_COMPLETED_KEY, "true");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonData));
    setHasCachedDoc(true);
  }, [setCv]);

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

  const exportJsonResume = useCallback(
    (lang?: SupportedLanguage) => {
      const targetLang = lang || cvLang;
      const jsonResumeObj = exportToJsonResume(cv, targetLang);
      const jsonResumeStr = JSON.stringify(jsonResumeObj, null, 2);
      const blob = new Blob([jsonResumeStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (cv.personalInfo.fullName || "resume").toLowerCase().replace(/\s+/g, "_");
      a.download = `${safeName}_jsonresume.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    [cv, cvLang]
  );

  const exportEuropassXml = useCallback(
    (lang?: SupportedLanguage) => {
      const targetLang = lang || cvLang;
      const xmlStr = exportToEuropassXml(cv, targetLang);
      const blob = new Blob([xmlStr], { type: "application/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (cv.personalInfo.fullName || "resume").toLowerCase().replace(/\s+/g, "_");
      a.download = `${safeName}_europass.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    [cv, cvLang]
  );

  const importAnyResume = useCallback(
    (
      content: string,
      defaultLang?: SupportedLanguage
    ): { success: boolean; format?: string; error?: string } => {
      try {
        const detected = detectResumeFormat(content);
        let importedDoc: CVDocument | null = null;
        const targetLang = defaultLang || cvLang;

        switch (detected) {
          case "jsonresume":
            importedDoc = importFromJsonResume(content, targetLang);
            break;
          case "europass-xml":
            importedDoc = importFromEuropassXml(content, targetLang);
            break;
          case "latex": {
            const parsedLatex = importFromLatex(content);
            importedDoc = {
              ...technicalLatexSeed,
              ...parsedLatex,
              id: generateId(),
              personalInfo: {
                ...technicalLatexSeed.personalInfo,
                ...(parsedLatex.personalInfo || {}),
              },
              sections: (parsedLatex.sections && parsedLatex.sections.length > 0)
                ? (parsedLatex.sections as CVSection[])
                : technicalLatexSeed.sections,
              updatedAt: new Date().toISOString(),
            };
            break;
          }
          case "papyrus":
          default: {
            try {
              const parsed = JSON.parse(content);
              if (parsed && parsed.id && parsed.sections) {
                importedDoc = parsed;
              } else {
                importedDoc = importFromJsonResume(content, targetLang);
              }
            } catch {
              return { success: false, error: "Invalid or unsupported format" };
            }
            break;
          }
        }

        if (importedDoc && importedDoc.sections) {
          setCv(importedDoc);
          setIsSetupOpen(false);
          try {
            localStorage.setItem(SETUP_COMPLETED_KEY, "true");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(importedDoc));
            setHasCachedDoc(true);
          } catch {}
          return {
            success: true,
            format: detected === "unknown" ? undefined : detected,
          };
        }
        return { success: false, error: "Unable to parse resume document" };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to parse resume document" };
      }
    },
    [cvLang, setCv]
  );

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
  }, [cv, setCv]);

  const deleteCV = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETUP_COMPLETED_KEY);
      localStorage.removeItem("curricula_active_document");
      localStorage.removeItem("cvana_active_document");
    } catch {}
    setCv(emptySeed);
    setHasCachedDoc(false);
  }, [setCv]);

  const completeSetup = useCallback((newCv: CVDocument) => {
    setCv(newCv);
    setIsSetupOpen(false);
    localStorage.setItem(SETUP_COMPLETED_KEY, "true");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCv));
    setHasCachedDoc(true);
  }, [setCv]);

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

  // Profile Management Handlers
  const switchProfile = useCallback((profileId: string) => {
    if (profileId === activeProfileIdRef.current) return;
    try {
      saveProfileData(activeProfileIdRef.current, cvRef.current, coverLetter);
    } catch {}

    const targetData = loadProfile(profileId);
    if (!targetData) return;

    setActiveProfileId(profileId);
    setCvState(targetData.cv);
    cvRef.current = targetData.cv;
    setCoverLetter(targetData.coverLetter || softwareEngineerCoverLetter);
    setPast([]);
    setFuture([]);
    setHistory([]);

    try {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    } catch {}
  }, [coverLetter]);

  const createProfile = useCallback(
    (name: string, templateId?: TemplateId, fromCurrent?: boolean) => {
      let baseCv = technicalLatexSeed;
      if (fromCurrent) {
        baseCv = cvRef.current;
      } else if (templateId) {
        const found = PRESET_SEEDS.find((p) => p.id === templateId);
        if (found) baseCv = found.cv;
      }

      const { meta, profiles: updatedProfiles } = createProfileStorage(
        name,
        baseCv,
        fromCurrent ? coverLetter : undefined
      );

      setProfiles(updatedProfiles);
      setActiveProfileId(meta.id);
      const created = loadProfile(meta.id);
      if (created) {
        setCvState(created.cv);
        cvRef.current = created.cv;
        setCoverLetter(created.coverLetter || softwareEngineerCoverLetter);
      } else {
        setCvState({ ...baseCv, title: meta.name, id: `cv-${Date.now()}` });
        setCoverLetter(fromCurrent ? coverLetter : softwareEngineerCoverLetter);
      }
      setPast([]);
      setFuture([]);
      setHistory([]);
      return meta;
    },
    [coverLetter]
  );

  const duplicateProfile = useCallback(
    (sourceId?: string, customName?: string) => {
      const targetId = sourceId || activeProfileIdRef.current;
      const res = duplicateProfileStorage(targetId, customName);
      if (!res) return null;

      setProfiles(res.profiles);
      setActiveProfileId(res.meta.id);
      const loaded = loadProfile(res.meta.id);
      if (loaded) {
        setCvState(loaded.cv);
        cvRef.current = loaded.cv;
        setCoverLetter(loaded.coverLetter || softwareEngineerCoverLetter);
      }
      setPast([]);
      setFuture([]);
      setHistory([]);
      return res.meta;
    },
    []
  );

  const renameProfile = useCallback((profileId: string, newName: string) => {
    const updatedProfiles = renameProfileStorage(profileId, newName);
    setProfiles(updatedProfiles);
    if (profileId === activeProfileIdRef.current) {
      setCvState((prev) => ({ ...prev, title: newName.trim() || prev.title }));
    }
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    const { nextActiveId, profiles: updatedProfiles } = deleteProfileStorage(
      profileId,
      activeProfileIdRef.current,
      technicalLatexSeed
    );
    setProfiles(updatedProfiles);

    if (profileId === activeProfileIdRef.current) {
      setActiveProfileId(nextActiveId);
      const nextData = loadProfile(nextActiveId);
      if (nextData) {
        setCvState(nextData.cv);
        cvRef.current = nextData.cv;
        setCoverLetter(nextData.coverLetter || softwareEngineerCoverLetter);
      }
      setPast([]);
      setFuture([]);
      setHistory([]);
    }
  }, []);

  const exportProfilesBundle = useCallback(() => {
    return exportAllProfilesBundle(activeProfileIdRef.current);
  }, []);

  const importProfilesBundle = useCallback((bundle: MultiProfileBundle) => {
    const { activeId, profiles: updatedProfiles } = importProfilesBundleStorage(bundle);
    setProfiles(updatedProfiles);
    setActiveProfileId(activeId);
    const activeData = loadProfile(activeId);
    if (activeData) {
      setCvState(activeData.cv);
      cvRef.current = activeData.cv;
      setCoverLetter(activeData.coverLetter || softwareEngineerCoverLetter);
    }
    setPast([]);
    setFuture([]);
    setHistory([]);
    return { activeId, profiles: updatedProfiles };
  }, []);

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
    uiLang,
    setUiLang,
    cvLang,
    switchCvLanguage,
    addCvLanguage,
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
    exportJsonResume,
    exportEuropassXml,
    importAnyResume,
    updateFromJson,
    coverLetter,
    updateCoverLetter,
    resetCoverLetter,
    activeDocTab,
    setActiveDocTab,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    restoreHistoryEntry,
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
    profiles,
    activeProfileId,
    switchProfile,
    createProfile,
    duplicateProfile,
    renameProfile,
    deleteProfile,
    exportProfilesBundle,
    importProfilesBundle,
  };
}
