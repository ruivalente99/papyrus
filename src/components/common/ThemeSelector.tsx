"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Sun, Moon, Laptop, ChevronDown } from "lucide-react";

interface Props {
  lang?: string;
}

export function ThemeSelector({ lang = "en" }: Props) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t: tr } = useTranslation(lang as any);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const options: Array<{ id: ThemeMode; label: string; icon: any }> = [
    { id: "light", label: tr("common.theme.light"), icon: Sun },
    { id: "dark", label: tr("common.theme.dark"), icon: Moon },
    { id: "system", label: tr("common.theme.system"), icon: Laptop },
  ];

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;
  const currentLabel = options.find((o) => o.id === theme)?.label || theme;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={tr("common.theme.current", { label: currentLabel })}
        aria-expanded={isOpen}
        className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 dark:border-[#363d47] bg-white dark:bg-[#21262d] hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#f0f3f6] text-xs font-bold shadow-2xs transition-all shrink-0 min-w-[28px] min-h-[28px] justify-center"
        title={tr("common.theme.title")}
      >
        <CurrentIcon size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="hidden sm:inline capitalize font-mono text-[11.5px]">
          {options.find((o) => o.id === theme)?.label || theme}
        </span>
        <ChevronDown size={11} className="text-stone-400 dark:text-[#8b949e] hidden sm:inline" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#161b22] rounded-2xl shadow-xl border border-stone-200 dark:border-[#30363d] p-1.5 z-50 animate-in fade-in duration-100">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors ${
                  isSelected
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300"
                    : "text-stone-700 dark:text-[#c9d1d9] hover:bg-stone-100 dark:hover:bg-[#21262d]"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-amber-700 dark:text-amber-400" : "text-stone-500 dark:text-[#8b949e]"} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
