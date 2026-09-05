"use client";

import React, { forwardRef } from "react";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { LateralisTemplate } from "./templates/LateralisTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MatrixTemplate } from "./templates/MatrixTemplate";
import { A4_W_PX, A4_H_PX } from "@/lib/pdfExport";

interface Props {
  cv: CVDocument;
  lang: SupportedLanguage;
  onSelectSection?: (sectionId: string) => void;
  highlightedSectionId?: string | null;
}

export const CVPage = forwardRef<HTMLDivElement, Props>(
  ({ cv, lang, onSelectSection, highlightedSectionId }, ref) => {
    const { template } = cv;

    return (
      <div
        ref={ref}
        id="cv-printable-page"
        data-template={template}
        className={`cv-sheet cv-template-${template} bg-white shadow-2xl rounded-xs mx-auto overflow-hidden relative select-none`}
        style={{
          width: `${A4_W_PX}px`,
          minHeight: `${A4_H_PX}px`,
          maxWidth: `${A4_W_PX}px`,
          boxSizing: "border-box",
        }}
      >
        {(template === "classic" || template === "latex") && (
          <ClassicTemplate
            cv={cv}
            lang={lang}
            onSelectSection={onSelectSection}
            highlightedSectionId={highlightedSectionId}
          />
        )}
        {(template === "lateralis" || template === "canva") && (
          <LateralisTemplate
            cv={cv}
            lang={lang}
            onSelectSection={onSelectSection}
            highlightedSectionId={highlightedSectionId}
          />
        )}
        {(template === "matrix" || template === "europass") && (
          <MatrixTemplate
            cv={cv}
            lang={lang}
            onSelectSection={onSelectSection}
            highlightedSectionId={highlightedSectionId}
          />
        )}
      </div>
    );
  }
);

CVPage.displayName = "CVPage";
