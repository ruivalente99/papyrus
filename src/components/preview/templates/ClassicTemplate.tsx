"use client";

import React from "react";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { t, tArray } from "@/lib/i18n";
import { formatDateRange } from "@/lib/utils";
import { renderPlatformIcon } from "@/lib/iconMap";
import { Globe, Mail, Phone, MapPin } from "lucide-react";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
}

export function ClassicTemplate({ cv, lang }: Props) {
  const { personalInfo, sections, theme } = cv;
  const primaryColor = theme.primaryColor || "#004f90";
  const isCompact = theme.fontSize === "compact";
  const isSpacious = theme.fontSize === "spacious";

  return (
    <div
      className={`w-[794px] min-h-[1123px] bg-white text-stone-900 text-left font-sans leading-relaxed tracking-normal box-border overflow-hidden ${
        isCompact ? "p-6" : isSpacious ? "p-10" : "p-8"
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
      {/* Header */}
      <div data-page-break-avoid="true" className="text-center pb-2.5 border-b border-stone-200">
        <h1
          className="text-2xl font-bold tracking-tight uppercase break-words"
          style={{ color: primaryColor }}
        >
          {personalInfo.fullName}
        </h1>

        {personalInfo.headline && (
          <p className="text-xs font-semibold text-stone-600 mt-0.5 uppercase tracking-wider break-words">
            {t(personalInfo.headline, lang, cv.defaultLanguage)}
          </p>
        )}

        {/* Contact info bar */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-stone-600 mt-1.5">
          {personalInfo.website && (
            <a
              href={personalInfo.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
              style={{ color: primaryColor }}
            >
              <Globe size={11} />
              <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
          {personalInfo.email && (
            <a
              href={`mailto:${personalInfo.email}`}
              className="flex items-center gap-1 hover:underline text-stone-700"
            >
              <Mail size={11} />
              <span>{personalInfo.email}</span>
            </a>
          )}
          {personalInfo.phone && (
            <a
              href={`tel:${personalInfo.phone.replace(/[\s()]/g, "")}`}
              className="flex items-center gap-1 hover:underline text-stone-700"
            >
              <Phone size={11} />
              <span>{personalInfo.phone}</span>
            </a>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1 text-stone-700">
              <MapPin size={11} />
              <span>{t(personalInfo.location, lang, cv.defaultLanguage)}</span>
            </span>
          )}
          {personalInfo.links?.map((link) => {
            const label = t(link.label, lang, cv.defaultLanguage) || link.url.replace(/^https?:\/\//, "");
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline"
                style={{ color: primaryColor }}
              >
                {renderPlatformIcon(link.platform, 11)}
                <span>{label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Profile Summary */}
      {personalInfo.summary && t(personalInfo.summary, lang, cv.defaultLanguage) && (
        <div data-page-break-avoid="true" className="mt-2.5">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-0.5 border-b border-stone-300 mb-1"
            style={{ color: primaryColor }}
          >
            {lang === "pt" ? "Perfil Profissional" : "Profile Summary"}
          </h2>
          <p className="text-xs text-stone-700 leading-normal text-justify break-words">
            {t(personalInfo.summary, lang, cv.defaultLanguage)}
          </p>
        </div>
      )}

      {/* Sections */}
      {sections
        .filter((s) => s.visible)
        .map((section) => {
          const sectionTitle = t(section.title, lang, cv.defaultLanguage);

          return (
            <div key={section.id} className="mt-2.5 cv-section">
              <h2
                data-page-break-avoid="true"
                className="text-xs font-bold uppercase tracking-wider pb-0.5 border-b border-stone-300 mb-1.5"
                style={{ color: primaryColor }}
              >
                {sectionTitle}
              </h2>

              {/* Experience */}
              {section.type === "experience" && (
                <div className={isCompact ? "space-y-1.5" : "space-y-2.5"}>
                  {section.items
                    .filter((i) => i.visible)
                    .map((item) => {
                      const role = t(item.role, lang, cv.defaultLanguage);
                      const loc = t(item.location, lang, cv.defaultLanguage);
                      const bullets = tArray(item.highlights, lang, cv.defaultLanguage);

                      return (
                        <div
                          key={item.id}
                          data-page-break-avoid="true"
                          className="text-xs cv-item break-inside-avoid"
                        >
                          <div className="flex justify-between items-baseline gap-2">
                            <div className="break-words flex-1">
                              <span className="font-bold text-stone-900">{role}</span>
                              <span className="text-stone-500 font-normal"> — </span>
                              <span className="italic font-medium text-stone-800">
                                {item.url ? (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline"
                                    style={{ color: primaryColor }}
                                  >
                                    {item.company}
                                  </a>
                                ) : (
                                  item.company
                                )}
                              </span>
                            </div>
                            <div className="text-right text-[10.5px] text-stone-500 shrink-0 italic">
                              {loc ? `${loc} | ` : ""}
                              {formatDateRange(item.startDate, item.endDate, item.isCurrent, lang)}
                            </div>
                          </div>

                          {bullets.length > 0 && (
                            <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-stone-700 text-[10.5px]">
                              {bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="leading-snug break-words">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Education */}
              {section.type === "education" && (
                <div className={isCompact ? "space-y-1.5" : "space-y-2"}>
                  {section.items
                    .filter((i) => i.visible)
                    .map((item) => {
                      const degree = t(item.degree, lang, cv.defaultLanguage);
                      const loc = t(item.location, lang, cv.defaultLanguage);
                      const details = t(item.details, lang, cv.defaultLanguage);

                      return (
                        <div
                          key={item.id}
                          data-page-break-avoid="true"
                          className="text-xs cv-item break-inside-avoid"
                        >
                          <div className="flex justify-between items-baseline gap-2">
                            <div className="break-words flex-1">
                              <span className="font-bold text-stone-900">{degree}</span>
                              <span className="text-stone-500 font-normal"> — </span>
                              <span className="italic font-medium text-stone-800">
                                {item.url ? (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline"
                                    style={{ color: primaryColor }}
                                  >
                                    {item.institution}
                                  </a>
                                ) : (
                                  item.institution
                                )}
                              </span>
                              {item.qeq && (
                                <span className="ml-2 text-[9.5px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-mono">
                                  {item.qeq}
                                </span>
                              )}
                            </div>
                            <div className="text-right text-[10.5px] text-stone-500 shrink-0 italic">
                              {loc ? `${loc} | ` : ""}
                              {formatDateRange(item.startDate, item.endDate, item.isCurrent, lang)}
                            </div>
                          </div>
                          {details && <p className="text-[10.5px] text-stone-600 mt-0.5 break-words">{details}</p>}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Skills */}
              {section.type === "skills" && (
                <div className="space-y-0.5 text-xs">
                  {section.categories
                    .filter((c) => c.visible)
                    .map((cat) => {
                      const catName = t(cat.name, lang, cv.defaultLanguage);
                      return (
                        <div key={cat.id} data-page-break-avoid="true" className="flex gap-2 cv-item">
                          <span className="font-bold text-stone-800 shrink-0 min-w-[130px]">
                            {catName}:
                          </span>
                          <span className="text-stone-700 break-words">{cat.skills.join(", ")}</span>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Languages */}
              {section.type === "languages" && (
                <div data-page-break-avoid="true" className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs cv-item">
                  {section.items
                    .filter((i) => i.visible)
                    .map((item) => {
                      const name = t(item.name, lang, cv.defaultLanguage);
                      const level = t(item.level, lang, cv.defaultLanguage);
                      return (
                        <div key={item.id} className="flex justify-between border-b border-stone-100 py-0.5">
                          <span className="font-semibold text-stone-800">{name}</span>
                          <span className="text-stone-600 italic">
                            {level} {item.cefr ? `(${item.cefr})` : ""}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Certifications */}
              {section.type === "certifications" && (
                <div className="space-y-0.5 text-xs">
                  {section.items
                    .filter((i) => i.visible)
                    .map((item) => {
                      const name = t(item.name, lang, cv.defaultLanguage);
                      return (
                        <div
                          key={item.id}
                          data-page-break-avoid="true"
                          className="flex justify-between items-baseline gap-2 cv-item"
                        >
                          <div className="break-words flex-1">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-stone-900 hover:underline"
                              >
                                • {name}
                              </a>
                            ) : (
                              <span className="font-semibold text-stone-900">• {name}</span>
                            )}
                            <span className="text-stone-500 text-[10.5px] italic"> — {item.issuer}</span>
                          </div>
                          {item.date && (
                            <span className="text-[10.5px] text-stone-500 shrink-0">{item.date}</span>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Hobbies / Custom */}
              {section.type === "hobbies" && (
                <div data-page-break-avoid="true" className="space-y-0.5 text-xs cv-item">
                  {section.items
                    .filter((i) => i.visible)
                    .map((item) => {
                      const name = t(item.name, lang, cv.defaultLanguage);
                      const desc = t(item.description, lang, cv.defaultLanguage);
                      return (
                        <div key={item.id} className="text-stone-700 break-words">
                          <span className="font-semibold text-stone-800">• {name}</span>
                          {desc && <span className="text-stone-600"> — {desc}</span>}
                        </div>
                      );
                    })}
                </div>
              )}

              {section.type === "custom" && (
                <div className="space-y-1 text-xs">
                  {section.items
                    .filter((i) => i.visible)
                    .map((item) => {
                      const title = t(item.title, lang, cv.defaultLanguage);
                      const subtitle = t(item.subtitle, lang, cv.defaultLanguage);
                      const desc = t(item.description, lang, cv.defaultLanguage);
                      return (
                        <div key={item.id} data-page-break-avoid="true" className="break-words cv-item">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-bold text-stone-900 flex-1">{title}</span>
                            {item.date && (
                              <span className="text-[10.5px] text-stone-500 italic shrink-0">{item.date}</span>
                            )}
                          </div>
                          {subtitle && <p className="text-[10.5px] font-medium text-stone-600 italic">{subtitle}</p>}
                          {desc && <p className="text-[10.5px] text-stone-700 mt-0.5">{desc}</p>}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
