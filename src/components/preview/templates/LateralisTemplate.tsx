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
  CustomSection,
} from "@/types/cv";
import { t, tArray } from "@/lib/i18n";
import { formatDateRange } from "@/lib/utils";
import { renderPlatformIcon } from "@/lib/iconMap";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
}

export function LateralisTemplate({ cv, lang }: Props) {
  const { personalInfo, sections, theme } = cv;
  const primaryColor = theme.primaryColor || "#005555";
  const secondaryColor = theme.secondaryColor || "#007777";
  const isCompact = theme.fontSize === "compact";
  const isSpacious = theme.fontSize === "spacious";

  const expSection = sections.find((s): s is ExperienceSection => s.type === "experience" && s.visible);
  const eduSection = sections.find((s): s is EducationSection => s.type === "education" && s.visible);
  const certSection = sections.find((s): s is CertificationsSection => s.type === "certifications" && s.visible);
  const customSection = sections.find((s): s is CustomSection => s.type === "custom" && s.visible);

  const skillsSection = sections.find((s): s is SkillsSection => s.type === "skills" && s.visible);
  const langSection = sections.find((s): s is LanguagesSection => s.type === "languages" && s.visible);
  const hobbiesSection = sections.find((s): s is HobbiesSection => s.type === "hobbies" && s.visible);

  return (
    <div
      className="w-[794px] min-h-[1123px] bg-white text-stone-800 text-left flex box-border overflow-hidden"
      style={{
        fontFamily:
          theme.fontFamily === "merriweather"
            ? "Merriweather, serif"
            : theme.fontFamily === "roboto-mono"
            ? "monospace"
            : "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Left Sidebar (255px width) */}
      <div
        className={`w-[255px] shrink-0 text-stone-800 border-r border-stone-200 flex flex-col justify-between box-border ${
          isCompact ? "p-4" : isSpacious ? "p-6" : "p-4.5"
        }`}
        style={{ backgroundColor: "#f6faf9" }}
      >
        <div className={isCompact ? "space-y-3" : isSpacious ? "space-y-4.5" : "space-y-3.5"}>
          {/* Avatar / Photo */}
          {personalInfo.showPhoto && personalInfo.photoUrl && (
            <div data-page-break-avoid="true" className="flex justify-center mb-2">
              <div
                className={`overflow-hidden border-3 shadow-xs ${
                  isCompact ? "w-22 h-22" : "w-24 h-24"
                } ${
                  personalInfo.photoShape === "circle"
                    ? "rounded-full"
                    : personalInfo.photoShape === "rounded"
                    ? "rounded-2xl"
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
            </div>
          )}

          {/* Contact Details */}
          <div data-page-break-avoid="true" className="space-y-1.5 text-xs">
            {personalInfo.phone && typeof personalInfo.phone === "string" && (
              <div className="flex items-center gap-1.5 text-stone-700">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Phone size={9.5} />
                </span>
                <a
                  href={`tel:${personalInfo.phone.replace(/[\s()]/g, "")}`}
                  className="font-medium text-[10.5px] break-all hover:underline"
                >
                  {personalInfo.phone}
                </a>
              </div>
            )}
            {personalInfo.email && (
              <div className="flex items-center gap-1.5 text-stone-700">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Mail size={9.5} />
                </span>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-[10px] font-medium break-all hover:underline"
                >
                  {personalInfo.email}
                </a>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1.5 text-stone-700">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MapPin size={9.5} />
                </span>
                <span className="text-[10.5px] break-words">
                  {t(personalInfo.location, lang, cv.defaultLanguage)}
                </span>
              </div>
            )}
            {personalInfo.website && typeof personalInfo.website === "string" && (
              <div className="flex items-center gap-1.5 text-stone-700">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Globe size={9.5} />
                </span>
                <a
                  href={personalInfo.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[10px] break-all font-medium"
                  style={{ color: primaryColor }}
                >
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {Array.isArray(personalInfo.links) &&
              personalInfo.links.map((link) => {
                const label =
                  t(link.label, lang, cv.defaultLanguage) ||
                  (typeof link.url === "string" ? link.url.replace(/^https?:\/\//, "") : "");
                return (
                  <div key={link.id} className="flex items-center gap-1.5 text-stone-700">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {renderPlatformIcon(link.platform, 9.5)}
                    </span>
                    <a
                      href={link.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-[10px] break-all font-medium"
                      style={{ color: primaryColor }}
                    >
                      {label}
                    </a>
                  </div>
                );
              })}
          </div>

          {/* Languages Sidebar */}
          {langSection && (
            <div data-page-break-avoid="true">
              <h3
                className="text-[11px] font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                {t(langSection.title, lang, cv.defaultLanguage)}
              </h3>
              <div className="space-y-0.5 text-xs">
                {(Array.isArray(langSection.items) ? langSection.items : [])
                  .filter((i) => i && i.visible)
                  .map((item) => (
                    <div key={item.id} className="flex justify-between items-baseline text-[10.5px]">
                      <span className="font-semibold text-stone-800">
                        • {t(item.name, lang, cv.defaultLanguage)}
                      </span>
                      <span className="text-[9.5px] text-stone-600 italic">
                        {item.cefr || t(item.level, lang, cv.defaultLanguage)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Skills Sidebar */}
          {skillsSection && (
            <div data-page-break-avoid="true">
              <h3
                className="text-[11px] font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                {t(skillsSection.title, lang, cv.defaultLanguage)}
              </h3>
              <div className="space-y-1.5">
                {(Array.isArray(skillsSection.categories) ? skillsSection.categories : [])
                  .filter((c) => c && c.visible)
                  .map((cat) => (
                    <div key={cat.id} className="space-y-0.5">
                      {cat.name && (
                        <p className="text-[9.5px] font-semibold text-stone-500 uppercase tracking-wide">
                          {t(cat.name, lang, cv.defaultLanguage)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(cat.skills) ? cat.skills : []).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[9.5px] bg-white border border-teal-200/80 text-stone-800 px-1.5 py-0.2 rounded shadow-2xs font-medium"
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

          {/* Hobbies / Interests Sidebar */}
          {hobbiesSection && (
            <div data-page-break-avoid="true">
              <h3
                className="text-[11px] font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                {t(hobbiesSection.title, lang, cv.defaultLanguage)}
              </h3>
              <ul className="space-y-0.5 text-xs text-stone-700">
                {(Array.isArray(hobbiesSection.items) ? hobbiesSection.items : [])
                  .filter((i) => i && i.visible)
                  .map((hob) => (
                    <li key={hob.id} className="text-[10px] leading-tight">
                      <span className="font-semibold text-stone-800">
                        • {t(hob.name, lang, cv.defaultLanguage)}
                      </span>
                      {hob.description && (
                        <span className="text-[9px] text-stone-500 block ml-2 leading-tight">
                          {t(hob.description, lang, cv.defaultLanguage)}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Right Column */}
      <div
        className={`flex-1 min-w-0 box-border overflow-hidden ${
          isCompact ? "p-4 space-y-2.5" : isSpacious ? "p-5.5 space-y-4" : "p-4.5 space-y-3"
        }`}
      >
        {/* Name and Header */}
        <div data-page-break-avoid="true" className="border-b-2 pb-2" style={{ borderColor: primaryColor }}>
          <h1
            className="text-2xl font-black tracking-wider uppercase leading-none break-words"
            style={{ color: primaryColor }}
          >
            {personalInfo.fullName}
          </h1>
          {personalInfo.headline && (
            <p className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider mt-0.5 break-words">
              {t(personalInfo.headline, lang, cv.defaultLanguage)}
            </p>
          )}
          {personalInfo.summary && t(personalInfo.summary, lang, cv.defaultLanguage) && (
            <p className="text-[10.5px] text-stone-600 mt-1 text-justify leading-snug break-words">
              {t(personalInfo.summary, lang, cv.defaultLanguage)}
            </p>
          )}
        </div>

        {/* Experience Timeline */}
        {expSection && (
          <div className="cv-section">
            <h2
              data-page-break-avoid="true"
              className="text-[11px] font-bold uppercase tracking-wider pb-0.5 mb-2 flex items-center gap-2 border-b"
              style={{ color: primaryColor, borderColor: "#e5e7eb" }}
            >
              <span>{t(expSection.title, lang, cv.defaultLanguage)}</span>
            </h2>

            <div
              className={`relative pl-3.5 border-l-2 ${
                isCompact ? "space-y-1.5" : isSpacious ? "space-y-3" : "space-y-2"
              }`}
              style={{ borderColor: primaryColor }}
            >
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
                      className="relative text-xs min-w-0 cv-item break-inside-avoid"
                    >
                      <span
                        className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-white border-2"
                        style={{ borderColor: primaryColor }}
                      />

                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-stone-900 text-[11px] break-words flex-1">
                          {role}
                        </span>
                        <span className="text-[9.5px] text-stone-500 font-medium italic shrink-0">
                          {formatDateRange(item.startDate, item.endDate, item.isCurrent, lang)}
                        </span>
                      </div>

                      <div className="text-[10px] font-semibold text-teal-800 break-words">
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
                        )}{" "}
                        {loc ? `| ${loc}` : ""}
                      </div>

                      {bullets.length > 0 && (
                        <div className="mt-0.5 space-y-0.5 text-[10px] text-stone-700 text-justify">
                          {bullets.map((bullet, bIdx) => (
                            <p key={bIdx} className="leading-tight break-words">
                              • {bullet}
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

        {/* Education Timeline */}
        {eduSection && (
          <div className="cv-section">
            <h2
              data-page-break-avoid="true"
              className="text-[11px] font-bold uppercase tracking-wider pb-0.5 mb-2 flex items-center gap-2 border-b"
              style={{ color: primaryColor, borderColor: "#e5e7eb" }}
            >
              <span>{t(eduSection.title, lang, cv.defaultLanguage)}</span>
            </h2>

            <div
              className={`relative pl-3.5 border-l-2 ${
                isCompact ? "space-y-1.5" : isSpacious ? "space-y-2.5" : "space-y-2"
              }`}
              style={{ borderColor: secondaryColor }}
            >
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
                      className="relative text-xs min-w-0 cv-item break-inside-avoid"
                    >
                      <span
                        className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-white border-2"
                        style={{ borderColor: secondaryColor }}
                      />
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-stone-900 text-[11px] break-words flex-1">
                          {degree}
                        </span>
                        <span className="text-[9.5px] text-stone-500 font-medium italic shrink-0">
                          {formatDateRange(item.startDate, item.endDate, item.isCurrent, lang)}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-stone-700 break-words">
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
                        <span className="inline-block mt-0.5 text-[9px] text-teal-800 bg-teal-50 px-1 py-0.2 rounded font-medium">
                          {item.qeq}
                        </span>
                      )}
                      {details && (
                        <p className="text-[9.5px] text-stone-600 mt-0.5 leading-snug break-words">
                          {details}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certSection && (
          <div className="cv-section">
            <h2
              data-page-break-avoid="true"
              className="text-[11px] font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b"
              style={{ color: primaryColor, borderColor: "#e5e7eb" }}
            >
              {t(certSection.title, lang, cv.defaultLanguage)}
            </h2>
            <div className="space-y-1 text-xs">
              {(Array.isArray(certSection.items) ? certSection.items : [])
                .filter((i) => i && i.visible)
                .map((item) => (
                  <div
                    key={item.id}
                    data-page-break-avoid="true"
                    className="flex justify-between items-baseline text-[10px] gap-2 cv-item break-inside-avoid"
                  >
                    <div className="break-words flex-1">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-stone-900 hover:underline"
                        >
                          {t(item.name, lang, cv.defaultLanguage)}
                        </a>
                      ) : (
                        <span className="font-semibold text-stone-900">
                          {t(item.name, lang, cv.defaultLanguage)}
                        </span>
                      )}
                      <span className="text-stone-500 italic"> — {item.issuer}</span>
                    </div>
                    {item.date && (
                      <span className="text-[9.5px] text-stone-500 shrink-0">{item.date}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Custom Section */}
        {customSection && (
          <div className="cv-section">
            <h2
              data-page-break-avoid="true"
              className="text-[11px] font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b"
              style={{ color: primaryColor, borderColor: "#e5e7eb" }}
            >
              {t(customSection.title, lang, cv.defaultLanguage)}
            </h2>
            <div className="space-y-1 text-xs">
              {(Array.isArray(customSection.items) ? customSection.items : [])
                .filter((i) => i && i.visible)
                .map((item) => (
                  <div
                    key={item.id}
                    data-page-break-avoid="true"
                    className="text-[10px] min-w-0 cv-item break-inside-avoid"
                  >
                    <div className="flex justify-between items-baseline font-bold text-stone-900 gap-2">
                      <span className="break-words flex-1">{t(item.title, lang, cv.defaultLanguage)}</span>
                      {item.date && (
                        <span className="text-[9.5px] text-stone-500 font-normal italic shrink-0">
                          {item.date}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-stone-600 font-medium italic break-words">
                        {t(item.subtitle, lang, cv.defaultLanguage)}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-stone-700 mt-0.5 leading-snug break-words">
                        {t(item.description, lang, cv.defaultLanguage)}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
