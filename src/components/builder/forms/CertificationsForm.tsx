"use client";

import React from "react";
import type { CertificationsSection, CertificationItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";

interface Props {
  section: CertificationsSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: CertificationsSection) => CertificationsSection) => void;
}

export function CertificationsForm({ section, lang, onChange }: Props) {
  const isPt = lang === "pt";

  const handleAddItem = () => {
    const newItem: CertificationItem = {
      id: `cert-${generateId()}`,
      name: { [lang]: "" },
      issuer: "",
      date: "",
      url: "",
      notes: { [lang]: "" },
      visible: true,
    };
    onChange((sec) => ({
      ...sec,
      items: [...(sec.items || []), newItem],
    }));
  };

  const handleUpdateItem = (itemId: string, updater: Partial<CertificationItem>) => {
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
          {isPt ? `Certificações & Licenças (${items.length})` : `Certifications & Credentials (${items.length})`}
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>{isPt ? "+ Adicionar Certificação" : "+ Add Certification"}</span>
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
                {item.name?.[lang] || item.issuer || (isPt ? "Nova Certificação" : "New Certification")}
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
                  title={isPt ? "Remover certificação" : "Remove certification"}
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
                    {isPt ? "Nome da Certificação / Formação" : "Certification / Course Title"} ({lang.toUpperCase()}) *
                  </label>
                  <input
                    type="text"
                    placeholder={isPt ? "Ex: AWS Certified Solutions Architect" : "e.g. AWS Solutions Architect"}
                    value={item.name?.[lang] || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        name: { ...item.name, [lang]: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Entidade Emissora *" : "Issuing Organization *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services / Harvard"
                    value={item.issuer}
                    onChange={(e) => handleUpdateItem(item.id, { issuer: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Data / Ano (Opcional)" : "Date / Year (Optional)"}
                  </label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={item.date || ""}
                    onChange={(e) => handleUpdateItem(item.id, { date: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                    {isPt ? "Link / Credencial Online (Opcional)" : "Credential URL / Verification Link (Optional)"}
                  </label>
                  <input
                    type="url"
                    placeholder="https://credly.com/your-badge"
                    value={item.url || ""}
                    onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                    className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-0.5">
                  {isPt ? "Notas / Nota Final / Horas (Opcional)" : "Notes / Grade / Hours / Details (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={isPt ? "Ex: 120 horas letivas, Nota: 18/20, Com distinção" : "e.g. 120 hours, Grade: 98%, Distinction"}
                  value={item.notes?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      notes: { ...item.notes, [lang]: e.target.value },
                    })
                  }
                  className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
