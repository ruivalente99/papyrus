"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { matchJobVacancy, injectMissingSkill, type ATSMatchResult } from "@/lib/atsMatcher";
import { useToast } from "@/context/ToastContext";
import {
  X,
  Target,
  Plus,
  Check,
  AlertCircle,
  Trash2,
  FileText,
  TrendingUp,
} from "lucide-react";

interface Props {
  cv: CVDocument;
  isOpen: boolean;
  onClose: () => void;
  lang?: SupportedLanguage;
  onUpdateCV: (updatedCV: CVDocument) => void;
}

const SAMPLE_JOB_PRESETS: Record<string, { title: { en: string; pt: string }; text: string }> = {
  fullstack: {
    title: { en: "Senior Fullstack Engineer", pt: "Engenheiro Fullstack Sénior" },
    text: `We are looking for a Senior Fullstack Engineer to join our high-growth platform engineering team.
Key Responsibilities:
- Build and maintain modern, accessible user interfaces with React, Next.js, and TypeScript.
- Design resilient REST and GraphQL backend services utilizing Node.js, Express, and PostgreSQL.
- Architect containerized microservices deployed via Docker and Kubernetes on AWS.
- Implement robust automated unit and integration tests using Jest and Cypress.
- Participate in Agile Scrum sprints, code reviews, and mentor junior engineers.
Required Skills:
React, TypeScript, Next.js, Node.js, PostgreSQL, Docker, AWS, GraphQL, CI/CD, Redis, Tailwind CSS, Jest, Agile.`,
  },
  devops: {
    title: { en: "Cloud / DevOps Engineer", pt: "Engenheiro Cloud / DevOps" },
    text: `Seeking an experienced DevOps / Cloud Platform Engineer to scale our infrastructure.
Requirements:
- Strong hands-on experience with AWS, Terraform, Docker, and Kubernetes (EKS).
- Build automated CI/CD deployment pipelines using GitHub Actions and ArgoCD.
- Monitor system reliability, uptime, and latency with Prometheus and Grafana.
- Deep knowledge of Linux administration, networking, security, and Python scripting.
- Champion Infrastructure as Code (IaC) and zero-downtime deployment strategies.`,
  },
  manager: {
    title: { en: "Engineering Manager", pt: "Gestor de Engenharia / EM" },
    text: `Looking for a compassionate and technical Engineering Manager to lead multiple squads.
Requirements:
- Proven experience leading high-performing software engineering teams of 8+ engineers.
- Strong background in software architecture, system design, and Agile delivery methodologies.
- Partner with product managers and cross-functional stakeholders on quarterly roadmaps.
- Foster a culture of technical excellence, continuous feedback, mentoring, and diversity.
- Oversee hiring, team scaling, and budget management.`,
  },
};

