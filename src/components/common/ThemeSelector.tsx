"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { Sun, Moon, Laptop, ChevronDown } from "lucide-react";

interface Props {
  lang?: string;
}

export function ThemeSelector({ lang = "en" }: Props) {
  const { theme, setTheme, resolvedTheme } = useTheme();
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
    { id: "light", label: lang === "pt" ? "Modo Claro" : "Light Mode", icon: Sun },
    { id: "dark", label: lang === "pt" ? "Modo Escuro" : "Dark Mode", icon: Moon },
    { id: "system", label: lang === "pt" ? "Sistema" : "System", icon: Laptop },
  ];

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold shadow-2xs transition-colors"
        title="Tema / Theme"
      >
        <CurrentIcon size={14} className="text-amber-600 dark:text-amber-400" />
        <span className="hidden sm:inline capitalize">
          {options.find((o) => o.id === theme)?.label || theme}
        </span>
        <ChevronDown size={11} className="text-stone-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 p-1.5 z-50 animate-in fade-in duration-100">
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
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  isSelected
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Icon size={13} className={isSelected ? "text-amber-700 dark:text-amber-400" : "text-stone-500"} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
