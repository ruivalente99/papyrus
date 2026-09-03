"use client";

import React, { useState, useRef, useEffect } from "react";
import { ICON_OPTIONS, IconOption, getIconComponent } from "@/lib/iconMap";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronDown, Search, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (iconId: string) => void;
  lang?: string;
}

export function IconPicker({ value, onChange, lang = "en" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const popoverRef = useRef<HTMLDivElement>(null);
  const { t: tr } = useTranslation(lang as any);

  const CurrentIcon = getIconComponent(value);
  const currentOption = ICON_OPTIONS.find((o) => o.id === value);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredIcons = ICON_OPTIONS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", label: tr("builder.iconPicker.all") },
    { id: "dev", label: "Dev & Code" },
    { id: "contact", label: tr("builder.iconPicker.contact") },
    { id: "social", label: "Social" },
    { id: "design", label: "Design" },
    { id: "other", label: tr("builder.iconPicker.other") },
  ];

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={tr("builder.iconPicker.sectionIcon", { name: currentOption?.name || value || "Icon" })}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-2xs transition-all active:scale-98 min-h-[28px]"
        title={tr("builder.iconPicker.title")}
      >
        <CurrentIcon size={14} className="text-amber-700 dark:text-amber-400 shrink-0" />
        <span className="truncate max-w-[85px]">{currentOption?.name || value || "Icon"}</span>
        <ChevronDown size={12} className="text-stone-400" />
      </button>

      {/* Popover Dropdown Grid */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Search bar */}
          <div className="relative mb-2">
            <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr("builder.iconPicker.search")}
              aria-label={tr("builder.iconPicker.search")}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                title={tr("builder.iconPicker.clear")}
                aria-label={tr("builder.iconPicker.clear")}
                className="absolute right-1.5 top-1.5 text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 min-w-[24px] min-h-[24px] flex items-center justify-center rounded-full"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 mb-2 border-b border-stone-100 dark:border-stone-800 text-[10.5px]">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap font-bold transition-all ${
                  selectedCategory === c.id
                    ? "bg-amber-700 text-white shadow-2xs"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {filteredIcons.map((item) => {
              const IconComp = item.icon;
              const isSelected = item.id === value;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center group ${
                    isSelected
                      ? "border-amber-700 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 shadow-xs"
                      : "border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                  title={item.name}
                >
                  <IconComp
                    size={16}
                    className={`transition-transform group-hover:scale-115 ${
                      isSelected ? "text-amber-700 dark:text-amber-400" : "text-stone-600 dark:text-stone-400"
                    }`}
                  />
                  <span className="text-[9px] mt-1 line-clamp-1 w-full font-medium">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <p className="text-center py-4 text-xs text-stone-400">
              {tr("builder.iconPicker.noIcons")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
