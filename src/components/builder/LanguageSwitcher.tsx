"use client";

import React, { useState } from "react";
import type { SupportedLanguage } from "@/types/cv";
import { Plus, Check } from "lucide-react";

interface Props {
  activeLang: SupportedLanguage;
  availableLanguages: Array<{ code: string; label: string }>;
  onSwitchLanguage: (lang: SupportedLanguage) => void;
  onAddLanguage: (code: string, label: string) => void;
}

export function LanguageSwitcher({
  activeLang,
  availableLanguages,
  onSwitchLanguage,
  onAddLanguage,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newLabel) return;
    onAddLanguage(newCode.toLowerCase().trim(), newLabel.trim());
    setNewCode("");
    setNewLabel("");
    setShowAdd(false);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      {/* Pill Language Group */}
      <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 sm:p-1 rounded-full border border-stone-200 dark:border-stone-700 shadow-2xs shrink-0">
        {availableLanguages.map((l) => (
          <button
            key={l.code}
            onClick={() => onSwitchLanguage(l.code)}
            className={`flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase transition-all ${
              activeLang === l.code
                ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            <span>{l.code}</span>
          </button>
        ))}

        <button
          onClick={() => setShowAdd(!showAdd)}
          title="Adicionar novo idioma ao CV"
          className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-stone-400 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-bold flex items-center gap-0.5 rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors shrink-0"
        >
          <Plus size={12} />
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="flex items-center gap-1.5 bg-white dark:bg-stone-800 p-1.5 rounded-full border border-stone-300 dark:border-stone-700 shadow-md text-xs animate-in fade-in duration-100"
        >
          <input
            type="text"
            placeholder="Code"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-14 px-2 py-1 border border-stone-200 dark:border-stone-700 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-full text-xs text-center font-bold uppercase"
            maxLength={3}
            required
          />
          <input
            type="text"
            placeholder="Name (e.g. FR)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-24 px-2 py-1 border border-stone-200 dark:border-stone-700 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-full text-xs font-medium"
            required
          />
          <button
            type="submit"
            className="bg-amber-700 text-white p-1 rounded-full hover:bg-amber-800 font-bold transition-colors"
          >
            <Check size={12} />
          </button>
        </form>
      )}
    </div>
  );
}
