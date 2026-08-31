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
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
        {availableLanguages.map((l) => (
          <button
            key={l.code}
            onClick={() => onSwitchLanguage(l.code)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-all ${
              activeLang === l.code
                ? "bg-amber-700 text-white shadow-xs"
                : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700"
            }`}
          >
            <span>{l.code}</span>
          </button>
        ))}

        <button
          onClick={() => setShowAdd(!showAdd)}
          title="Adicionar novo idioma ao CV"
          className="px-2 py-1 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium flex items-center gap-0.5"
        >
          <Plus size={12} />
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="flex items-center gap-1.5 bg-white dark:bg-stone-800 p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 shadow-md text-xs"
        >
          <input
            type="text"
            placeholder="Code (e.g. fr)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-16 px-1.5 py-1 border border-stone-200 dark:border-stone-700 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded text-xs"
            maxLength={3}
            required
          />
          <input
            type="text"
            placeholder="Name (e.g. French)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-24 px-1.5 py-1 border border-stone-200 dark:border-stone-700 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded text-xs"
            required
          />
          <button
            type="submit"
            className="bg-amber-700 text-white px-2 py-1 rounded hover:bg-amber-800 font-semibold"
          >
            <Check size={12} />
          </button>
        </form>
      )}
    </div>
  );
}
