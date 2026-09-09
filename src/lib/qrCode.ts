import qrcode from "qrcode-generator";

export type QrStyle = "classic" | "dots" | "rounded";
export type QrIconType = "globe" | "linkedin" | "github" | "qr";

export interface QrCodeOptions {
  url: string;
  size?: number;
  color?: string;
  bgColor?: string;
  style?: QrStyle;
  margin?: number;
  showIcon?: boolean;
  iconType?: QrIconType;
}

/**
 * Checks if a cell belongs to one of the 3 standard finder patterns (7x7 corners).
 */
export function isFinderPattern(row: number, col: number, count: number): boolean {
  // Top-left
  if (row < 7 && col < 7) return true;
  // Top-right
  if (row < 7 && col >= count - 7) return true;
  // Bottom-left
  if (row >= count - 7 && col < 7) return true;
  return false;
}

/**
 * Checks if a cell is in the central logo cutout area.
 */
export function isCenterArea(row: number, col: number, count: number, radius: number): boolean {
  const center = Math.floor(count / 2);
  return (
    row >= center - radius &&
    row <= center + radius &&
    col >= center - radius &&
    col <= center + radius
  );
}

/**
 * Generates a 2D boolean matrix of QR modules.
 */
export function generateQrMatrix(
  url: string,
  errorCorrection: "L" | "M" | "Q" | "H" = "M"
): boolean[][] {
  const qr = qrcode(0, errorCorrection);
  qr.addData(url);
  qr.make();

  const count = qr.getModuleCount();
  const matrix: boolean[][] = [];
  for (let r = 0; r < count; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < count; c++) {
      row.push(qr.isDark(r, c));
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Generates an SVG string representation of the QR code.
 */
export function generateQrSvgString({
  url,
  size = 120,
  color = "#111827",
  bgColor = "transparent",
  style = "rounded",
  margin = 1,
  showIcon = false,
  iconType = "globe",
}: QrCodeOptions): string {
  // Use higher error correction if an icon is placed in the center
  const ecc = showIcon ? "H" : "M";
  const qr = qrcode(0, ecc);
  qr.addData(url);
  qr.make();

  const count = qr.getModuleCount();
  const totalCells = count + margin * 2;
  const centerRadius = showIcon ? Math.max(2, Math.floor(count * 0.14)) : 0;

  let elements = "";

  // Background
  if (bgColor && bgColor !== "transparent") {
    elements += `<rect width="${totalCells}" height="${totalCells}" fill="${bgColor}" rx="1"/>`;
  }

  // Modules
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      const isDark = qr.isDark(r, c);
      if (!isDark) continue;

      // Skip modules inside center logo cutout
      if (showIcon && isCenterArea(r, c, count, centerRadius)) {
        continue;
      }

      const x = c + margin;
      const y = r + margin;
      const isFinder = isFinderPattern(r, c, count);

      if (isFinder || style === "classic") {
        elements += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
      } else if (style === "dots") {
        elements += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.44" fill="${color}"/>`;
      } else {
        // rounded
        elements += `<rect x="${x}" y="${y}" width="1" height="1" rx="0.32" fill="${color}"/>`;
      }
    }
  }

  // Center Icon Overlay
  if (showIcon) {
    const center = Math.floor(count / 2) + margin;
    const boxSize = centerRadius * 2 + 0.6;
    const boxOffset = center - boxSize / 2 + 0.5;

    // White badge background for the logo
    elements += `<rect x="${boxOffset}" y="${boxOffset}" width="${boxSize}" height="${boxSize}" rx="0.8" fill="#ffffff" stroke="${color}" stroke-width="0.15"/>`;

    const iconX = center - 0.7;
    const iconY = center - 0.7;

    if (iconType === "linkedin") {
      // In LinkedIn badge
      elements += `<g transform="translate(${iconX}, ${iconY}) scale(0.14)" fill="${color}">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </g>`;
    } else if (iconType === "github") {
      // GitHub Octocat silhouette
      elements += `<g transform="translate(${iconX}, ${iconY}) scale(0.14)" fill="${color}">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </g>`;
    } else {
      // Globe
      elements += `<g transform="translate(${iconX}, ${iconY}) scale(0.14)" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </g>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalCells} ${totalCells}" width="${size}" height="${size}" shape-rendering="crispEdges">${elements}</svg>`;
}
