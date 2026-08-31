import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatDateRange(
  startDate: string,
  endDate?: string,
  isCurrent?: boolean,
  lang: string = "pt"
): string {
  if (!startDate) return "";

  const presentLabel = lang === "pt" ? "Atual" : "Present";

  const formatSingle = (d: string) => {
    if (!d) return "";
    // If format is YYYY-MM
    if (/^\d{4}-\d{2}$/.test(d)) {
      const [year, month] = d.split("-");
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      return dateObj.toLocaleDateString(lang === "pt" ? "pt-PT" : "en-US", {
        month: "short",
        year: "numeric",
      });
    }
    // If format is DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      return d;
    }
    return d;
  };

  const startFormatted = formatSingle(startDate);
  if (isCurrent) {
    return `${startFormatted} — ${presentLabel}`;
  }
  if (!endDate) {
    return startFormatted;
  }
  const endFormatted = formatSingle(endDate);
  return `${startFormatted} — ${endFormatted}`;
}
