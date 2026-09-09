"use client";

import React, { useState, useRef, useEffect } from "react";
import type { CVProfileMeta } from "@/types/profile";
import { useTranslation } from "@/hooks/useTranslation";
import { Briefcase, Check, ChevronDown, Plus, Settings } from "lucide-react";

interface ProfileSwitcherDropdownProps {
  profiles: CVProfileMeta[];
  activeProfileId: string;
  onSwitchProfile: (id: string) => void;
  onOpenProfileManager: () => void;
  onCreateProfile: () => void;
}

export function ProfileSwitcherDropdown({
  profiles,
  activeProfileId,
  onSwitchProfile,
  onOpenProfileManager,
  onCreateProfile,
}: ProfileSwitcherDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-[#363d47] bg-white dark:bg-[#21262d] hover:bg-stone-50 dark:hover:bg-[#30363d] text-xs font-medium transition-colors shadow-2xs text-stone-800 dark:text-[#f0f3f6]"
        aria-label={t("profiles.switcherTitle")}
        aria-expanded={isOpen}
        title={t("profiles.switcherTitle")}
      >
        <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="max-w-[100px] sm:max-w-[140px] truncate font-medium">
          {activeProfile ? activeProfile.name : t("profiles.active")}
        </span>
        {activeProfile?.atsScore !== undefined && (
          <span className="hidden md:inline-flex items-center text-[10px] font-semibold px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
            {activeProfile.atsScore}%
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-stone-400 dark:text-[#8b949e] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 max-h-80 overflow-y-auto bg-white dark:bg-[#21262d] rounded-2xl shadow-xl border border-stone-200 dark:border-[#363d47] p-1.5 z-50 animate-in fade-in duration-100 text-stone-800 dark:text-[#f0f3f6]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-[#8b949e] px-2.5 py-1 flex items-center justify-between">
            <span>{t("profiles.allProfiles")}</span>
            <span className="font-mono text-[10px] opacity-70">{profiles.length}</span>
          </div>

          <div className="space-y-0.5 mt-0.5">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSwitchProfile(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-xl text-xs transition-colors text-left group ${
                    isActive
                      ? "bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 font-semibold"
                      : "hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-700 dark:text-[#c9d1d9]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {isActive ? (
                        <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 group-hover:bg-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      {p.targetRole && (
                        <div className="text-[10px] text-stone-400 dark:text-[#8b949e] truncate font-normal">
                          {p.targetRole}
                        </div>
                      )}
                    </div>
                  </div>

                  {p.atsScore !== undefined && (
                    <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#161b22] text-stone-500 dark:text-[#8b949e] border border-stone-200/60 dark:border-[#363d47]">
                      {p.atsScore}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="my-1 border-t border-stone-200/60 dark:border-[#363d47]" />

          <button
            type="button"
            onClick={() => {
              onCreateProfile();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs text-amber-600 dark:text-amber-400 font-bold hover:bg-stone-100 dark:hover:bg-[#30363d] rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("profiles.new")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenProfileManager();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs text-stone-600 dark:text-[#8b949e] hover:text-stone-900 dark:hover:text-[#f0f3f6] hover:bg-stone-100 dark:hover:bg-[#30363d] rounded-xl transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t("profiles.manage")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
