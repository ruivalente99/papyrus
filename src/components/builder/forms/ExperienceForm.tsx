"use client";

import React from "react";
import type { ExperienceSection, ExperienceItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";

interface Props {
  section: ExperienceSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: ExperienceSection) => ExperienceSection) => void;
}

export function ExperienceForm({ section, lang, defaultLang, onChange }: Props) {
  const isPt = lang === "pt";

  const handleAddItem = () => {
    const newItem: ExperienceItem = {
      id: `exp-${generateId()}`,
      role: { [lang]: "" },
      company: "",
      location: { [lang]: "" },
      startDate: "",
      endDate: "",
      isCurrent: false,
      highlights: { [lang]: [""] },
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [newItem, ...sec.items],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<ExperienceItem>) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => (it.id === itemId ? { ...it, ...updater } : it)),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.filter((it) => it.id !== itemId),
    }));
  };

  const handleToggleItemVisibility = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => (it.id === itemId ? { ...it, visible: !it.visible } : it)),
    }));
  };

  const handleAddBullet = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => {
        if (it.id !== itemId) return it;
        const highlights = it.highlights || {};
        const currentBullets = Array.isArray(highlights[lang]) ? highlights[lang] : [];
        return {
          ...it,
          highlights: {
            ...highlights,
            [lang]: [...currentBullets, ""],
          },
        };
      }),
    }));
  };

  const handleUpdateBullet = (itemId: string, bulletIndex: number, text: string) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => {
        if (it.id !== itemId) return it;
        const highlights = it.highlights || {};
        const rawBullets = highlights[lang] || highlights[defaultLang];
        const currentBullets = Array.isArray(rawBullets) ? [...rawBullets] : [""];
        currentBullets[bulletIndex] = text;
        return {
          ...it,
          highlights: {
            ...highlights,
            [lang]: currentBullets,
          },
        };
      }),
    }));
  };

  const handleDeleteBullet = (itemId: string, bulletIndex: number) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => {
        if (it.id !== itemId) return it;
        const highlights = it.highlights || {};
        const rawBullets = highlights[lang] || [];
        const currentBullets = Array.isArray(rawBullets)
          ? rawBullets.filter((_, idx) => idx !== bulletIndex)
          : [];
        return {
          ...it,
          highlights: {
            ...highlights,
            [lang]: currentBullets,
          },
        };
      }),
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-stone-400">
          {isPt ? `Cargos e Experiências (${section.items.length})` : `Roles & Experience (${section.items.length})`}
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>{isPt ? "+ Adicionar Cargo" : "+ Add Experience"}</span>
        </button>
      </div>

      <div className="space-y-3">
        {section.items.map((item, index) => {
          const rawBullets = item.highlights?.[lang] || item.highlights?.[defaultLang];
          const bullets = Array.isArray(rawBullets) && rawBullets.length > 0 ? rawBullets : [""];

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.visible
                  ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-800 shadow-2xs"
                  : "bg-stone-100/70 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800/60 opacity-60"
              }`}
            >
              {/* Item Top Bar */}
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="font-bold text-stone-700 dark:text-stone-200 text-xs">
                  #{index + 1} {item.role?.[lang] || item.company || (isPt ? "Novo Cargo" : "New Role")}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleItemVisibility(item.id)}
                    title={item.visible ? (isPt ? "Ocultar do CV" : "Hide from CV") : (isPt ? "Mostrar no CV" : "Show on CV")}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    title={isPt ? "Remover cargo" : "Remove role"}
                    className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                      {isPt ? "Cargo / Função" : "Role / Title"} ({lang.toUpperCase()}) *
                    </label>
                    <input
                      type="text"
                      placeholder={isPt ? "Ex: Engenheiro de Software" : "e.g. Senior Software Engineer"}
                      value={item.role?.[lang] || ""}
                      onChange={(e) =>
                        handleUpdateItem(item.id, {
                          role: { ...item.role, [lang]: e.target.value },
                        })
                      }
                      className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                      {isPt ? "Empresa / Organização *" : "Company / Organization *"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={item.company}
                      onChange={(e) => handleUpdateItem(item.id, { company: e.target.value })}
                      className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                      {isPt ? "Localização" : "Location"} ({lang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      placeholder={isPt ? "Ex: Porto / Híbrido" : "e.g. London / Remote"}
                      value={item.location?.[lang] || ""}
                      onChange={(e) =>
                        handleUpdateItem(item.id, {
                          location: { ...item.location, [lang]: e.target.value },
                        })
                      }
                      className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                      {isPt ? "Data Início" : "Start Date"} (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      placeholder="2022-01"
                      value={item.startDate}
                      onChange={(e) => handleUpdateItem(item.id, { startDate: e.target.value })}
                      className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="font-medium text-stone-600 dark:text-stone-400">
                        {isPt ? "Data Fim" : "End Date"}
                      </label>
                      <label className="flex items-center gap-1 text-[10.5px] text-amber-700 dark:text-amber-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isCurrent}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              isCurrent: e.target.checked,
                              endDate: e.target.checked ? "" : item.endDate,
                            })
                          }
                          className="rounded text-amber-700"
                        />
                        <span>{isPt ? "Atual" : "Current"}</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder={item.isCurrent ? (isPt ? "Presente" : "Present") : "2024-05"}
                      disabled={item.isCurrent}
                      value={item.endDate || ""}
                      onChange={(e) => handleUpdateItem(item.id, { endDate: e.target.value })}
                      className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500 disabled:bg-stone-100 dark:disabled:bg-stone-900/50 disabled:text-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Website da Empresa (URL)" : "Company Website URL"}
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={item.url || ""}
                    onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Bullets / Highlights */}
                <div className="pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-stone-600 dark:text-stone-400">
                      {isPt ? "Pontos-Chave & Responsabilidades" : "Key Highlights & Responsibilities"} ({lang.toUpperCase()})
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddBullet(item.id)}
                      className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800"
                    >
                      {isPt ? "+ Adicionar Ponto" : "+ Add Highlight"}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5">
                        <span className="text-stone-400 font-bold mt-1">•</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(item.id, bIdx, e.target.value)}
                          placeholder={
                            isPt
                              ? "Descreva uma responsabilidade ou conquista mensurável..."
                              : "Describe a core achievement or measurable impact..."
                          }
                          className="flex-1 min-w-0 border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded p-1.5 text-xs focus:ring-1 focus:ring-amber-500 resize-y"
                        />
                        {bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBullet(item.id, bIdx)}
                            className="text-stone-400 hover:text-red-500 mt-1 p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
