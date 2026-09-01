"use client";

import React from "react";
import type { CustomSection, CustomSectionItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface Props {
  section: CustomSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: CustomSection) => CustomSection) => void;
}

export function CustomSectionForm({ section, lang, onChange }: Props) {
  const isPt = lang === "pt";

  const handleAddItem = () => {
    const newItem: CustomSectionItem = {
      id: `custom-${generateId()}`,
      title: { [lang]: "" },
      subtitle: { [lang]: "" },
      date: "",
      url: "",
      description: { [lang]: "" },
      notes: { [lang]: "" },
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [...(sec.items || []), newItem],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<CustomSectionItem>) => {
    onChange((sec) => ({
      ...sec,
      items: (sec.items || []).map((it) => (it.id === itemId ? { ...it, ...updater } : it)),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: (sec.items || []).filter((it) => it.id !== itemId),
    }));
  };

  const handleToggleVisibility = (itemId: string) => {
    onChange((sec) => ({
      ...sec,
      items: (sec.items || []).map((it) => (it.id === itemId ? { ...it, visible: !it.visible } : it)),
    }));
  };

  const items = Array.isArray(section.items) ? section.items : [];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-stone-400">
          {isPt ? `Itens Personalizados (${items.length})` : `Custom Items (${items.length})`}
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
        >
          <Plus size={13} />
          <span>{isPt ? "+ Adicionar Item" : "+ Add Item"}</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition-all ${
              item.visible
                ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-800 shadow-2xs"
                : "bg-stone-100/70 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800/60 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-stone-800 dark:text-stone-200 text-xs">
                {item.title?.[lang] || (isPt ? "Novo Item" : "New Item")}
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
                  title={isPt ? "Remover item" : "Remove item"}
                  className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Título do Item" : "Item Title"} ({lang.toUpperCase()}) *
                  </label>
                  <input
                    type="text"
                    placeholder={isPt ? "Ex: Orador Convidado na Conferência X" : "e.g. Keynote Speaker / Project Lead"}
                    value={item.title?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        title: { ...item.title, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Data / Ano (Opcional)" : "Date / Year (Optional)"}
                  </label>
                  <input
                    type="text"
                    placeholder="2025"
                    value={item.date || ""}
                    onChange={(e) => handleUpdateItem(item.id, { date: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Subtítulo / Entidade (Opcional)" : "Subtitle / Organization (Optional)"} ({lang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    placeholder={isPt ? "Ex: Universidade do Porto" : "e.g. University of Oxford"}
                    value={item.subtitle?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        subtitle: { ...item.subtitle, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Link / URL (Opcional)" : "Link / URL (Optional)"}
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={item.url || ""}
                    onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                  {isPt ? "Descrição / Conteúdo (Opcional)" : "Description / Content (Optional)"} ({lang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isPt
                      ? "Descreva este item com detalhes e conquistas..."
                      : "Describe this custom item in detail with notable highlights..."
                  }
                  value={item.description?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      description: { ...item.description, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded p-1.5 text-xs focus:ring-1 focus:ring-amber-500 resize-y"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
