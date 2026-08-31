"use client";

import React from "react";
import type { EducationSection, EducationItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface Props {
  section: EducationSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: EducationSection) => EducationSection) => void;
}

export function EducationForm({ section, lang, onChange }: Props) {
  const isPt = lang === "pt";

  const handleAddItem = () => {
    const newItem: EducationItem = {
      id: `edu-${generateId()}`,
      degree: { [lang]: "" },
      institution: "",
      location: { [lang]: "" },
      startDate: "",
      endDate: "",
      isCurrent: false,
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [newItem, ...sec.items],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<EducationItem>) => {
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

  const handleToggleVisibility = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => (it.id === itemId ? { ...it, visible: !it.visible } : it)),
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-stone-400">
          {isPt ? `Habilitações & Cursos (${section.items.length})` : `Education & Qualifications (${section.items.length})`}
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
        >
          <Plus size={13} />
          <span>{isPt ? "+ Adicionar Formação" : "+ Add Education"}</span>
        </button>
      </div>

      <div className="space-y-3">
        {section.items.map((item, index) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition-all ${
              item.visible
                ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-800 shadow-2xs"
                : "bg-stone-100/70 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800/60 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-stone-700 dark:text-stone-200 text-xs">
                #{index + 1} {item.degree?.[lang] || item.institution || (isPt ? "Nova Formação" : "New Degree")}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item.id)}
                  title={item.visible ? (isPt ? "Ocultar do CV" : "Hide from CV") : (isPt ? "Mostrar no CV" : "Show on CV")}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title={isPt ? "Remover" : "Remove"}
                  className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Grau / Curso" : "Degree / Qualification"} ({lang.toUpperCase()}) *
                  </label>
                  <input
                    type="text"
                    placeholder={isPt ? "Ex: Licenciatura em Engenharia" : "e.g. Bachelor's in Computer Science"}
                    value={item.degree?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        degree: { ...item.degree, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Instituição de Ensino *" : "Institution / University *"}
                  </label>
                  <input
                    type="text"
                    placeholder={isPt ? "Ex: Universidade do Porto" : "e.g. University of Oxford"}
                    value={item.institution}
                    onChange={(e) => handleUpdateItem(item.id, { institution: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Localização" : "Location"} ({lang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    placeholder={isPt ? "Ex: Porto, Portugal" : "e.g. London, UK"}
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
                    {isPt ? "Início" : "Start"} (Ano/Mês)
                  </label>
                  <input
                    type="text"
                    placeholder="2018"
                    value={item.startDate}
                    onChange={(e) => handleUpdateItem(item.id, { startDate: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Fim" : "End"} (Ano/Mês)
                  </label>
                  <input
                    type="text"
                    placeholder="2022"
                    value={item.endDate || ""}
                    onChange={(e) => handleUpdateItem(item.id, { endDate: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Nível QEQ / Distinção" : "EQF Level / Distinction"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nível no QEQ: 6"
                    value={item.qeq || ""}
                    onChange={(e) => handleUpdateItem(item.id, { qeq: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Detalhes / Média" : "Coursework / Honors"} ({lang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    placeholder={isPt ? "Módulos de especialização..." : "Specialization modules..."}
                    value={item.details?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        details: { ...item.details, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
