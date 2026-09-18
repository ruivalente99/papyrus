import type { TextScale } from "@/types/cv";

/**
 * Returns scoped CSS rules that scale document font sizes according to the active textScale.
 * Scoped attribute selectors guarantee 100% fidelity in both DOM preview and modern-screenshot PDF canvas capture.
 */
export function getCvTextScaleCss(scale?: TextScale, scope: string = ".cv-sheet"): string {
  if (!scale || scale === "md") {
    return "";
  }

  // Exact scale mappings ensuring visible yet proportional differences across preview and PDF
  const scales: Record<"xs" | "sm" | "lg" | "xl", Record<string, string>> = {
    xs: {
      "8px": "6.8px",
      "8.5px": "7.2px",
      "9px": "7.6px",
      "9.5px": "8.0px",
      "10px": "8.5px",
      "10.5px": "8.9px",
      "11px": "9.3px",
      "11.5px": "9.8px",
      "12px": "10.2px",
      "12.5px": "10.6px",
      "13px": "11.0px",
      "13.5px": "11.5px",
      "14px": "11.9px",
      xs: "10.2px",
      sm: "11.9px",
      base: "13.6px",
    },
    sm: {
      "8px": "7.4px",
      "8.5px": "7.8px",
      "9px": "8.3px",
      "9.5px": "8.7px",
      "10px": "9.2px",
      "10.5px": "9.7px",
      "11px": "10.1px",
      "11.5px": "10.6px",
      "12px": "11.0px",
      "12.5px": "11.5px",
      "13px": "12.0px",
      "13.5px": "12.4px",
      "14px": "12.9px",
      xs: "11.0px",
      sm: "12.9px",
      base: "14.7px",
    },
    lg: {
      "8px": "8.8px",
      "8.5px": "9.4px",
      "9px": "9.9px",
      "9.5px": "10.5px",
      "10px": "11.0px",
      "10.5px": "11.6px",
      "11px": "12.1px",
      "11.5px": "12.7px",
      "12px": "13.2px",
      "12.5px": "13.8px",
      "13px": "14.3px",
      "13.5px": "14.9px",
      "14px": "15.4px",
      xs: "13.2px",
      sm: "15.4px",
      base: "17.6px",
    },
    xl: {
      "8px": "9.6px",
      "8.5px": "10.2px",
      "9px": "10.8px",
      "9.5px": "11.4px",
      "10px": "12.0px",
      "10.5px": "12.6px",
      "11px": "13.2px",
      "11.5px": "13.8px",
      "12px": "14.4px",
      "12.5px": "15.0px",
      "13px": "15.6px",
      "13.5px": "16.2px",
      "14px": "16.8px",
      xs: "14.4px",
      sm: "16.8px",
      base: "19.2px",
    },
  };

  const currentMap = scales[scale as keyof typeof scales];
  if (!currentMap) return "";

  const rules: string[] = [];
  for (const [key, val] of Object.entries(currentMap)) {
    if (key.endsWith("px")) {
      rules.push(
        `${scope} [class*="text-[${key}]"], ${scope} .text-\\[${key.replace(".", "\\.")}\\] { font-size: ${val} !important; }`
      );
    } else {
      rules.push(
        `${scope} [class~="text-${key}"], ${scope} .text-${key} { font-size: ${val} !important; }`
      );
    }
  }

  return rules.join("\n");
}
