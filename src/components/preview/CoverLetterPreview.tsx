"use client";

import React from "react";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import type { CoverLetterDocument } from "@/types/coverLetter";
import { getFontFamilyCss } from "@/lib/typography";
import { HeaderQrCode } from "@/components/common/HeaderQrCode";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface CoverLetterPreviewProps {
  letter: CoverLetterDocument;
  cv: CVDocument;
  lang: SupportedLanguage;
  scale?: number;
  pageCount?: number;
}

export function CoverLetterPreview({
  letter,
  cv,
  lang,
  scale = 1,
  pageCount = 1,
}: CoverLetterPreviewProps) {
  const { personalInfo, theme } = cv;
  const { recipient, content } = letter;

  const t = (val: { [k: string]: string | undefined } | undefined): string => {
    if (!val) return "";
    if (lang in val && val[lang] !== undefined) return val[lang] ?? "";
    if (cv.defaultLanguage in val && val[cv.defaultLanguage] !== undefined) return val[cv.defaultLanguage] ?? "";
    if ("en" in val && val.en !== undefined) return val.en ?? "";
    return Object.values(val)[0] || "";
  };

  const fontFamilyCss = getFontFamilyCss(theme.fontFamily);
  const primaryColor = theme.primaryColor || "#004f90";

  // Density Spacing presets matching CV controls (cv.theme.fontSize)
  const spacing = cv.theme.fontSize || "normal";
  const spacingStyles = {
    compact: {
      padding: "p-8 sm:p-10",
      headerPb: "pb-4 mb-5",
      recipientMb: "mb-5",
      bodySpacing: "space-y-2.5 text-[12.5px] leading-normal",
      footerMt: "mt-5 pt-3",
    },
    normal: {
      padding: "p-12 sm:p-14",
      headerPb: "pb-6 mb-7",
      recipientMb: "mb-7",
      bodySpacing: "space-y-3.5 text-[13.5px] leading-relaxed",
      footerMt: "mt-8 pt-4",
    },
    spacious: {
      padding: "p-14 sm:p-16",
      headerPb: "pb-7 mb-9",
      recipientMb: "mb-9",
      bodySpacing: "space-y-4 text-[14px] leading-loose",
      footerMt: "mt-10 pt-5",
    },
  }[spacing] || {
    padding: "p-12 sm:p-14",
    headerPb: "pb-6 mb-7",
    recipientMb: "mb-7",
    bodySpacing: "space-y-3.5 text-[13.5px] leading-relaxed",
    footerMt: "mt-8 pt-4",
  };

  // Format date if ISO string (YYYY-MM-DD)
  const formatDate = (rawDate?: string) => {
    if (!rawDate) return "";
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        const [y, m, d] = rawDate.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toLocaleDateString(lang === "pt" ? "pt-PT" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return rawDate;
    } catch {
      return rawDate;
    }
  };

  const formattedDate = formatDate(content.date);
  const senderName = personalInfo.fullName || "Candidate Name";
  const headline = t(personalInfo.headline);
  const location = t(personalInfo.location);
  const signatureName = content.signatureName?.trim() || senderName;

  const linkedinLink = personalInfo.links?.find((s) => s.platform === "linkedin");
  const githubLink = personalInfo.links?.find((s) => s.platform === "github");

  return (
    <div
      data-testid="cover-letter-preview"
      id="cover-letter-canvas"
      className="bg-white text-stone-900 shadow-2xl relative select-text transition-all duration-200 print:shadow-none print:m-0"
      style={{
        width: 794,
        minHeight: Math.max(1123, pageCount * 1123),
        fontFamily: fontFamilyCss,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top center",
      }}
    >
      {/* Top decorative accent bar matching active CV palette */}
      <div
        className="h-2 w-full transition-colors duration-300"
        style={{ backgroundColor: primaryColor }}
      />

      <div className={`${spacingStyles.padding} flex flex-col ${pageCount === 1 ? "justify-between" : "justify-start"} min-h-[1115px]`}>
        {/* Top Section: Sender Header & Contact Row */}
        <div>
          {letter.showSenderHeader && (
            <header className={`border-b border-stone-200/80 ${spacingStyles.headerPb} flex items-start justify-between gap-6`}>
              <div className="flex-1">
                <h1
                  className="text-3xl font-extrabold tracking-tight text-stone-950"
                  style={{ color: primaryColor }}
                >
                  {senderName}
                </h1>
                {headline && (
                  <p className="text-sm font-semibold tracking-wide uppercase text-stone-600 mt-1">
                    {headline}
                  </p>
                )}

                {/* Sender Contact Links Row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-stone-600 font-medium">
                  {personalInfo.email && (
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-stone-950 transition-colors"
                      title={personalInfo.email}
                    >
                      <Mail size={12} className="shrink-0 text-stone-400" />
                      <span>{personalInfo.email}</span>
                    </a>
                  )}

                  {personalInfo.phone && (
                    <a
                      href={`tel:${personalInfo.phone}`}
                      className="inline-flex items-center gap-1.5 hover:text-stone-950 transition-colors"
                      title={personalInfo.phone}
                    >
                      <Phone size={12} className="shrink-0 text-stone-400" />
                      <span>{personalInfo.phone}</span>
                    </a>
                  )}

                  {location && (
                    <span className="inline-flex items-center gap-1.5 text-stone-500">
                      <MapPin size={12} className="shrink-0 text-stone-400" />
                      <span>{location}</span>
                    </span>
                  )}

                  {personalInfo.website && (
                    <a
                      href={personalInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-stone-950 transition-colors"
                    >
                      <Globe size={12} className="shrink-0 text-stone-400" />
                      <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}

                  {linkedinLink?.url && (
                    <a
                      href={linkedinLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-stone-950 transition-colors"
                    >
                      <Linkedin size={12} className="shrink-0 text-stone-400" />
                      <span>{linkedinLink.url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}</span>
                    </a>
                  )}

                  {githubLink?.url && (
                    <a
                      href={githubLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-stone-950 transition-colors"
                    >
                      <Github size={12} className="shrink-0 text-stone-400" />
                      <span>{githubLink.url.replace(/^https?:\/\/(www\.)?github\.com\//, "")}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Vector QR Code (if configured on active CV) */}
              {personalInfo.qrCode?.enabled && (personalInfo.qrCode.url || personalInfo.website || personalInfo.links?.[0]?.url) && (
                <div className="shrink-0 pl-2">
                  <HeaderQrCode
                    url={personalInfo.qrCode.url || personalInfo.website || personalInfo.links?.[0]?.url}
                    label={t(personalInfo.qrCode.label)}
                    size={60}
                    color={primaryColor}
                    style={personalInfo.qrCode.style || "rounded"}
                    showIcon={personalInfo.qrCode.showIcon}
                    iconType={personalInfo.qrCode.iconType || "globe"}
                  />
                </div>
              )}
            </header>
          )}

          {/* Date & Recipient Details */}
          <div className={`grid grid-cols-2 gap-6 ${spacingStyles.recipientMb} text-xs`}>
            {/* Left: Recipient Information */}
            <div className="space-y-1 text-stone-800">
              {recipient.hiringManagerName && (
                <p className="font-bold text-stone-950">{recipient.hiringManagerName}</p>
              )}
              {t(recipient.jobTitle) && (
                <p className="font-medium text-stone-600">{t(recipient.jobTitle)}</p>
              )}
              <p className="font-bold text-stone-900 text-sm">{recipient.companyName}</p>
              {recipient.department && (
                <p className="text-stone-500">{recipient.department}</p>
              )}
              {t(recipient.companyAddress) && (
                <p className="text-stone-600">{t(recipient.companyAddress)}</p>
              )}
              {recipient.cityStateZip && (
                <p className="text-stone-600">{recipient.cityStateZip}</p>
              )}
            </div>

            {/* Right: Date */}
            <div className="text-right">
              {formattedDate && (
                <p className="font-medium text-stone-500 tracking-tight">{formattedDate}</p>
              )}
            </div>
          </div>

          {/* Letter Body */}
          <main className={`${spacingStyles.bodySpacing} text-stone-800 text-justify`}>
            {/* Salutation */}
            {t(content.salutation) && (
              <p className="font-bold text-stone-950 mb-3">{t(content.salutation)}</p>
            )}

            {/* Opening Paragraph */}
            {t(content.opening) && (
              <p data-page-break-avoid="true">{t(content.opening)}</p>
            )}

            {/* Middle Body Paragraphs */}
            {content.bodyParagraphs?.map((para, idx) => {
              const text = t(para);
              if (!text) return null;
              return (
                <p key={idx} data-page-break-avoid="true">
                  {text}
                </p>
              );
            })}

            {/* Closing Paragraph */}
            {t(content.closing) && (
              <p data-page-break-avoid="true">{t(content.closing)}</p>
            )}
          </main>
        </div>

        {/* Bottom Section: Sign-off & Signature */}
        <footer className={spacingStyles.footerMt} data-page-break-avoid="true">
          {t(content.signOff) && (
            <p className="text-[13.5px] font-medium text-stone-800 mb-6">
              {t(content.signOff)}
            </p>
          )}

          {/* Signature Line */}
          <div className="inline-block">
            <p
              className="text-base font-bold tracking-tight text-stone-950"
              style={{ color: primaryColor }}
            >
              {signatureName}
            </p>
            {headline && (
              <p className="text-xs text-stone-500 font-medium mt-0.5">{headline}</p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
