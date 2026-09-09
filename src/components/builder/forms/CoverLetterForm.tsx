"use client";

import React from "react";
import type { CoverLetterDocument } from "@/types/coverLetter";
import type { SupportedLanguage } from "@/types/cv";
import { COVER_LETTER_PRESETS } from "@/data/seeds/coverLetterSeeds";
import {
  Building2,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Layout,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface CoverLetterFormProps {
  letter: CoverLetterDocument;
  onChange: (updated: CoverLetterDocument) => void;
  lang: SupportedLanguage;
}

export function CoverLetterForm({ letter, onChange, lang }: CoverLetterFormProps) {
  const isPt = lang === "pt";
  const { recipient, content } = letter;

  const getLocalized = (val?: { [k: string]: string | undefined }) => {
    if (!val) return "";
    return val[lang] || val.en || "";
  };

  const updateRecipient = (field: keyof typeof recipient, value: any) => {
    if (field === "jobTitle" || field === "companyAddress") {
      onChange({
        ...letter,
        updatedAt: new Date().toISOString(),
        recipient: {
          ...recipient,
          [field]: {
            ...((recipient[field] as any) || {}),
            [lang]: value,
          },
        },
      });
    } else {
      onChange({
        ...letter,
        updatedAt: new Date().toISOString(),
        recipient: {
          ...recipient,
          [field]: value,
        },
      });
    }
  };

  const updateContentField = (
    field: "salutation" | "opening" | "closing" | "signOff",
    value: string
  ) => {
    onChange({
      ...letter,
      updatedAt: new Date().toISOString(),
      content: {
        ...content,
        [field]: {
          ...(content[field] || {}),
          [lang]: value,
        },
      },
    });
  };

  const updateBodyParagraph = (index: number, value: string) => {
    const updated = [...content.bodyParagraphs];
    updated[index] = {
      ...(updated[index] || {}),
      [lang]: value,
    };
    onChange({
      ...letter,
      updatedAt: new Date().toISOString(),
      content: {
        ...content,
        bodyParagraphs: updated,
      },
    });
  };

  const addBodyParagraph = () => {
    const newPara = {
      en: "In this role, I demonstrated significant achievements by applying core domain expertise, driving measurable efficiency gains and fostering cross-team excellence.",
      pt: "Nesta função, alcancei resultados significativos através da aplicação de competências especializadas, impulsionando ganhos mensuráveis de eficiência e colaboração.",
    };
    onChange({
      ...letter,
      updatedAt: new Date().toISOString(),
      content: {
        ...content,
        bodyParagraphs: [...content.bodyParagraphs, newPara],
      },
    });
  };

  const removeBodyParagraph = (index: number) => {
    const updated = content.bodyParagraphs.filter((_, i) => i !== index);
    onChange({
      ...letter,
      updatedAt: new Date().toISOString(),
      content: {
        ...content,
        bodyParagraphs: updated,
      },
    });
  };

  const moveParagraph = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.bodyParagraphs.length) return;
    const updated = [...content.bodyParagraphs];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    onChange({
      ...letter,
      updatedAt: new Date().toISOString(),
      content: {
        ...content,
        bodyParagraphs: updated,
      },
    });
  };

  const loadPreset = (presetId: string) => {
    const found = COVER_LETTER_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChange({
        ...found,
        id: letter.id,
        currentLanguage: lang,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const setTodayDate = () => {
    const today = new Date().toISOString().split("T")[0];
    onChange({
      ...letter,
      updatedAt: new Date().toISOString(),
      content: {
        ...content,
        date: today,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Preset Starter Loader */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 dark:bg-amber-500/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
            <span>{isPt ? "Modelos de Carta de Apresentação" : "Cover Letter Starter Templates"}</span>
          </h4>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
            {isPt
              ? "Carrega uma estrutura profissional pronta a adaptar à vaga."
              : "Load a high-impact template tailored for specific career tracks."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {COVER_LETTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset.id)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#21262d] border border-amber-200 dark:border-[#363d47] text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-[#30363d] transition-all shadow-2xs"
            >
              {preset.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Information Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#21262d] pb-2.5">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Building2 size={15} className="text-amber-600 dark:text-amber-400" />
            <span>{isPt ? "Destinatário & Empresa" : "Recipient & Company"}</span>
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            {isPt ? "Obrigatório" : "Required"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="cl-company"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Nome da Empresa *" : "Company Name *"}
            </label>
            <input
              id="cl-company"
              type="text"
              value={recipient.companyName}
              onChange={(e) => updateRecipient("companyName", e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="cl-manager"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Nome do Responsável de Seleção" : "Hiring Manager / Team"}
            </label>
            <input
              id="cl-manager"
              type="text"
              value={recipient.hiringManagerName || ""}
              onChange={(e) => updateRecipient("hiringManagerName", e.target.value)}
              placeholder="e.g. Jane Doe, VP of Engineering"
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="cl-job"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Cargo a Concorrer" : "Target Job Title"}
            </label>
            <input
              id="cl-job"
              type="text"
              value={getLocalized(recipient.jobTitle)}
              onChange={(e) => updateRecipient("jobTitle", e.target.value)}
              placeholder="e.g. Senior Frontend Architect"
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="cl-dept"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Departamento / Equipa" : "Department"}
            </label>
            <input
              id="cl-dept"
              type="text"
              value={recipient.department || ""}
              onChange={(e) => updateRecipient("department", e.target.value)}
              placeholder="e.g. Cloud Infrastructure"
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="cl-address"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Morada ou Cidade da Empresa" : "Company Location / Address"}
            </label>
            <input
              id="cl-address"
              type="text"
              value={getLocalized(recipient.companyAddress)}
              onChange={(e) => updateRecipient("companyAddress", e.target.value)}
              placeholder="e.g. Avenida da Liberdade, Lisboa or San Francisco, CA"
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* Letter Content & Flow */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#21262d] pb-2.5">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText size={15} className="text-amber-600 dark:text-amber-400" />
            <span>{isPt ? "Corpo da Carta" : "Letter Content"}</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={setTodayDate}
              title={isPt ? "Definir data de hoje" : "Set today's date"}
              className="text-[11px] font-semibold flex items-center gap-1 text-amber-800 dark:text-amber-400 hover:underline"
            >
              <Calendar size={12} />
              <span>{isPt ? "Hoje" : "Today"}</span>
            </button>
          </div>
        </div>

        {/* Date & Salutation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="cl-date"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Data da Carta" : "Letter Date"}
            </label>
            <input
              id="cl-date"
              type="date"
              value={content.date || ""}
              onChange={(e) =>
                onChange({
                  ...letter,
                  updatedAt: new Date().toISOString(),
                  content: { ...content, date: e.target.value },
                })
              }
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="cl-salutation"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Saudação Inicial" : "Salutation"}
            </label>
            <input
              id="cl-salutation"
              type="text"
              value={getLocalized(content.salutation)}
              onChange={(e) => updateContentField("salutation", e.target.value)}
              placeholder="e.g. Dear Hiring Manager,"
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        {/* Opening Paragraph */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="cl-opening"
              className="text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              {isPt ? "Parágrafo de Abertura (Gancho & Motivação)" : "Opening Paragraph (Hook & Intent)"}
            </label>
            <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
              {isPt ? "Exprime entusiasmo pela empresa" : "Express immediate interest"}
            </span>
          </div>
          <textarea
            id="cl-opening"
            rows={3}
            value={getLocalized(content.opening)}
            onChange={(e) => updateContentField("opening", e.target.value)}
            placeholder={
              isPt
                ? "Escreva como soube da vaga e porque é o candidato ideal..."
                : "State the role you are applying for and why you are drawn to the company..."
            }
            className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 leading-relaxed"
          />
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {isPt ? "Parágrafos de Desenvolvimento (Provas & Impacto)" : "Body Paragraphs (Evidence & Impact)"}
            </label>
            <button
              type="button"
              onClick={addBodyParagraph}
              className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Plus size={12} />
              <span>{isPt ? "Adicionar Parágrafo" : "Add Paragraph"}</span>
            </button>
          </div>

          {content.bodyParagraphs.map((para, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-stone-50/80 dark:bg-[#0d1117]/60 border border-stone-200/80 dark:border-[#30363d] space-y-2 relative group"
            >
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold">
                <span>
                  {isPt ? `Parágrafo ${index + 1}` : `Paragraph ${index + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveParagraph(index, "up")}
                    disabled={index === 0}
                    title={isPt ? "Mover para cima" : "Move up"}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-[#30363d] disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveParagraph(index, "down")}
                    disabled={index === content.bodyParagraphs.length - 1}
                    title={isPt ? "Mover para baixo" : "Move down"}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-[#30363d] disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown size={11} />
                  </button>
                  {content.bodyParagraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBodyParagraph(index)}
                      title={isPt ? "Remover parágrafo" : "Delete paragraph"}
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={3}
                value={getLocalized(para)}
                onChange={(e) => updateBodyParagraph(index, e.target.value)}
                placeholder={
                  isPt
                    ? "Destaque conquistas mensuráveis, projetos de relevância e adequação cultural..."
                    : "Highlight specific achievements, quantifiable metrics, and culture fit..."
                }
                className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 leading-relaxed"
              />
            </div>
          ))}
        </div>

        {/* Closing Paragraph */}
        <div>
          <label
            htmlFor="cl-closing"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            {isPt ? "Parágrafo de Conclusão & Chamada para Ação" : "Closing Paragraph (Call to Action)"}
          </label>
          <textarea
            id="cl-closing"
            rows={2}
            value={getLocalized(content.closing)}
            onChange={(e) => updateContentField("closing", e.target.value)}
            placeholder={
              isPt
                ? "Reitere o interesse, agradeça o tempo e sugira uma entrevista..."
                : "Reiterate enthusiasm, thank the reader, and invite further discussion..."
            }
            className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 leading-relaxed"
          />
        </div>

        {/* Sign-Off & Signature Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div>
            <label
              htmlFor="cl-signoff"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Fórmula de Despedida" : "Sign-Off"}
            </label>
            <input
              id="cl-signoff"
              type="text"
              value={getLocalized(content.signOff)}
              onChange={(e) => updateContentField("signOff", e.target.value)}
              placeholder="e.g. Sincerely,"
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="cl-signname"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              {isPt ? "Nome da Assinatura" : "Signature Name"}
            </label>
            <input
              id="cl-signname"
              type="text"
              value={content.signatureName || ""}
              onChange={(e) =>
                onChange({
                  ...letter,
                  updatedAt: new Date().toISOString(),
                  content: { ...content, signatureName: e.target.value },
                })
              }
              placeholder="Defaults to CV Full Name"
              className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0d1117] border border-stone-200 dark:border-[#30363d] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* Header & Coordinated Styling Options */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout size={15} className="text-amber-600 dark:text-amber-400" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              {isPt ? "Cabeçalho Coordenado com o CV" : "Coordinated CV Header"}
            </h3>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={letter.showSenderHeader}
              onChange={(e) =>
                onChange({
                  ...letter,
                  updatedAt: new Date().toISOString(),
                  showSenderHeader: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer dark:bg-[#30363d] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
          </label>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          {isPt
            ? "Apresenta o cabeçalho idêntico ao do CV (nome, contactos, links e QR Code) para uma imagem visual coerente."
            : "Renders the matching CV header styling (name, contact links, QR code) for consistent visual branding."}
        </p>
      </div>
    </div>
  );
}
