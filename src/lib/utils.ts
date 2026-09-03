import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { translate } from "@/locales";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatDateRange(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean,
  lang: string = "pt"
): string {
  if (!startDate && !endDate && !isCurrent) return "";

  const presentLabel = translate("common.misc.present", lang as any);

  const formatSingle = (d?: string): string => {
    if (!d || typeof d !== "string") return "";
    const trimmed = d.trim();
    if (!trimmed) return "";

    try {
      if (/^\d{4}-\d{2}$/.test(trimmed)) {
        const [yearStr, monthStr] = trimmed.split("-");
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10);
        if (isNaN(y) || isNaN(m) || m < 1 || m > 12) return trimmed;
        const dateObj = new Date(y, m - 1, 1);
        if (isNaN(dateObj.getTime())) return trimmed;
        return dateObj.toLocaleDateString(lang === "pt" ? "pt-PT" : "en-US", {
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      return trimmed;
    }

    return trimmed;
  };

  const startFormatted = formatSingle(startDate);
  if (isCurrent) {
    return startFormatted ? `${startFormatted} — ${presentLabel}` : presentLabel;
  }
  if (!endDate) {
    return startFormatted;
  }
  const endFormatted = formatSingle(endDate);
  if (!startFormatted) return endFormatted;
  return `${startFormatted} — ${endFormatted}`;
}
