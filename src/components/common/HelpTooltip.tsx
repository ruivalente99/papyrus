"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HelpCircle } from "lucide-react";

interface Props {
  content: string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function HelpTooltip({ content, className = "", side = "top" }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const { t: tr } = useTranslation();

  const sideClasses = {
    top: "bottom-full mb-1.5 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-1.5 left-1/2 -translate-x-1/2",
    left: "right-full mr-1.5 top-1/2 -translate-y-1/2",
    right: "left-full ml-1.5 top-1/2 -translate-y-1/2",
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible((v) => !v);
        }}
        aria-label={tr("a11y.helpInfo", { content })}
        className="text-stone-500 hover:text-stone-700 dark:text-[#8b949e] dark:hover:text-[#f0f3f6] transition-colors p-1.5 min-w-[24px] min-h-[24px] flex items-center justify-center rounded-full focus:outline-hidden"
      >
        <HelpCircle size={13} />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-[11px] font-normal text-white bg-stone-900/95 dark:bg-[#161b22]/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-700/50 dark:border-[#363d47] min-w-[140px] max-w-[220px] text-center leading-snug animate-in fade-in duration-150 pointer-events-none ${sideClasses[side]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
