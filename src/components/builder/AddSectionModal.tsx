"use client";

import React, { useState } from "react";
import type { SectionType, SupportedLanguage } from "@/types/cv";
import { NanoBananaLogo } from "@/components/common/NanoBananaLogo";
import {
  X,
  Plus,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages,
  Award,
  Heart,
  FileText,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  lang: SupportedLanguage;
  onClose: () => void;
  onAddSection: (type: SectionType, customTitle?: string) => void;
}

interface SectionOption {
  type: SectionType;
  icon: any;
  title: { en: string; pt: string };
  desc: { en: string; pt: string };
  badge?: { en: string; pt: string };
}

const AVAILABLE_SECTIONS: SectionOption[] = [
  {
    type: "experience",
    icon: Briefcase,
    title: { en: "Work Experience", pt: "Experiência Profissional" },
    desc: {
      en: "Roles, companies, key achievements, and measurable highlights.",
      pt: "Cargos, empresas, principais conquistas e responsabilidades.",
    },
  },
  {
    type: "education",
    icon: GraduationCap,
    title: { en: "Education & Qualifications", pt: "Formação Académica" },
    desc: {
      en: "Degrees, institutions, academic honors, and coursework.",
      pt: "Licenciaturas, mestrados, instituições e distinções académicas.",
    },
  },
  {
    type: "skills",
    icon: Sparkles,
    title: { en: "Skills & Competencies", pt: "Competências & Tecnologias" },
    desc: {
      en: "Categorized skill groups (e.g. Frontend, Cloud, Soft Skills).",
      pt: "Competências técnicas e interpessoais organizadas por categorias.",
    },
  },
  {
    type: "languages",
    icon: Languages,
    title: { en: "Languages & Proficiency", pt: "Línguas & Idiomas" },
    desc: {
      en: "Language proficiency levels and official CEFR framework (A1–C2).",
      pt: "Níveis de proficiência linguística e quadro de referência CEFR.",
    },
  },
  {
    type: "certifications",
    icon: Award,
    title: { en: "Certifications & Honors", pt: "Certificações & Formações" },
    desc: {
      en: "Accreditations, professional licenses, and credential links.",
      pt: "Certificados profissionais, licenças e credenciais verificáveis.",
    },
  },
  {
    type: "hobbies",
    icon: Heart,
    title: { en: "Interests & Volunteering", pt: "Interesses & Voluntariado" },
    desc: {
      en: "Personal projects, non-profit contributions, and creative pursuits.",
      pt: "Projetos pessoais, voluntariado e atividades extracurriculares.",
    },
  },
  {
    type: "custom",
    icon: FileText,
    title: { en: "Custom Section", pt: "Secção Personalizada" },
    desc: {
      en: "Add any bespoke category with custom title, items, and dates.",
      pt: "Adicione uma secção livre com título e itens à sua escolha.",
    },
    badge: { en: "Flexible", pt: "Livre" },
  },
];

export function AddSectionModal({ isOpen, lang, onClose, onAddSection }: Props) {
  const [selectedType, setSelectedType] = useState<SectionType>("experience");
  const [customTitle, setCustomTitle] = useState("");

  if (!isOpen) return null;

  const isPt = lang === "pt";

  const handleConfirm = () => {
    onAddSection(selectedType, selectedType === "custom" && customTitle.trim() ? customTitle.trim() : undefined);
    setCustomTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header - Charm Style */}
        <div className="px-6 py-4 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <NanoBananaLogo size="sm" />
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {isPt ? "Adicionar Nova Secção" : "Add New Section"}
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-xs">
                {isPt
                  ? "Escolha o tipo de secção que pretende incluir no seu CV."
                  : "Choose the type of block you want to include in your resume."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-full hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Options Grid */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          <div className="grid grid-cols-1 gap-2.5">
            {AVAILABLE_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isSelected = selectedType === sec.type;

              return (
                <button
                  key={sec.type}
                  type="button"
                  onClick={() => setSelectedType(sec.type)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 shadow-xs ring-1 ring-amber-500/30"
                      : "bg-white dark:bg-stone-850/60 border-stone-200 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-colors shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-amber-700 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-bold ${
                          isSelected
                            ? "text-amber-950 dark:text-amber-200"
                            : "text-stone-800 dark:text-stone-200"
                        }`}
                      >
                        {sec.title[lang as "en" | "pt"] || sec.title.en}
                      </h4>
                      {sec.badge && (
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-750 text-stone-700 dark:text-stone-300">
                          {sec.badge[lang as "en" | "pt"] || sec.badge.en}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      {sec.desc[lang as "en" | "pt"] || sec.desc.en}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Section Title Input */}
          {selectedType === "custom" && (
            <div className="pt-2 animate-in fade-in duration-100">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {isPt ? "Título Personalizado da Secção (Opcional)" : "Custom Section Title (Optional)"}
              </label>
              <input
                type="text"
                placeholder={isPt ? "Ex: Publicações, Projetos Open-Source, Bolsas" : "e.g. Publications, Open Source, Awards"}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          )}
        </div>

        {/* Footer Actions - Charm Pills */}
        <div className="px-6 py-3.5 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-full transition-colors shadow-2xs"
          >
            {isPt ? "Cancelar" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-full transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>{isPt ? "Adicionar Secção" : "Add Section"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
