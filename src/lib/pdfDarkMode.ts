/**
 * PAPYRUS — Dark Mode PDF Engine for Creative Portfolios
 * Provides high-contrast dark canvas rendering, color inversion styling with
 * photo/QR asset preservation, and metadata tagging for creative portfolios.
 */

export const DARK_PDF_BG_COLOR = "#0f172a"; // Deep Slate 900
export const DARK_PDF_STYLE_ID = "papyrus-dark-pdf-engine-styles";

/**
 * Returns the standard background color used for dark mode PDF canvases.
 */
export function getDarkPdfBackgroundColor(): string {
  return DARK_PDF_BG_COLOR;
}

/**
 * Prepares a DOM element for dark mode screenshot capture by applying
 * high-contrast color inversion while preserving natural hues for photos,
 * QR codes, and designated media assets.
 * Returns a cleanup callback that restores the DOM state.
 */
export function prepareDarkModeElement(element: HTMLElement): () => void {
  if (typeof document === "undefined" || !element) {
    return () => {};
  }

  // Ensure global stylesheet exists
  let styleEl = document.getElementById(DARK_PDF_STYLE_ID) as HTMLStyleElement | null;
  let createdStyle = false;

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = DARK_PDF_STYLE_ID;
    styleEl.textContent = `
      .papyrus-dark-pdf {
        filter: invert(0.93) hue-rotate(180deg) !important;
        background-color: ${DARK_PDF_BG_COLOR} !important;
      }
      .papyrus-dark-pdf img,
      .papyrus-dark-pdf [data-preserve-color="true"],
      .papyrus-dark-pdf [data-qr-code="true"],
      .papyrus-dark-pdf [role="img"] {
        filter: invert(1) hue-rotate(180deg) contrast(1.06) !important;
      }
    `;
    document.head.appendChild(styleEl);
    createdStyle = true;
  }

  element.classList.add("papyrus-dark-pdf");

  return () => {
    try {
      element.classList.remove("papyrus-dark-pdf");
      if (createdStyle && styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    } catch {
      // Graceful cleanup
    }
  };
}

/**
 * Checks if dark mode PDF export is supported in the current runtime environment.
 */
export function isDarkModePdfSupported(): boolean {
  return typeof document !== "undefined" && typeof window !== "undefined";
}
