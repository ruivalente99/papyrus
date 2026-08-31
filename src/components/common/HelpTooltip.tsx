"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface Props {
  content: string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function HelpTooltip({ content, className = "", side = "top" }: Props) {
  const [isVisible, setIsVisible] = useState(false);

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
        aria-label="Help information"
        className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-0.5 rounded-full focus:outline-hidden"
      >
        <HelpCircle size={13} />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-[11px] font-normal text-white bg-stone-900/95 dark:bg-stone-800/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-700/50 min-w-[140px] max-w-[220px] text-center leading-snug animate-in fade-in duration-150 pointer-events-none ${sideClasses[side]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
