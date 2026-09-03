"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { SupportedLanguage } from "@/types/cv";
import { useTranslation } from "@/hooks/useTranslation";
import { Globe, Plus, Check, ChevronDown, Search, Lock, X } from "lucide-react";

interface Props {
  activeLang: SupportedLanguage;
  availableLanguages: Array<{ code: string; label: string }>;
  onSwitchLanguage: (lang: SupportedLanguage) => void;
  onAddLanguage: (code: string, label: string) => void;
}

interface LanguageMeta {
  code: string;
  namePt: string;
  nameEn: string;
  flag: string;
  isAvailable: boolean;
}

const GLOBAL_LANGUAGES: LanguageMeta[] = [
  { code: "pt", namePt: "Português", nameEn: "Portuguese", flag: "🇵🇹", isAvailable: true },
  { code: "en", namePt: "Inglês", nameEn: "English", flag: "🇬🇧", isAvailable: true },
  { code: "es", namePt: "Espanhol", nameEn: "Spanish", flag: "🇪🇸", isAvailable: false },
  { code: "fr", namePt: "Francês", nameEn: "French", flag: "🇫🇷", isAvailable: false },
  { code: "de", namePt: "Alemão", nameEn: "German", flag: "🇩🇪", isAvailable: false },
  { code: "it", namePt: "Italiano", nameEn: "Italian", flag: "🇮🇹", isAvailable: false },
  { code: "nl", namePt: "Holandês", nameEn: "Dutch", flag: "🇳🇱", isAvailable: false },
  { code: "br", namePt: "Português (Brasil)", nameEn: "Portuguese (Brazil)", flag: "🇧🇷", isAvailable: false },
  { code: "zh", namePt: "Mandarim", nameEn: "Chinese (Simplified)", flag: "🇨🇳", isAvailable: false },
  { code: "ja", namePt: "Japonês", nameEn: "Japanese", flag: "🇯🇵", isAvailable: false },
];

export function LanguageSwitcher({
  activeLang,
  availableLanguages,
  onSwitchLanguage,
  onAddLanguage,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showCustomAdd, setShowCustomAdd] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [customLabel, setCustomLabel] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);
  const isPt = activeLang === "pt";
  const { t: tr } = useTranslation(activeLang);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const activeMeta = GLOBAL_LANGUAGES.find((l) => l.code === activeLang) || {
    code: activeLang,
    flag: "🌐",
    namePt: activeLang.toUpperCase(),
    nameEn: activeLang.toUpperCase(),
    isAvailable: true,
  };

  const filteredLanguages = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return GLOBAL_LANGUAGES;
    return GLOBAL_LANGUAGES.filter(
      (l) =>
        l.namePt.toLowerCase().includes(q) ||
        l.nameEn.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode.trim() || !customLabel.trim()) return;
    onAddLanguage(customCode.toLowerCase().trim(), customLabel.trim());
    setCustomCode("");
    setCustomLabel("");
    setShowCustomAdd(false);
    setIsOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      {/* Trigger Button with Globe & Flag */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isPt ? "Alterar idioma ou nacionalidade" : "Switch language or nationality"}
        title={isPt ? "Alterar idioma ou nacionalidade" : "Switch language or nationality"}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs border ${
          isOpen
            ? "bg-stone-100 dark:bg-[#21262d] text-amber-700 dark:text-amber-400 border-amber-500/50"
            : "bg-white dark:bg-[#161b22] text-stone-700 dark:text-[#f0f3f6] border-stone-200 dark:border-[#363d47] hover:bg-stone-50 dark:hover:bg-[#21262d]"
        }`}
      >
        <Globe size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-sm leading-none">{activeMeta.flag}</span>
        <span className="font-mono uppercase text-[11px] font-bold">{activeLang}</span>
        <ChevronDown size={11} className={`text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Rich Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-2xl shadow-2xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-100 dark:bg-[#0d1117] rounded-xl border border-stone-200 dark:border-[#363d47] mb-2">
            <Search size={13} className="text-stone-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isPt ? "Pesquisar país ou idioma..." : "Search country or language..."}
              className="w-full bg-transparent border-0 outline-none text-xs text-stone-900 dark:text-[#f0f3f6] placeholder-stone-400 dark:placeholder-[#6e7681]"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Languages List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredLanguages.map((langItem) => {
              const isSelected = activeLang === langItem.code;
              const isAvailable = langItem.isAvailable;

              return (
                <button
                  key={langItem.code}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => {
                    if (isAvailable) {
                      onSwitchLanguage(langItem.code as SupportedLanguage);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-2 transition-colors ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold border border-amber-500/30"
                      : isAvailable
                      ? "hover:bg-stone-100 dark:hover:bg-[#21262d] text-stone-800 dark:text-[#f0f3f6] cursor-pointer"
                      : "opacity-55 text-stone-400 dark:text-[#6e7681] cursor-not-allowed group/locked"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base leading-none shrink-0">{langItem.flag}</span>
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {isPt ? langItem.namePt : langItem.nameEn}
                      </p>
                      <p className="text-[10px] font-mono text-stone-400 dark:text-[#8b949e] uppercase">
                        {langItem.code}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  )}

                  {!isAvailable && (
                    <div className="flex items-center gap-1 text-[9px] font-mono font-medium px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-[#0d1117] text-stone-500 dark:text-[#8b949e] shrink-0 border border-stone-300/40 dark:border-[#363d47]/40">
                      <Lock size={9} />
                      <span>{isPt ? "Brevemente" : "Soon"}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add Custom Language Expandable */}
          <div className="pt-2 mt-2 border-t border-stone-100 dark:border-[#30363d]">
            {!showCustomAdd ? (
              <button
                type="button"
                onClick={() => setShowCustomAdd(true)}
                className="w-full text-left px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={12} />
                <span>{isPt ? "Adicionar outro código ao CV" : "Add custom language to CV"}</span>
              </button>
            ) : (
              <form onSubmit={handleAddCustom} className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="Código (ex: es)"
                    maxLength={3}
                    required
                    className="w-20 px-2 py-1 rounded-lg border border-stone-200 dark:border-[#363d47] dark:bg-[#0d1117] text-xs font-mono uppercase text-center"
                  />
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Nome (ex: Español)"
                    required
                    className="flex-1 px-2 py-1 rounded-lg border border-stone-200 dark:border-[#363d47] dark:bg-[#0d1117] text-xs"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    <Check size={12} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
