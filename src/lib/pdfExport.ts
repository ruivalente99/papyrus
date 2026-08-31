"use client";

import { jsPDF } from "jspdf";
import { domToCanvas } from "modern-screenshot";

// Standard A4 dimensions at 96 DPI (210mm × 297mm)
export const A4_W_PX = 794;
export const A4_H_PX = 1123;

export interface CapturedPage {
  canvas: HTMLCanvasElement;
  index: number;
  dataUrl: string;
}

export interface PdfLinkAnnotation {
  url: string;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
  pageIndex: number;
}

/**
 * Computes optimal split points (in unscaled layout pixels) to avoid slicing through text elements.
 */
export function calculateSmartPageBreaks(
  el: HTMLElement,
  totalHeight: number,
  pageHeight: number = A4_H_PX
): number[] {
  // If total height is within 1 page plus small tolerance (< 80px), fit into 1 page
  if (totalHeight <= pageHeight + 80) {
    return [totalHeight];
  }

  const parentRect = el.getBoundingClientRect();
  const currentScale = parentRect.width / A4_W_PX || 1;

  // Find all avoid-break elements
  const items = Array.from(
    el.querySelectorAll<HTMLElement>(
      '[data-page-break-avoid="true"], .cv-item, li, p, h1, h2, h3, .cv-section, [data-break-avoid="true"]'
    )
  );

  const itemBoxes = items
    .map((item) => {
      const r = item.getBoundingClientRect();
      return {
        top: (r.top - parentRect.top) / currentScale,
        bottom: (r.bottom - parentRect.top) / currentScale,
        height: r.height / currentScale,
      };
    })
    .filter((box) => box.height > 5 && box.bottom <= totalHeight);

  const breaks: number[] = [];
  let currentY = 0;

  while (currentY + pageHeight < totalHeight) {
    const targetY = currentY + pageHeight;

    // If remaining content after target is negligible (< 70px), end here
    if (totalHeight - targetY < 70) {
      break;
    }

    // Check if any element is intersected by targetY
    const intersectingItem = itemBoxes.find(
      (box) => box.top < targetY && box.bottom > targetY
    );

    let splitY = targetY;

    if (intersectingItem && intersectingItem.top > currentY + pageHeight * 0.6) {
      // Split right above the intersecting item with a small safety margin
      splitY = Math.max(currentY + pageHeight * 0.6, intersectingItem.top - 4);
    } else {
      // Look for the last item that ends cleanly before targetY
      const itemsBefore = itemBoxes.filter(
        (box) => box.bottom <= targetY && box.bottom > currentY + pageHeight * 0.65
      );
      if (itemsBefore.length > 0) {
        const lastItem = itemsBefore[itemsBefore.length - 1];
        splitY = lastItem.bottom + 4;
      }
    }

    breaks.push(splitY);
    currentY = splitY;
  }

  breaks.push(totalHeight);
  return breaks;
}

/**
 * Extracts and maps all <a> links inside the CV element to exact PDF page millimeter coordinates.
 */
export function extractLinkAnnotations(
  el: HTMLElement,
  pageBreaks: number[] = []
): PdfLinkAnnotation[] {
  const annotations: PdfLinkAnnotation[] = [];
  const parentRect = el.getBoundingClientRect();
  const currentScale = parentRect.width / A4_W_PX || 1;
  const mmPerPx = 210 / A4_W_PX;

  const anchors = el.querySelectorAll<HTMLAnchorElement>("a[href]");

  anchors.forEach((a) => {
    const rawHref = a.getAttribute("href")?.trim();
    if (!rawHref || rawHref === "#" || rawHref.startsWith("javascript:")) return;

    let url = rawHref;
    if (
      !url.startsWith("mailto:") &&
      !url.startsWith("tel:") &&
      !/^https?:\/\//i.test(url)
    ) {
      url = `https://${url}`;
    }

    const rect = a.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const unscaledX = (rect.left - parentRect.left) / currentScale;
    const unscaledY = (rect.top - parentRect.top) / currentScale;
    const unscaledW = rect.width / currentScale;
    const unscaledH = rect.height / currentScale;

    // Determine which page this link belongs to based on smart page breaks
    let pageIndex = 0;
    let pageStartY = 0;

    for (let p = 0; p < pageBreaks.length; p++) {
      const prevBreak = p === 0 ? 0 : pageBreaks[p - 1];
      const nextBreak = pageBreaks[p];
      if (unscaledY >= prevBreak && unscaledY < nextBreak) {
        pageIndex = p;
        pageStartY = prevBreak;
        break;
      }
    }

    const yOnPagePx = unscaledY - pageStartY;

    const xMm = unscaledX * mmPerPx;
    const yMm = yOnPagePx * (297 / A4_H_PX);
    const wMm = unscaledW * mmPerPx;
    const hMm = unscaledH * (297 / A4_H_PX);

    annotations.push({
      url,
      xMm: Math.max(0, xMm),
      yMm: Math.max(0, yMm),
      wMm,
      hMm,
      pageIndex,
    });
  });

  return annotations;
}

