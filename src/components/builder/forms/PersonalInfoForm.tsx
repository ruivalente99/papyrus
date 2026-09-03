"use client";

import React, { useState, useRef } from "react";
import type { PersonalInfo, SupportedLanguage, SocialLink } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { IconPicker } from "../IconPicker";
import { ICON_OPTIONS } from "@/lib/iconMap";
import { User, Plus, Trash2, Dices, Sparkles, Camera, Upload, RotateCcw } from "lucide-react";
import { resolveAvatarUrl, createDylanAvatarDataUri } from "@/lib/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { ImageCropModal } from "./ImageCropModal";

interface Props {
  data: PersonalInfo;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: Partial<PersonalInfo> | ((prev: PersonalInfo) => PersonalInfo)) => void;
}

export function PersonalInfoForm({ data, lang, onChange }: Props) {
  const isPt = lang === "pt";
  const { t: tr } = useTranslation(lang);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageToCrop, setRawImageToCrop] = useState<string | null>(null);
  const [isDraggingOverAvatar, setIsDraggingOverAvatar] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageToCrop(ev.target?.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = "";
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverAvatar(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    onChange({
      photoUrl: croppedDataUrl,
      isCustomPhoto: true,
      showPhoto: true,
    });
  };

  const handleRerollDylanAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const baseName = (data.fullName && data.fullName.trim()) || "Luna";
    const randomSuffix = Math.floor(Math.random() * 10000);
    const newSeed = `${baseName}-${randomSuffix}`;
    const newUri = createDylanAvatarDataUri(newSeed);
    onChange({
      avatarSeed: newSeed,
      photoUrl: newUri,
      isCustomPhoto: false,
      showPhoto: true,
    });
  };

  const handleAddLink = () => {
    const defaultOption = ICON_OPTIONS[0];
    const newLink: SocialLink = {
      id: generateId(),
      platform: "linkedin",
      url: "",
      label: { pt: "", en: "" },
    };
    onChange((prev) => ({
      ...prev,
      links: [...(prev.links || []), newLink],
    }));
  };

  const handleUpdateLink = (id: string, update: Partial<SocialLink>) => {
    onChange((prev) => ({
      ...prev,
      links: (prev.links || []).map((l) => (l.id === id ? { ...l, ...update } : l)),
    }));
  };

  const handleRemoveLink = (id: string) => {
    onChange((prev) => ({
      ...prev,
      links: (prev.links || []).filter((l) => l.id !== id),
    }));
  };

  const currentAvatarSrc = resolveAvatarUrl(data);

  return (
    <div className="space-y-4 text-xs">
      {/* Profile Photo & Visibility with Drag & Drop + Crop/Rotate */}
      <div className="flex items-center gap-4 bg-stone-50 dark:bg-[#161b22] p-3.5 rounded-2xl border border-stone-200 dark:border-[#30363d]">
        {/* Interactive Avatar with Drag/Drop, Hover Upload & Dice Button */}
        <div className="relative shrink-0">
          <div
            onClick={() => photoInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingOverAvatar(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingOverAvatar(false);
            }}
            onDrop={handleAvatarDrop}
            title={isPt ? "Clica ou arrasta uma foto para aqui" : "Click or drop photo here"}
            className={`group relative w-16 h-16 rounded-full overflow-hidden bg-stone-200 dark:bg-[#0d1117] border-2 transition-all cursor-pointer flex items-center justify-center ${
              isDraggingOverAvatar
                ? "border-amber-500 ring-4 ring-amber-500/30 scale-105"
                : "border-stone-300 dark:border-[#363d47] hover:border-amber-500/80"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentAvatarSrc}
              alt="Avatar"
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />

            {/* Hover overlay for instant photo upload */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-0.5">
              <Camera size={16} className="text-amber-400" />
              <span className="text-[9px] font-bold">{isPt ? "Mudar" : "Upload"}</span>
            </div>
          </div>

          {/* Dylan Dice Button - Directly on Avatar */}
          <button
            type="button"
            onClick={handleRerollDylanAvatar}
            title={isPt ? "Gerar novo avatar Dylan aleatório" : "Reroll Dylan avatar"}
            aria-label={isPt ? "Gerar novo avatar Dylan aleatório" : "Reroll Dylan avatar"}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center justify-center shadow-md border-2 border-white dark:border-[#161b22] active:scale-90 transition-transform"
          >
            <Dices size={12} />
          </button>

          {/* Hidden File Input */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="cursor-pointer bg-white dark:bg-[#21262d] hover:bg-stone-100 dark:hover:bg-[#30363d] text-stone-800 dark:text-[#f0f3f6] font-bold px-3 py-1 rounded-full border border-stone-300 dark:border-[#363d47] text-xs shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Upload size={12} className="text-amber-600 dark:text-amber-400" />
              <span>{tr("builder.forms.personalInfo.importPhoto")}</span>
            </button>

            {data.isCustomPhoto && (
              <button
                type="button"
                onClick={() => {
                  const baseSeed = data.fullName?.trim() || "Luna";
                  onChange({
                    photoUrl: createDylanAvatarDataUri(baseSeed),
                    isCustomPhoto: false,
                    avatarSeed: undefined,
                  });
                }}
                className="text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 text-xs font-semibold transition-colors px-2 py-1 flex items-center gap-1"
                title={tr("builder.forms.personalInfo.restoreAvatar")}
              >
                <RotateCcw size={11} />
                <span>{tr("builder.forms.personalInfo.restoreAvatar")}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 pt-0.5 text-stone-600 dark:text-[#8b949e] flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={data.showPhoto}
                onChange={(e) => onChange({ showPhoto: e.target.checked })}
                className="rounded text-amber-700"
              />
              <span>{tr("common.actions.showOnCV")}</span>
            </label>

            {data.showPhoto && (
              <select
                id="photo-shape-select"
                aria-label={tr("a11y.forms.photoShapeSelect")}
                value={data.photoShape || "circle"}
                onChange={(e) => onChange({ photoShape: e.target.value as any })}
                className="bg-white dark:bg-[#0d1117] border border-stone-200 dark:border-[#363d47] text-stone-800 dark:text-[#f0f3f6] rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              >
                <option value="circle">{tr("builder.forms.personalInfo.photoShapes.circle")}</option>
                <option value="rounded">{tr("builder.forms.personalInfo.photoShapes.rounded")}</option>
                <option value="square">{tr("builder.forms.personalInfo.photoShapes.square")}</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Name & Professional Headline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-stone-700 dark:text-[#c9d1d9] mb-1">
            {tr("builder.forms.personalInfo.fullName")} *
          </label>
          <input
            type="text"
            value={data.fullName || ""}
            onChange={(e) => {
              const newName = e.target.value;
              const updates: Partial<PersonalInfo> = { fullName: newName };
              if (!data.isCustomPhoto && !data.avatarSeed) {
                updates.photoUrl = createDylanAvatarDataUri(newName || "Luna");
              }
              onChange(updates);
            }}
            placeholder={tr("builder.forms.personalInfo.fullNamePlaceholder")}
            className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-[#f0f3f6]"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-[#c9d1d9] mb-1">
            {tr("builder.forms.personalInfo.headline")} ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={data.headline?.[lang] || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                headline: {
                  ...(typeof prev.headline === "object" ? prev.headline : {}),
                  [lang]: e.target.value,
                },
              }))
            }
            placeholder={tr("builder.forms.personalInfo.headlinePlaceholder")}
            className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-[#f0f3f6]"
          />
        </div>
      </div>

      {/* Contact info: Email, Phone, Location, Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-stone-700 dark:text-[#c9d1d9] mb-1">
            {tr("builder.forms.personalInfo.email")} *
          </label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="email@example.com"
            className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-[#f0f3f6]"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-[#c9d1d9] mb-1">
            {tr("builder.forms.personalInfo.phone")}
          </label>
          <input
            type="tel"
            value={data.phone || ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(+123) 456 789 000"
            className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-[#f0f3f6]"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-[#c9d1d9] mb-1">
            {tr("builder.forms.personalInfo.location")} ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={data.location?.[lang] || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                location: {
                  ...(typeof prev.location === "object" ? prev.location : {}),
                  [lang]: e.target.value,
                },
              }))
            }
            placeholder={tr("builder.forms.personalInfo.locationPlaceholder")}
            className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-[#f0f3f6]"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-[#c9d1d9] mb-1">
            {tr("builder.forms.personalInfo.website")}
          </label>
          <input
            type="url"
            value={data.website || ""}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://example.com"
            className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-[#f0f3f6]"
          />
        </div>
      </div>

      {/* Social / Professional Links with Rich Icon Picker */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-semibold text-stone-700 dark:text-[#c9d1d9]">
            {tr("builder.forms.personalInfo.socialLinks")}
          </label>
          <button
            type="button"
            onClick={handleAddLink}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full transition-all active:scale-95 shadow-2xs"
          >
            <Plus size={12} />
            <span>{tr("builder.forms.personalInfo.addSocialLink")}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {data.links?.map((link) => (
            <div
              key={link.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 bg-stone-50 dark:bg-[#161b22] p-2.5 rounded-xl border border-stone-200 dark:border-[#30363d]"
            >
              {/* Row 1 on mobile: Icon Picker + Label + Delete button */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <IconPicker
                  value={link.platform}
                  onChange={(newPlatform) =>
                    handleUpdateLink(link.id, { platform: newPlatform as any })
                  }
                  lang={lang}
                />

                <input
                  type="text"
                  placeholder={tr("builder.forms.personalInfo.username")}
                  aria-label={tr("builder.forms.personalInfo.username")}
                  value={link.label?.[lang] || ""}
                  onChange={(e) =>
                    handleUpdateLink(link.id, {
                      label: {
                        ...(typeof link.label === "object" ? link.label : {}),
                        [lang]: e.target.value,
                      },
                    })
                  }
                  className="flex-1 sm:w-28 min-w-0 border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveLink(link.id)}
                  className="sm:hidden text-stone-500 dark:text-[#8b949e] hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg transition-colors shrink-0 min-w-[24px] min-h-[24px] flex items-center justify-center"
                  title={tr("a11y.forms.deleteSocialLink")}
                  aria-label={tr("a11y.forms.deleteSocialLink")}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Row 2 on mobile, flex-1 on desktop: URL input + Delete button (desktop) */}
              <div className="flex items-center gap-2 w-full sm:flex-1 min-w-0">
                <input
                  type="url"
                  placeholder={tr("builder.forms.personalInfo.url")}
                  aria-label={tr("builder.forms.personalInfo.url")}
                  value={link.url || ""}
                  onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                  className="flex-1 min-w-0 border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveLink(link.id)}
                  className="hidden sm:flex text-stone-500 dark:text-[#8b949e] hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg transition-colors shrink-0 min-w-[24px] min-h-[24px] items-center justify-center"
                  title={tr("a11y.forms.deleteSocialLink")}
                  aria-label={tr("a11y.forms.deleteSocialLink")}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary / About */}
      <div>
        <label className="block font-semibold text-stone-700 dark:text-[#c9d1d9] mb-1">
          {tr("builder.forms.personalInfo.summary")} ({lang.toUpperCase()})
        </label>
        <textarea
          rows={3}
          value={data.summary?.[lang] || ""}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              summary: {
                ...(typeof prev.summary === "object" ? prev.summary : {}),
                [lang]: e.target.value,
              },
            }))
          }
          placeholder={tr("builder.forms.personalInfo.summaryPlaceholder")}
          className="w-full border border-stone-300 dark:border-[#363d47] dark:bg-[#0d1117] dark:placeholder-[#6e7681] text-stone-900 dark:text-[#f0f3f6] rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-y"
        />
      </div>

      {/* Image Crop & Rotate Modal */}
      {rawImageToCrop && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={rawImageToCrop}
          shape={data.photoShape || "circle"}
          isPt={isPt}
          onClose={() => {
            setCropModalOpen(false);
            setRawImageToCrop(null);
          }}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
