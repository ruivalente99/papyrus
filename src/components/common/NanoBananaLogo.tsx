"use client";

import React from "react";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
}

export function NanoBananaLogo({ size = "md", className = "", glow = false }: Props) {
  const sizeMap = {
    sm: { box: "w-7 h-7 rounded-xl", icon: 15 },
    md: { box: "w-9 h-9 rounded-2xl", icon: 19 },
    lg: { box: "w-12 h-12 rounded-2xl", icon: 26 },
    xl: { box: "w-16 h-16 rounded-3xl", icon: 34 },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95 ${
        current.box
      } bg-amber-500/10 dark:bg-[#161b22] border border-amber-300/70 dark:border-[#363d47] text-amber-600 dark:text-amber-400 ${
        glow
          ? "shadow-sm shadow-amber-500/20 dark:shadow-amber-500/10"
          : "shadow-2xs"
      } ${className}`}
    >
      <svg
        width={current.icon}
        height={current.icon}
        viewBox="0 0 32 32"
        className="transition-transform duration-300 group-hover:rotate-6 select-none pointer-events-none"
      >
        {/* Outer Nano Banana Curve */}
        <path
          d="M7 16c1.5 5 6.5 8 12 8 4.5 0 7-2.5 7-4.5s-2.5-3.5-6-3.5c-5 0-9.5-3-11-7-1-3-.5-6 0-7 1.2 0 2.2 1.8 2.8 3.5.6 1.8 1.8 3.5 4.2 4.5"
          fill="none"
          stroke="url(#bananaGradDynamic)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stem detail */}
        <path
          d="M8 5c-.6 1.2-1.2 2.5-1.2 3.8"
          stroke="#d97706"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="bananaGradDynamic" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
