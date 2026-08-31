"use client";

import React from "react";
import type { HobbiesSection, HobbyItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface Props {
  section: HobbiesSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: HobbiesSection) => HobbiesSection) => void;
}

export function HobbiesForm({ section, lang, defaultLang, onChange }: Props) {
  const handleAddItem = () => {
    const newItem: HobbyItem = {
      id: `hob-${generateId()}`,
      name: { [lang]: "" },
      description: { [lang]: "" },
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [...sec.items, newItem],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<HobbyItem>) => {
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
        <span className="font-semibold text-stone-600">
          Interesses e Hobbies ({section.items.length})
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
        >
          <Plus size={13} />
          <span>+ Adicionar Interesse</span>
        </button>
      </div>

      <div className="space-y-3">
        {section.items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border transition-all ${
              item.visible
                ? "bg-white border-stone-300 shadow-2xs"
                : "bg-stone-100/70 border-stone-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100">
              <span className="font-bold text-stone-800 text-xs">
                {item.name?.[lang] || "Novo Interesse"}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item.id)}
                  title={item.visible ? "Ocultar do CV" : "Mostrar no CV"}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded hover:bg-stone-100"
                >
                  {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Remover"
                  className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block font-medium text-stone-600 mb-0.5">
                  Nome da Atividade / Interesse ({lang.toUpperCase()}) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Voluntariado no Hospital / Leitura / Música"
                  value={item.name?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      name: { ...item.name, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-600 mb-0.5">
                  Descrição ou Detalhes ({lang.toUpperCase()})
                </label>
                <input
                  type="text"
                  placeholder="Ex: Participação ativa em projetos culturais comunitários"
                  value={item.description?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      description: { ...item.description, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
