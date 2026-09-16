"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HelpCircle } from "lucide-react";
import { Tooltip } from "@ruivalente99/bibliotheca/ui";

interface Props {
  content: string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function HelpTooltip({ content, className = "", side = "top" }: Props) {
  const { t: tr } = useTranslation();

  return (
    <Tooltip label={content} side={side} className={className}>
      <button
        type="button"
        aria-label={tr("a11y.helpInfo", { content })}
        className="text-stone-500 hover:text-stone-700 dark:text-[#8b949e] dark:hover:text-[#f0f3f6] transition-colors p-1.5 min-w-[24px] min-h-[24px] flex items-center justify-center rounded-full focus:outline-hidden cursor-pointer"
      >
        <HelpCircle size={13} />
      </button>
    </Tooltip>
  );
}
