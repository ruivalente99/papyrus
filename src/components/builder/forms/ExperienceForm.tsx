"use client";

import React from "react";
import type { ExperienceSection, ExperienceItem, SupportedLanguage } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { analyzeXYZBullet, getXYZExample } from "@/lib/xyzEngine";
import { Plus, Trash2, Eye, EyeOff, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  section: ExperienceSection;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: (sec: ExperienceSection) => ExperienceSection) => void;
}

export function ExperienceForm({ section, lang, defaultLang, onChange }: Props) {
  const { t: tr } = useTranslation();

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

  const handleInsertXYZExample = (itemId: string) => {
    const example = getXYZExample(lang);
    onChange((sec) => ({
      ...sec,
      items: sec.items.map((it) => {
        if (it.id !== itemId) return it;
        const highlights = it.highlights || {};
        const rawBullets = highlights[lang] || highlights[defaultLang];
        const currentBullets = Array.isArray(rawBullets) ? [...rawBullets] : [];
        return {
          ...it,
          highlights: {
            ...highlights,
            [lang]: [...currentBullets.filter((b) => b.trim().length > 0), example],
          },
        };
      }),
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-stone-600 dark:text-[#c9d1d9]">
          {tr("builder.forms.experience.title")} ({section.items.length})
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>+ {tr("builder.forms.experience.addRole")}</span>
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
                  ? "bg-white dark:bg-[#161b22] border-stone-300 dark:border-[#30363d] shadow-2xs"
                  : "bg-stone-100/70 dark:bg-[#161b22]/40 border-stone-200 dark:border-[#30363d]/60 opacity-60"
              }`}
            >
              {/* Item Top Bar */}
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-100 dark:border-[#30363d]">
                <span className="font-bold text-stone-700 dark:text-[#f0f3f6] text-xs">
                  #{index + 1} {item.role?.[lang] || item.company || tr("builder.forms.experience.newRole")}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleItemVisibility(item.id)}
                    title={item.visible ? tr("common.actions.hideFromCV") : tr("common.actions.showOnCV")}
                    aria-label={item.visible ? tr("a11y.forms.hideRole") : tr("a11y.forms.showRole")}
                    className="text-stone-500 dark:text-[#8b949e] hover:text-stone-700 dark:hover:text-[#f0f3f6] p-1 rounded hover:bg-stone-100 dark:hover:bg-[#21262d] min-w-[24px] min-h-[24px] flex items-center justify-center"
                  >
                    {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    title={tr("common.actions.remove")}
                    aria-label={tr("a11y.forms.deleteRole")}
                    className="text-stone-500 dark:text-[#8b949e] hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 min-w-[24px] min-h-[24px] flex items-center justify-center"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`exp-${item.id}-role`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                      {tr("builder.forms.experience.role")} ({lang.toUpperCase()}) *
                    </label>
                    <input
                      id={`exp-${item.id}-role`}
                      type="text"
                      placeholder={tr("builder.forms.experience.rolePlaceholder")}
                      value={item.role?.[lang] || ""}
                      onChange={(e) =>
                        handleUpdateItem(item.id, {
                          role: { ...item.role, [lang]: e.target.value },
                        })
                      }
                      className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label htmlFor={`exp-${item.id}-company`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                      {tr("builder.forms.experience.company")} *
                    </label>
                    <input
                      id={`exp-${item.id}-company`}
                      type="text"
                      placeholder={tr("builder.forms.experience.companyPlaceholder")}
                      value={item.company}
                      onChange={(e) => handleUpdateItem(item.id, { company: e.target.value })}
                      className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label htmlFor={`exp-${item.id}-location`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                      {tr("builder.forms.experience.location")} ({lang.toUpperCase()})
                    </label>
                    <input
                      id={`exp-${item.id}-location`}
                      type="text"
                      placeholder={tr("builder.forms.experience.locationPlaceholder")}
                      value={item.location?.[lang] || ""}
                      onChange={(e) =>
                        handleUpdateItem(item.id, {
                          location: { ...item.location, [lang]: e.target.value },
                        })
                      }
                      className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label htmlFor={`exp-${item.id}-start`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                      {tr("builder.forms.experience.startDate")} (YYYY-MM)
                    </label>
                    <input
                      id={`exp-${item.id}-start`}
                      type="text"
                      placeholder="2022-01"
                      value={item.startDate}
                      onChange={(e) => handleUpdateItem(item.id, { startDate: e.target.value })}
                      className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <label htmlFor={`exp-${item.id}-end`} className="font-medium text-stone-600 dark:text-[#c9d1d9]">
                        {tr("builder.forms.experience.endDate")}
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
                        <span>{tr("builder.forms.experience.current")}</span>
                      </label>
                    </div>
                    <input
                      id={`exp-${item.id}-end`}
                      type="text"
                      placeholder={item.isCurrent ? tr("common.status.present") : "2024-05"}
                      disabled={item.isCurrent}
                      value={item.endDate || ""}
                      onChange={(e) => handleUpdateItem(item.id, { endDate: e.target.value })}
                      className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500 disabled:bg-stone-100 dark:disabled:bg-[#161b22]/50 dark:disabled:border-[#2d333b] disabled:text-stone-400 dark:disabled:text-[#6e7681]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`exp-${item.id}-url`} className="block font-medium text-stone-600 dark:text-[#c9d1d9] mb-0.5">
                    {tr("builder.forms.experience.url")}
                  </label>
                  <input
                    id={`exp-${item.id}-url`}
                    type="url"
                    placeholder="https://company.com"
                    value={item.url || ""}
                    onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                    className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Bullets / Highlights */}
                <div className="pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-stone-600 dark:text-[#c9d1d9]">
                      {tr("builder.forms.experience.highlights")} ({lang.toUpperCase()})
                    </label>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleInsertXYZExample(item.id)}
                        className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 transition-colors"
                        title={tr("builder.forms.experience.xyzExample")}
                      >
                        <Sparkles size={11} />
                        <span>{tr("builder.forms.experience.xyzExample")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddBullet(item.id)}
                        className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800"
                      >
                        + {tr("builder.forms.experience.addBullet")}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {bullets.map((bullet, bIdx) => {
                      const xyz = bullet.trim() ? analyzeXYZBullet(bullet, lang) : null;
                      return (
                        <div key={bIdx} className="space-y-1">
                          <div className="flex items-start gap-1.5">
                            <span className="text-stone-400 dark:text-[#8b949e] font-bold mt-1">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => handleUpdateBullet(item.id, bIdx, e.target.value)}
                              placeholder={tr("builder.forms.experience.bulletPlaceholder")}
                              className="flex-1 min-w-0 border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded p-1.5 text-xs focus:ring-1 focus:ring-amber-500 resize-y"
                            />
                            {bullets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBullet(item.id, bIdx)}
                                title={tr("a11y.forms.deleteBullet")}
                                aria-label={tr("a11y.forms.deleteBullet")}
                                className="text-stone-500 dark:text-[#8b949e] hover:text-red-500 dark:hover:text-red-400 mt-1 p-1 min-w-[24px] min-h-[24px] flex items-center justify-center rounded"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          {/* Google XYZ Formula Live Analysis Badge & Actions */}
                          {xyz && (
                            <div className="pl-4 flex flex-wrap items-center gap-1.5 text-[10.5px]">
                              {xyz.score === 100 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold shadow-2xs">
                                  <CheckCircle2 size={10} className="text-emerald-600 dark:text-emerald-400" />
                                  <span>{tr("builder.forms.experience.xyzComplete")}</span>
                                </span>
                              ) : (
                                <>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border shadow-2xs ${
                                      xyz.score >= 60
                                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60"
                                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/60"
                                    }`}
                                  >
                                    <AlertTriangle size={10} />
                                    <span>XYZ {xyz.score}%</span>
                                  </span>

                                  {xyz.isWeakAction && xyz.actionAlternative && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const altStr = xyz.actionAlternative;
                                        if (!altStr) return;
                                        const re = new RegExp(`\\b${xyz.actionVerb}\\b`, "i");
                                        const isCap = /^[A-Z]/.test(xyz.actionVerb || "");
                                        const alt = isCap
                                          ? altStr.charAt(0).toUpperCase() + altStr.slice(1)
                                          : altStr;
                                        handleUpdateBullet(item.id, bIdx, bullet.replace(re, alt));
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-semibold cursor-pointer transition-colors shadow-2xs"
                                      title={tr("builder.forms.experience.xyzReplaceWith", { verb: xyz.actionAlternative })}
                                    >
                                      <span>⚡ {tr("builder.forms.experience.xyzReplaceWith", { verb: xyz.actionAlternative })}</span>
                                    </button>
                                  )}

                                  {!xyz.hasMetric && (
                                    <span className="text-stone-500 dark:text-[#8b949e] italic">
                                      {tr("builder.forms.experience.xyzNeedsMetric")}
                                    </span>
                                  )}

                                  {!xyz.hasMethodology && (
                                    <span className="text-stone-500 dark:text-[#8b949e] italic">
                                      {tr("builder.forms.experience.xyzNeedsMethod")}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
