import { domToSvg } from "modern-screenshot";
import type { CVDocument, SupportedLanguage } from "@/types/cv";
import { A4_W_PX, A4_H_PX, triggerDownload } from "./pdfExport";

/**
 * Client-side high-precision Vector SVG export of the live DOM preview element.
 * Produces an SVG that can be opened and edited in Figma, Penpot, or Adobe Illustrator.
 */
export async function exportToSvg(
  element: HTMLElement,
  filename: string = "curriculo.svg"
): Promise<void> {
  const svgString = await domToSvg(element, {
    width: A4_W_PX,
    height: element.offsetHeight || A4_H_PX,
  });

  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(blob, filename);
}

/**
 * Escapes XML/SVG special characters
 */
function escapeXml(unsafe: string = ""): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Programmatic Vector SVG generator.
 * Compiles a structured CV document into clean, standard A4 vector SVG markup (794x1123px at 96 DPI)
 * without requiring a browser or headless canvas.
 */
export function exportCVToSvg(cv: CVDocument, lang: SupportedLanguage = "en"): string {
  const p = cv.personalInfo;
  const accent = cv.theme?.primaryColor || "#005555";
  const fullName = escapeXml(p.fullName || "Curriculum Vitae");
  const headline = escapeXml(p.headline?.[lang] || p.headline?.en || "");
  const email = escapeXml(p.email || "");
  const phone = escapeXml(p.phone || "");
  const location = escapeXml(p.location?.[lang] || p.location?.en || "");
  const website = escapeXml(p.website || "");

  let y = 50;
  const marginX = 45;
  const contentWidth = 794 - marginX * 2;

  let bodySvg = "";

  // 1. Header Block
  bodySvg += `  <!-- Header -->\n`;
  bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="bold" fill="#111827">${fullName}</text>\n`;
  y += 24;

  if (headline) {
    bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="${accent}">${headline}</text>\n`;
    y += 20;
  }

  // Contacts
  const contacts: string[] = [];
  if (email) contacts.push(email);
  if (phone) contacts.push(phone);
  if (location) contacts.push(location);
  if (website) contacts.push(website);

  if (contacts.length > 0) {
    bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#4B5563">${contacts.join("  •  ")}</text>\n`;
    y += 18;
  }

  // Decorative Accent Bar
  bodySvg += `  <rect x="${marginX}" y="${y}" width="${contentWidth}" height="2" fill="${accent}" rx="1" />\n`;
  y += 24;

  // 2. Sections Loop
  for (const sec of cv.sections) {
    if (!sec.visible) continue;
    const title = escapeXml(sec.title?.[lang] || sec.title?.en || sec.type.toUpperCase());

    bodySvg += `\n  <!-- Section: ${sec.type} -->\n`;
    bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="bold" fill="${accent}" letter-spacing="0.5">${title.toUpperCase()}</text>\n`;
    bodySvg += `  <line x1="${marginX}" y1="${y + 5}" x2="${marginX + contentWidth}" y2="${y + 5}" stroke="#E5E7EB" stroke-width="1" />\n`;
    y += 24;

    if (sec.type === "experience") {
      const expSec = sec as any;
      for (const item of expSec.items || []) {
        if (!item.visible) continue;
        const role = escapeXml(item.role?.[lang] || item.role?.en || "");
        const comp = escapeXml(item.company || "");
        const dates = escapeXml(`${item.startDate || ""} - ${item.isCurrent ? "Present" : item.endDate || ""}`);

        bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="bold" fill="#1F2937">${role}</text>\n`;
        bodySvg += `  <text x="${794 - marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#6B7280" text-anchor="end">${dates}</text>\n`;
        y += 15;

        if (comp) {
          bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="500" fill="#4B5563">${comp}</text>\n`;
          y += 16;
        }

        const highlights: string[] = item.highlights?.[lang] || item.highlights?.en || [];
        for (const h of highlights) {
          bodySvg += `  <circle cx="${marginX + 4}" cy="${y - 4}" r="2" fill="${accent}" />\n`;
          bodySvg += `  <text x="${marginX + 14}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#374151">${escapeXml(h)}</text>\n`;
          y += 15;
        }
        y += 6;
      }
    } else if (sec.type === "education") {
      const eduSec = sec as any;
      for (const item of eduSec.items || []) {
        if (!item.visible) continue;
        const deg = escapeXml(item.degree?.[lang] || item.degree?.en || "");
        const inst = escapeXml(item.institution || "");
        const dates = escapeXml(`${item.startDate || ""} - ${item.endDate || ""}`);

        bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="bold" fill="#1F2937">${deg}</text>\n`;
        bodySvg += `  <text x="${794 - marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#6B7280" text-anchor="end">${dates}</text>\n`;
        y += 15;
        if (inst) {
          bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#4B5563">${inst}</text>\n`;
          y += 18;
        }
      }
    } else if (sec.type === "skills") {
      const sklSec = sec as any;
      let skillX = marginX;
      for (const cat of sklSec.categories || []) {
        const catName = escapeXml(cat.name?.[lang] || cat.name?.en || "");
        if (catName) {
          bodySvg += `  <text x="${marginX}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="bold" fill="#374151">${catName}:</text>\n`;
          skillX = marginX + 120;
        }

        const tags: string[] = cat.skills || [];
        for (const tag of tags) {
          const tagW = Math.max(30, tag.length * 6.5 + 14);
          if (skillX + tagW > 794 - marginX) {
            y += 20;
            skillX = marginX + (catName ? 120 : 0);
          }
          bodySvg += `  <rect x="${skillX}" y="${y - 12}" width="${tagW}" height="17" rx="8" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="1" />\n`;
          bodySvg += `  <text x="${skillX + tagW / 2}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="9" fill="#1F2937" text-anchor="middle">${escapeXml(tag)}</text>\n`;
          skillX += tagW + 6;
        }
        y += 24;
      }
    } else if (sec.type === "languages") {
      const langSec = sec as any;
      let langX = marginX;
      for (const item of langSec.items || []) {
        if (!item.visible) continue;
        const name = escapeXml(item.language?.[lang] || item.language?.en || "");
        const level = escapeXml(item.proficiency || "");
        const pillText = `${name} (${level})`;
        const pillW = Math.max(50, pillText.length * 6.5 + 16);

        if (langX + pillW > 794 - marginX) {
          y += 22;
          langX = marginX;
        }
        bodySvg += `  <rect x="${langX}" y="${y - 12}" width="${pillW}" height="18" rx="4" fill="${accent}15" stroke="${accent}40" stroke-width="1" />\n`;
        bodySvg += `  <text x="${langX + pillW / 2}" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="9" font-weight="600" fill="${accent}" text-anchor="middle">${pillText}</text>\n`;
        langX += pillW + 8;
      }
      y += 24;
    }
  }

  const svgDoc = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 794 1123" width="794" height="1123">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
      text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>
  </defs>

  <!-- A4 Canvas Background -->
  <rect width="794" height="1123" fill="#FFFFFF" />

${bodySvg}
</svg>`;

  return svgDoc;
}
