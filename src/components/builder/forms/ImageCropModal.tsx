"use client";

import React, { useState, useRef, useEffect } from "react";
import { RotateCw, ZoomIn, ZoomOut, Check, X, Move } from "lucide-react";
import { compressImageFile } from "@/lib/imageCompressor";

interface Props {
  isOpen: boolean;
  imageSrc: string;
  shape?: "circle" | "rounded" | "square";
  isPt?: boolean;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  shape = "circle",
  isPt = false,
  onClose,
  onConfirm,
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number }>({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setIsProcessing(false);
    }
  }, [isOpen, imageSrc]);

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.offsetX + dx,
      y: dragStartRef.current.offsetY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApply = async () => {
    if (!imgRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      const size = 400; // Output square size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Draw background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Translate to center
      ctx.save();
      ctx.translate(size / 2, size / 2);

      // Apply offset (scaled to canvas size)
      // Preview box is 240px wide, canvas is 400px wide
      const scaleFactor = size / 240;
      ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply zoom
      ctx.scale(zoom, zoom);

      // Draw image centered
      const img = imgRef.current;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let drawW = size;
      let drawH = size;
      if (imgAspect > 1) {
        drawW = size * imgAspect;
      } else {
        drawH = size / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onConfirm(dataUrl);
      onClose();
    } catch (err) {
      console.error("Crop error:", err);
      if (imgRef.current?.src) {
        onConfirm(imgRef.current.src);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
      ? "rounded-2xl"
      : "rounded-none";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#161b22] border border-stone-200 dark:border-[#30363d] rounded-3xl shadow-2xl p-5 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#30363d] pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-[#f0f3f6]">
              {isPt ? "Ajustar e Recortar Foto" : "Crop & Rotate Photo"}
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-[#8b949e]">
              {isPt ? "Arrasta para centrar, faz zoom ou roda" : "Drag to center, zoom or rotate"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-[#f0f3f6] hover:bg-stone-100 dark:hover:bg-[#21262d] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewport Canvas with Mask */}
        <div className="flex justify-center py-2">
          <div
            className="relative w-60 h-60 bg-stone-900 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center shadow-inner rounded-2xl"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
          >
            {/* Image being dragged/rotated/scaled */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              className="max-w-none pointer-events-none transition-transform duration-75"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                width: "240px",
                height: "240px",
                objectFit: "cover",
              }}
            />

            {/* Cutout Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`w-48 h-48 border-2 border-amber-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ${shapeClass}`}
              />
            </div>

            {/* Drag hint badge */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono pointer-events-none flex items-center gap-1">
              <Move size={10} />
              <span>{isPt ? "Arrasta para posicionar" : "Drag to position"}</span>
            </div>
          </div>
        </div>

        {/* Controls: Zoom & Rotate */}
        <div className="space-y-3 bg-stone-50 dark:bg-[#0d1117] p-3 rounded-2xl border border-stone-200 dark:border-[#30363d]">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
              className="p-1 rounded-md text-stone-600 dark:text-[#8b949e] hover:bg-stone-200 dark:hover:bg-[#21262d]"
              title={isPt ? "Reduzir zoom" : "Zoom out"}
            >
              <ZoomOut size={14} />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-amber-600 h-1.5 rounded-lg bg-stone-300 dark:bg-[#363d47] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
              className="p-1 rounded-md text-stone-600 dark:text-[#8b949e] hover:bg-stone-200 dark:hover:bg-[#21262d]"
              title={isPt ? "Aumentar zoom" : "Zoom in"}
            >
              <ZoomIn size={14} />
            </button>
            <span className="text-[11px] font-mono font-bold w-10 text-right text-stone-700 dark:text-[#c9d1d9]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotate Button */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-[#30363d]">
            <span className="text-xs text-stone-600 dark:text-[#8b949e]">
              {isPt ? "Orientação:" : "Orientation:"}
            </span>
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-[#21262d] hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-800 dark:text-[#f0f3f6] border border-stone-300/80 dark:border-[#363d47] transition-all shadow-2xs active:scale-95"
            >
              <RotateCw size={13} className="text-amber-600 dark:text-amber-400" />
              <span>{rotation}° ({isPt ? "Rodar 90°" : "Rotate 90°"})</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 dark:text-[#c9d1d9] hover:bg-stone-100 dark:hover:bg-[#21262d] transition-colors"
          >
            {isPt ? "Cancelar" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isProcessing}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Check size={13} />
            <span>{isPt ? "Aplicar Foto" : "Apply Photo"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
