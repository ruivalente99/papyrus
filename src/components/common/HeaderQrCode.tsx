"use client";

import React, { useMemo } from "react";
import { generateQrSvgString, type QrStyle, type QrIconType } from "@/lib/qrCode";

export interface HeaderQrCodeProps {
  url?: string;
  label?: string;
  size?: number;
  color?: string;
  bgColor?: string;
  style?: QrStyle;
  showIcon?: boolean;
  iconType?: QrIconType;
  className?: string;
}

export function HeaderQrCode({
  url,
  label,
  size = 64,
  color = "#111827",
  bgColor = "transparent",
  style = "rounded",
  showIcon = false,
  iconType = "globe",
  className = "",
}: HeaderQrCodeProps) {
  const targetUrl = (url || "").trim();

  const svgHtml = useMemo(() => {
    if (!targetUrl) return "";
    try {
      return generateQrSvgString({
        url: targetUrl,
        size,
        color,
        bgColor,
        style,
        showIcon,
        iconType,
      });
    } catch {
      return "";
    }
  }, [targetUrl, size, color, bgColor, style, showIcon, iconType]);

  if (!targetUrl || !svgHtml) return null;

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label || `QR Code: ${targetUrl}`}
      title={targetUrl}
      className={`group inline-flex flex-col items-center justify-center p-1 rounded-xl transition-all hover:scale-105 active:scale-95 ${className}`}
      data-testid="header-qr-code"
    >
      <div
        className="rounded-lg p-1 bg-white/95 shadow-2xs border border-stone-200/90 dark:border-stone-700/60 overflow-hidden flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
      {label && (
        <span className="text-[9px] font-mono font-bold tracking-tight text-stone-500 group-hover:text-stone-900 mt-1 max-w-[80px] truncate text-center transition-colors">
          {label}
        </span>
      )}
    </a>
  );
}
