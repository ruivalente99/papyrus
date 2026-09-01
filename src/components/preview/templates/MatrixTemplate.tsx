"use client";

import React from "react";
import type {
  CVDocument,
  SupportedLanguage,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
  CertificationsSection,
  HobbiesSection,
} from "@/types/cv";
import { t, tArray } from "@/lib/i18n";
import { formatDateRange } from "@/lib/utils";
import { renderPlatformIcon } from "@/lib/iconMap";
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Languages } from "lucide-react";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
  onSelectSection?: (sectionId: string) => void;
}

export function MatrixTemplate({ cv, lang, onSelectSection }: Props) {
  const { personalInfo, sections, theme } = cv;
  const primaryColor = theme.primaryColor || "#1e3a8a";
  const isCompact = theme.fontSize === "compact";
  const isSpacious = theme.fontSize === "spacious";

  const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) return;
    onSelectSection?.(sectionId);
  };

  const expSection = sections.find((s): s is ExperienceSection => s.type === "experience" && s.visible);
  const eduSection = sections.find((s): s is EducationSection => s.type === "education" && s.visible);
  const langSection = sections.find((s): s is LanguagesSection => s.type === "languages" && s.visible);
  const skillsSection = sections.find((s): s is SkillsSection => s.type === "skills" && s.visible);
  const certSection = sections.find((s): s is CertificationsSection => s.type === "certifications" && s.visible);
  const hobbiesSection = sections.find((s): s is HobbiesSection => s.type === "hobbies" && s.visible);

  return (
    <div
      className={`w-[794px] min-h-[1123px] bg-white text-stone-800 text-left font-sans box-border overflow-hidden ${
        isCompact ? "p-5" : isSpacious ? "p-8" : "p-6"
      }`}
      style={{
        fontFamily:
          theme.fontFamily === "merriweather"
            ? "Merriweather, serif"
            : theme.fontFamily === "roboto-mono"
            ? "monospace"
            : "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Header */}
      <div
        data-page-break-avoid="true"
        onClick={(e) => handleSectionClick("personal", e)}
        className="flex gap-5 items-center pb-3 border-b border-stone-200 cursor-pointer transition-all duration-150 rounded-xs hover:outline-2 hover:outline-dashed hover:outline-amber-500/60 hover:bg-amber-50/20 p-1 -m-1"
        title={lang === "pt" ? "Clique para editar dados pessoais" : "Click to edit personal info"}
      >
        {personalInfo.showPhoto && personalInfo.photoUrl && (
          <div
            className={`w-20 h-20 overflow-hidden border-2 shrink-0 shadow-2xs ${
              personalInfo.photoShape === "circle"
                ? "rounded-full"
                : personalInfo.photoShape === "rounded"
                ? "rounded-xl"
                : "rounded-none"
            }`}
            style={{ borderColor: primaryColor }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-bold tracking-tight break-words leading-none"
            style={{ color: primaryColor }}
          >
            {personalInfo.fullName}
          </h1>
          {personalInfo.headline && (
            <p className="text-xs font-semibold text-stone-600 mt-1 break-words">
              {t(personalInfo.headline, lang, cv.defaultLanguage)}
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600 mt-1.5">
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                className="flex items-center gap-1.5 truncate hover:underline"
              >
                <Mail size={11} className="text-stone-400 shrink-0" />
                <span className="truncate">{personalInfo.email}</span>
              </a>
            )}
            {personalInfo.phone && typeof personalInfo.phone === "string" && (
              <a
                href={`tel:${personalInfo.phone.replace(/[\s()]/g, "")}`}
                className="flex items-center gap-1.5 hover:underline"
              >
                <Phone size={11} className="text-stone-400 shrink-0" />
                <span>{personalInfo.phone}</span>
              </a>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1.5 truncate">
                <MapPin size={11} className="text-stone-400 shrink-0" />
                <span className="truncate">{t(personalInfo.location, lang, cv.defaultLanguage)}</span>
              </span>
            )}
            {personalInfo.website && typeof personalInfo.website === "string" && (
              <a
                href={personalInfo.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:underline truncate"
                style={{ color: primaryColor }}
              >
                <Globe size={11} className="shrink-0" />
                <span className="truncate">{personalInfo.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
            {Array.isArray(personalInfo.links) &&
              personalInfo.links.map((link) => {
                const label =
                  t(link.label, lang, cv.defaultLanguage) ||
                  (typeof link.url === "string" ? link.url.replace(/^https?:\/\//, "") : "");
                return (
                  <a
                    key={link.id}
                    href={link.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:underline truncate"
                    style={{ color: primaryColor }}
                  >
                    {renderPlatformIcon(link.platform, 11, "shrink-0")}
                    <span className="truncate">{label}</span>
                  </a>
                );
              })}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-3 gap-5 mt-3">
        {/* Left 2 Cols: Experience & Education */}
        <div className={`col-span-2 min-w-0 ${isCompact ? "space-y-2.5" : "space-y-3.5"}`}>
          {/* Experience */}
          {expSection && (
            <div
              onClick={(e) => handleSectionClick(expSection.id, e)}
              className="cv-section cursor-pointer transition-all duration-150 rounded-xs hover:outline-2 hover:outline-dashed hover:outline-amber-500/60 hover:bg-amber-50/20 p-1 -m-1"
              title={lang === "pt" ? `Clique para editar ${t(expSection.title, lang, cv.defaultLanguage)}` : `Click to edit ${t(expSection.title, lang, cv.defaultLanguage)}`}
            >
              <div
                data-page-break-avoid="true"
                className="flex items-center gap-1.5 pb-0.5 border-b mb-2"
                style={{ borderColor: primaryColor }}
              >
                <Briefcase size={13} style={{ color: primaryColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  {t(expSection.title, lang, cv.defaultLanguage)}
                </h2>
              </div>

              <div className={isCompact ? "space-y-2" : "space-y-2.5"}>
                {(Array.isArray(expSection.items) ? expSection.items : [])
                  .filter((i) => i && i.visible)
                  .map((item) => {
                    const role = t(item.role, lang, cv.defaultLanguage);
                    const loc = t(item.location, lang, cv.defaultLanguage);
                    const bullets = tArray(item.highlights, lang, cv.defaultLanguage);

                    return (
                      <div
                        key={item.id}
                        data-page-break-avoid="true"
                        className="text-xs min-w-0 cv-item break-inside-avoid"
                      >
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-stone-900 text-[11px] break-words flex-1">
                            {role}
                          </span>
                          <span className="text-[9.5px] text-stone-500 font-medium italic shrink-0">
                            {formatDateRange(item.startDate, item.endDate, item.isCurrent, lang)}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-stone-600 font-medium break-words">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              {item.company}
                            </a>
                          ) : (
                            item.company
                          )}{" "}
                          {loc ? `| ${loc}` : ""}
                        </div>
                        {bullets.length > 0 && (
                          <div className="mt-0.5 space-y-0.5 text-[10px] text-stone-700 text-justify">
                            {bullets.map((b, idx) => (
                              <p key={idx} className="leading-snug break-words">
                                • {b}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Education */}
          {eduSection && (
            <div
              onClick={(e) => handleSectionClick(eduSection.id, e)}
              className="cv-section cursor-pointer transition-all duration-150 rounded-xs hover:outline-2 hover:outline-dashed hover:outline-amber-500/60 hover:bg-amber-50/20 p-1 -m-1"
              title={lang === "pt" ? `Clique para editar ${t(eduSection.title, lang, cv.defaultLanguage)}` : `Click to edit ${t(eduSection.title, lang, cv.defaultLanguage)}`}
            >
              <div
                data-page-break-avoid="true"
                className="flex items-center gap-1.5 pb-0.5 border-b mb-2"
                style={{ borderColor: primaryColor }}
              >
                <GraduationCap size={13} style={{ color: primaryColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  {t(eduSection.title, lang, cv.defaultLanguage)}
                </h2>
              </div>

              <div className={isCompact ? "space-y-1.5" : "space-y-2"}>
                {(Array.isArray(eduSection.items) ? eduSection.items : [])
                  .filter((i) => i && i.visible)
                  .map((item) => {
                    const degree = t(item.degree, lang, cv.defaultLanguage);
                    const loc = t(item.location, lang, cv.defaultLanguage);
                    const details = t(item.details, lang, cv.defaultLanguage);

                    return (
                      <div
                        key={item.id}
                        data-page-break-avoid="true"
                        className="text-xs min-w-0 cv-item break-inside-avoid"
                      >
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-stone-900 text-[11px] break-words flex-1">
                            {degree}
                          </span>
                          <span className="text-[9.5px] text-stone-500 font-medium italic shrink-0">
                            {formatDateRange(item.startDate, item.endDate, item.isCurrent, lang)}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-600 break-words">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              {item.institution}
                            </a>
                          ) : (
                            item.institution
                          )}{" "}
                          {loc ? `| ${loc}` : ""}
                        </div>
                        {item.qeq && (
                          <span className="inline-block mt-0.5 text-[9px] text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded font-mono">
                            {item.qeq}
                          </span>
                        )}
                        {details && <p className="text-[9.5px] text-stone-600 mt-0.5 break-words">{details}</p>}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col */}
        <div className={`col-span-1 min-w-0 ${isCompact ? "space-y-2.5" : "space-y-3.5"}`}>
          {/* Languages */}
          {langSection && (
            <div
              onClick={(e) => handleSectionClick(langSection.id, e)}
              className="cv-section cursor-pointer transition-all duration-150 rounded-xs hover:outline-2 hover:outline-dashed hover:outline-amber-500/60 hover:bg-amber-50/20 p-1 -m-1"
              title={lang === "pt" ? `Clique para editar ${t(langSection.title, lang, cv.defaultLanguage)}` : `Click to edit ${t(langSection.title, lang, cv.defaultLanguage)}`}
            >
              <div
                data-page-break-avoid="true"
                className="flex items-center gap-1.5 pb-0.5 border-b mb-1.5"
                style={{ borderColor: primaryColor }}
              >
                <Languages size={13} style={{ color: primaryColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  {t(langSection.title, lang, cv.defaultLanguage)}
                </h2>
              </div>

              <div className="space-y-1 text-xs">
                {(Array.isArray(langSection.items) ? langSection.items : [])
                  .filter((i) => i && i.visible)
                  .map((item) => (
                    <div
                      key={item.id}
                      data-page-break-avoid="true"
                      className="bg-stone-50 p-1.5 rounded border border-stone-200 cv-item break-inside-avoid"
                    >
                      <div className="flex justify-between items-baseline font-semibold text-stone-900">
                        <span className="text-[10.5px]">{t(item.name, lang, cv.defaultLanguage)}</span>
                        <span className="text-[9.5px] text-stone-600 font-normal italic">
                          {item.cefr || t(item.level, lang, cv.defaultLanguage)}
                        </span>
                      </div>
                      {item.details && (
                        <div className="grid grid-cols-2 gap-0.5 mt-0.5 text-[9px] text-stone-500">
                          {item.details.listening && <span>L: {item.details.listening}</span>}
                          {item.details.reading && <span>R: {item.details.reading}</span>}
                          {item.details.spokenInteraction && (
                            <span>S: {item.details.spokenInteraction}</span>
                          )}
                          {item.details.writing && <span>W: {item.details.writing}</span>}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skillsSection && (
            <div
              onClick={(e) => handleSectionClick(skillsSection.id, e)}
              className="cv-section cursor-pointer transition-all duration-150 rounded-xs hover:outline-2 hover:outline-dashed hover:outline-amber-500/60 hover:bg-amber-50/20 p-1 -m-1"
              title={lang === "pt" ? `Clique para editar ${t(skillsSection.title, lang, cv.defaultLanguage)}` : `Click to edit ${t(skillsSection.title, lang, cv.defaultLanguage)}`}
            >
              <h2
                data-page-break-avoid="true"
                className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b text-stone-900"
                style={{ borderColor: primaryColor }}
              >
                {t(skillsSection.title, lang, cv.defaultLanguage)}
              </h2>
              <div className="space-y-1.5">
                {(Array.isArray(skillsSection.categories) ? skillsSection.categories : [])
                  .filter((c) => c && c.visible)
                  .map((cat) => (
                    <div key={cat.id} data-page-break-avoid="true" className="cv-item">
                      {cat.name && (
                        <p className="text-[9.5px] font-semibold text-stone-600 mb-0.5">
                          {t(cat.name, lang, cv.defaultLanguage)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(cat.skills) ? cat.skills : []).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[9px] bg-stone-100 border border-stone-200 text-stone-800 px-1.5 py-0.2 rounded"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certSection && (
            <div
              onClick={(e) => handleSectionClick(certSection.id, e)}
              className="cv-section cursor-pointer transition-all duration-150 rounded-xs hover:outline-2 hover:outline-dashed hover:outline-amber-500/60 hover:bg-amber-50/20 p-1 -m-1"
              title={lang === "pt" ? `Clique para editar ${t(certSection.title, lang, cv.defaultLanguage)}` : `Click to edit ${t(certSection.title, lang, cv.defaultLanguage)}`}
            >
              <h2
                data-page-break-avoid="true"
                className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-1 border-b text-stone-900"
                style={{ borderColor: primaryColor }}
              >
                {t(certSection.title, lang, cv.defaultLanguage)}
              </h2>
              <div className="space-y-1 text-xs">
                {(Array.isArray(certSection.items) ? certSection.items : [])
                  .filter((i) => i && i.visible)
                  .map((item) => {
                    const notes = t(item.notes, lang, cv.defaultLanguage);
                    return (
                      <div
                        key={item.id}
                        data-page-break-avoid="true"
                        className="text-[10px] text-stone-800 break-words cv-item"
                      >
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold hover:underline"
                          >
                            {t(item.name, lang, cv.defaultLanguage)}
                          </a>
                        ) : (
                          <span className="font-semibold">{t(item.name, lang, cv.defaultLanguage)}</span>
                        )}
                        <span className="text-stone-500 block text-[9px]">
                          {item.issuer} {item.date ? `(${item.date})` : ""} {notes ? `• ${notes}` : ""}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {hobbiesSection && (
            <div
              onClick={(e) => handleSectionClick(hobbiesSection.id, e)}
              className="cv-section cursor-pointer transition-all duration-150 rounded-xs hover:outline-2 hover:outline-dashed hover:outline-amber-500/60 hover:bg-amber-50/20 p-1 -m-1"
              title={lang === "pt" ? `Clique para editar ${t(hobbiesSection.title, lang, cv.defaultLanguage)}` : `Click to edit ${t(hobbiesSection.title, lang, cv.defaultLanguage)}`}
            >
              <h2
                data-page-break-avoid="true"
                className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-1 border-b text-stone-900"
                style={{ borderColor: primaryColor }}
              >
                {t(hobbiesSection.title, lang, cv.defaultLanguage)}
              </h2>
              <ul className="space-y-0.5 text-xs text-stone-700">
                {(Array.isArray(hobbiesSection.items) ? hobbiesSection.items : [])
                  .filter((i) => i && i.visible)
                  .map((h) => {
                    const desc = t(h.description, lang, cv.defaultLanguage);
                    const notes = t(h.notes, lang, cv.defaultLanguage);
                    return (
                      <li key={h.id} data-page-break-avoid="true" className="text-[10px] break-words cv-item">
                        {h.url ? (
                          <a href={h.url} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
                            • {t(h.name, lang, cv.defaultLanguage)}
                          </a>
                        ) : (
                          <span className="font-semibold">• {t(h.name, lang, cv.defaultLanguage)}</span>
                        )}
                        {desc && <span className="text-stone-500 block ml-2 text-[9px]">{desc}</span>}
                        {notes && <span className="text-blue-900 block ml-2 text-[8.5px] italic">{notes}</span>}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