export function JobMatcherModal({
  cv,
  isOpen,
  onClose,
  lang = "en",
  onUpdateCV,
}: Props) {
  const isPt = lang === "pt";
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [jobText, setJobText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"missing" | "matched" | "density">("missing");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compute live match result whenever jobText or CV changes
  const matchResult: ATSMatchResult | null = useMemo(() => {
    if (!jobText.trim() || jobText.trim().length < 15) return null;
    return matchJobVacancy(cv, jobText, lang);
  }, [cv, jobText, lang]);

  if (!isOpen || !mounted) return null;

  const handleInjectSkill = (skill: string) => {
    const updated = injectMissingSkill(cv, skill);
    onUpdateCV(updated);
    showToast(
      isPt ? `Competência "${skill}" adicionada ao seu CV!` : `Skill "${skill}" added to your CV!`,
      "success"
    );
  };

  const handleLoadPreset = (key: string) => {
    const preset = SAMPLE_JOB_PRESETS[key];
    if (preset) {
      setJobText(preset.text);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
    if (score >= 60) return "text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50 dark:bg-amber-950/30";
    return "text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-50 dark:bg-rose-950/30";
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case "excellent":
        return isPt ? "Correspondência Excelente" : "Excellent ATS Match";
      case "good":
        return isPt ? "Boa Correspondência" : "Good Match";
      case "moderate":
        return isPt ? "Correspondência Moderada" : "Moderate Match";
      case "low":
      default:
        return isPt ? "Necessita Otimização" : "Needs Tailoring";
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ats-matcher-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-scale"
    >
      <div className="bg-white dark:bg-[#161b22] dark-elevation-card w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl border border-stone-200 dark:border-[#363d47] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-200 dark:border-[#363d47] bg-stone-50/80 dark:bg-[#1c2128]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-2xs">
              <Target size={18} />
            </div>
            <div>
              <h2 id="ats-matcher-modal-title" className="font-bold text-stone-900 dark:text-[#f0f3f6] text-sm sm:text-base">
                {isPt ? "Correspondência ATS de Vagas" : "ATS Job Vacancy Matcher"}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-[#8b949e]">
                {isPt
                  ? "Compare o seu currículo com uma descrição de vaga e descubra palavras-chave em falta."
                  : "Scan your resume against any job description to discover missing ATS keywords."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isPt ? "Fechar comparador" : "Close job matcher"}
            className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-[#30363d] text-stone-500 hover:text-stone-800 dark:hover:text-[#f0f3f6] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Job Description Input (5 cols) */}
          <div className="lg:col-span-6 flex flex-col p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-[#363d47] bg-stone-50/30 dark:bg-[#0d1117]/30 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="job-description-textarea" className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#c9d1d9] flex items-center gap-1.5">
                <FileText size={13} className="text-amber-600 dark:text-amber-400" />
                <span>{isPt ? "Descrição da Vaga" : "Job Description"}</span>
              </label>

              {jobText && (
                <button
                  type="button"
                  onClick={() => setJobText("")}
                  className="text-[11px] text-stone-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} />
                  <span>{isPt ? "Limpar" : "Clear"}</span>
                </button>
              )}
            </div>

            {/* Presets Bar */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10.5px] text-stone-500 dark:text-[#8b949e] shrink-0 font-medium">
                {isPt ? "Exemplos:" : "Samples:"}
              </span>
              {Object.entries(SAMPLE_JOB_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLoadPreset(key)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-[#21262d] hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-[#f0f3f6] hover:text-amber-800 dark:hover:text-amber-300 border border-stone-200 dark:border-[#363d47] rounded-full shadow-2xs transition-colors shrink-0"
                >
                  {isPt ? preset.title.pt : preset.title.en}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              id="job-description-textarea"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder={
                isPt
                  ? "Cole aqui os requisitos da vaga (competências, responsabilidades, tecnologias pedidas)..."
                  : "Paste the job vacancy requirements, responsibilities, and required tech stack here..."
              }
              rows={14}
              className="w-full flex-1 min-h-[180px] p-3 text-xs sm:text-[12.5px] leading-relaxed font-mono bg-white dark:bg-[#161b22] border border-stone-300 dark:border-[#363d47] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition-all shadow-2xs"
            />

            <div className="mt-2 text-[10.5px] text-stone-500 dark:text-[#8b949e] flex justify-between items-center">
              <span>{jobText.trim() ? `${jobText.trim().split(/\s+/).length} ${isPt ? "palavras" : "words"}` : ""}</span>
              <span>{isPt ? "Análise instantânea e offline" : "Offline client-side analysis"}</span>
            </div>
          </div>

          {/* Right Column: ATS Match Score & Keyword Inspector (6 cols) */}
          <div className="lg:col-span-6 flex flex-col p-4 sm:p-5 overflow-y-auto bg-white dark:bg-[#161b22]">
            {!matchResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400 dark:text-[#8b949e]">
                <Target size={40} className="mb-3 text-stone-300 dark:text-[#363d47] stroke-1" />
                <h3 className="font-bold text-sm text-stone-700 dark:text-[#f0f3f6] mb-1">
                  {isPt ? "Aguardando descrição da vaga" : "Awaiting job description"}
                </h3>
                <p className="text-xs max-w-sm">
                  {isPt
                    ? "Cole o texto de uma vaga ou selecione um dos exemplos para ver a pontuação ATS e palavras-chave em falta."
                    : "Paste a job description or choose a sample to calculate match percentage and missing keywords."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score Header Card */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-[#363d47] bg-stone-50/70 dark:bg-[#21262d]/50 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-[#8b949e]">
                      {isPt ? "Pontuação de Correspondência" : "Overall ATS Match"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-[#f0f3f6] flex items-center gap-2">
                      <span>{matchResult.overallScore}%</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getScoreColor(matchResult.overallScore)}`}>
                        {getRatingLabel(matchResult.rating)}
                      </span>
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-[#8b949e] mt-0.5">
                      {isPt
                        ? `${matchResult.summary.matchedCount} termos encontrados de ${matchResult.summary.totalJobKeywords} requisitos chave.`
                        : `${matchResult.summary.matchedCount} matched keywords out of ${matchResult.summary.totalJobKeywords} key requirements.`}
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-base shadow-inner shrink-0" style={{ borderColor: matchResult.overallScore >= 70 ? "#10b981" : matchResult.overallScore >= 50 ? "#f59e0b" : "#f43f5e" }}>
                    {matchResult.overallScore}%
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-stone-200 dark:border-[#363d47] gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("missing")}
                    className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
                      activeTab === "missing"
                        ? "border-amber-600 text-amber-700 dark:text-amber-400"
                        : "border-transparent text-stone-500 hover:text-stone-800 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                    }`}
                  >
                    <AlertCircle size={13} />
                    <span>{isPt ? `Em Falta (${matchResult.missingKeywords.length})` : `Missing (${matchResult.missingKeywords.length})`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("matched")}
                    className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
                      activeTab === "matched"
                        ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                        : "border-transparent text-stone-500 hover:text-stone-800 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                    }`}
                  >
                    <Check size={13} />
                    <span>{isPt ? `Correspondidos (${matchResult.matchedKeywords.length})` : `Matched (${matchResult.matchedKeywords.length})`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("density")}
                    className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
                      activeTab === "density"
                        ? "border-amber-600 text-amber-700 dark:text-amber-400"
                        : "border-transparent text-stone-500 hover:text-stone-800 dark:text-[#8b949e] dark:hover:text-[#f0f3f6]"
                    }`}
                  >
                    <TrendingUp size={13} />
                    <span>{isPt ? "Densidade" : "Density"}</span>
                  </button>
                </div>

                {/* Tab 1: Missing Keywords */}
                {activeTab === "missing" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-stone-500 dark:text-[#8b949e]">
                      {isPt
                        ? "Estes termos foram encontrados na vaga mas não no seu CV. Clique em '+ Adicionar' para injetar a competência no seu perfil."
                        : "These terms appear in the job listing but not in your CV. Click '+ Add' to inject any skill into your active profile."}
                    </p>

                    {matchResult.missingKeywords.length === 0 ? (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                        <Check size={16} />
                        <span>{isPt ? "Parabéns! Nenhuma competência crítica em falta." : "Awesome! No critical keywords missing from this job posting."}</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {matchResult.missingKeywords.map((item) => (
                          <button
                            key={item.term}
                            type="button"
                            onClick={() => handleInjectSkill(item.term)}
                            title={isPt ? `Adicionar '${item.term}' ao CV` : `Add '${item.term}' to CV`}
                            className="group flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 rounded-full transition-all shadow-2xs hover:scale-105 active:scale-95"
                          >
                            <span>{item.term}</span>
                            <span className="text-[10px] text-amber-600/80 dark:text-amber-400 font-mono">({item.countInJob}x)</span>
                            <Plus size={12} className="text-amber-600 dark:text-amber-400 group-hover:rotate-90 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Matched Keywords */}
                {activeTab === "matched" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-stone-500 dark:text-[#8b949e]">
                      {isPt
                        ? "Termos encontrados com sucesso tanto na vaga como no seu currículo."
                        : "Keywords successfully found in both the job description and your resume."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {matchResult.matchedKeywords.map((item) => (
                        <span
                          key={item.term}
                          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 rounded-full shadow-2xs"
                        >
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                          <span>{item.term}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            ({item.countInJob}x vaga / {item.countInCV}x CV)
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Frequency / Density Table */}
                {activeTab === "density" && (
                  <div className="space-y-2">
                    <div className="border border-stone-200 dark:border-[#363d47] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 dark:bg-[#21262d] text-stone-600 dark:text-[#8b949e] font-semibold border-b border-stone-200 dark:border-[#363d47]">
                          <tr>
                            <th className="p-2.5">{isPt ? "Termo" : "Keyword"}</th>
                            <th className="p-2.5 text-center">{isPt ? "Freq. Vaga" : "Job Freq"}</th>
                            <th className="p-2.5 text-center">{isPt ? "Freq. CV" : "CV Freq"}</th>
                            <th className="p-2.5 text-right">{isPt ? "Estado" : "Status"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 dark:divide-[#363d47]">
                          {matchResult.keywordDensity.map((row) => (
                            <tr key={row.term} className="hover:bg-stone-50/50 dark:hover:bg-[#21262d]/50">
                              <td className="p-2.5 font-medium text-stone-900 dark:text-[#f0f3f6]">{row.term}</td>
                              <td className="p-2.5 text-center font-mono">{row.jobFrequency}x</td>
                              <td className="p-2.5 text-center font-mono">{row.cvFrequency}x</td>
                              <td className="p-2.5 text-right font-medium">
                                {row.cvFrequency > 0 ? (
                                  <span className="text-emerald-600 dark:text-emerald-400">✓ {isPt ? "Presente" : "Match"}</span>
                                ) : (
                                  <span className="text-rose-600 dark:text-rose-400">✗ {isPt ? "Falta" : "Missing"}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