/**
 * Captures an HTML preview element into page-sized canvases with smart page-break boundaries.
 */
export async function capturePreviewPages(el: HTMLElement): Promise<{
  pages: CapturedPage[];
  pageBreaks: number[];
}> {
  await document.fonts.ready;

  const contentHeight = Math.max(A4_H_PX, el.scrollHeight || el.offsetHeight);
  const pageBreaks = calculateSmartPageBreaks(el, contentHeight, A4_H_PX);

  // If fits in 1 page (or with tolerance), capture at exact A4 height
  const isSinglePage = pageBreaks.length <= 1;

  const full = await domToCanvas(el, {
    scale: 2, // 2x Retina resolution
    width: A4_W_PX,
    height: isSinglePage ? A4_H_PX : contentHeight,
    backgroundColor: "#ffffff",
    style: {
      transform: "none",
      boxShadow: "none",
      margin: "0",
      width: `${A4_W_PX}px`,
      minHeight: `${A4_H_PX}px`,
      maxWidth: `${A4_W_PX}px`,
    },
  });

  if (isSinglePage) {
    return {
      pages: [
        {
          canvas: full,
          index: 0,
          dataUrl: full.toDataURL("image/jpeg", 0.96),
        },
      ],
      pageBreaks: [contentHeight],
    };
  }

  // Multi-page slicing using smart breaks
  const pages: CapturedPage[] = [];

  for (let i = 0; i < pageBreaks.length; i++) {
    const startY = i === 0 ? 0 : pageBreaks[i - 1];
    const endY = pageBreaks[i];
    const sliceHeight = endY - startY;

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = full.width;
    pageCanvas.height = A4_H_PX * 2;

    const ctx = pageCanvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    // Draw the slice onto the page canvas
    const srcY = startY * 2;
    const srcH = Math.min(sliceHeight * 2, full.height - srcY);

    ctx.drawImage(
      full,
      0,
      srcY,
      full.width,
      srcH,
      0,
      0,
      pageCanvas.width,
      srcH
    );

    pages.push({
      canvas: pageCanvas,
      index: i,
      dataUrl: pageCanvas.toDataURL("image/jpeg", 0.96),
    });
  }

  return { pages, pageBreaks };
}

/**
 * Converts captured pages and link annotations into an exact A4 PDF Blob with clickable links
 */
export async function pagesToPdfBlob(
  pages: HTMLCanvasElement[],
  links: PdfLinkAnnotation[] = []
): Promise<Blob> {
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      pdf.addPage("a4", "portrait");
    }
    const imgData = pages[i].toDataURL("image/jpeg", 0.96);
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
  }

  // Embed clickable link annotations onto the corresponding page
  links.forEach((link) => {
    if (link.pageIndex < pages.length) {
      pdf.setPage(link.pageIndex + 1);
      pdf.link(link.xMm, link.yMm, link.wMm, link.hMm, { url: link.url });
    }
  });

  return pdf.output("blob");
}

/**
 * Triggers download of a Blob as a file
 */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15_000);
}

/**
 * Export element to PDF with perfect A4 proportions, smart page-break detection, and clickable hyperlinks
 */
export async function exportToPdf(
  element: HTMLElement,
  filename: string = "curriculo.pdf"
): Promise<void> {
  const { pages, pageBreaks } = await capturePreviewPages(element);
  const linkAnnotations = extractLinkAnnotations(element, pageBreaks);
  const pdfBlob = await pagesToPdfBlob(
    pages.map((p) => p.canvas),
    linkAnnotations
  );
  triggerDownload(pdfBlob, filename);
}

/**
 * Export first page / full CV as high-res PNG image
 */
export async function exportToPng(
  element: HTMLElement,
  filename: string = "curriculo.png"
): Promise<void> {
  const { pages } = await capturePreviewPages(element);
  if (pages.length === 0) return;

  pages[0].canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, filename);
  }, "image/png");
}

/**
 * Direct print using browser print dialog
 */
export function printCV() {
  window.print();
}
