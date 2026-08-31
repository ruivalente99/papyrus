"use client";

import React from "react";
import type { PersonalInfo, SupportedLanguage, SocialLink } from "@/types/cv";
import { generateId } from "@/lib/utils";
import { IconPicker } from "../IconPicker";
import { ICON_OPTIONS } from "@/lib/iconMap";
import { User, Plus, Trash2 } from "lucide-react";

interface Props {
  data: PersonalInfo;
  lang: SupportedLanguage;
  defaultLang: SupportedLanguage;
  onChange: (updater: Partial<PersonalInfo> | ((prev: PersonalInfo) => PersonalInfo)) => void;
}

export function PersonalInfoForm({ data, lang, onChange }: Props) {
  const isPt = lang === "pt";

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ photoUrl: ev.target?.result as string, showPhoto: true });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddLink = () => {
    const defaultOption = ICON_OPTIONS[0];
    const newLink: SocialLink = {
      id: generateId(),
      platform: "linkedin",
      label: { [lang]: defaultOption.defaultLabel },
      url: "https://",
    };
    onChange((prev) => ({
      ...prev,
      links: [...(prev.links || []), newLink],
    }));
  };

  const handleUpdateLink = (id: string, update: Partial<SocialLink>) => {
    onChange((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === id ? { ...l, ...update } : l)),
    }));
  };

  const handleRemoveLink = (id: string) => {
    onChange((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Profile Photo & Visibility */}
      <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-900/60 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center shrink-0">
          {data.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={28} className="text-stone-400" />
          )}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold px-3.5 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 text-xs shadow-2xs transition-colors">
              {isPt ? "Alterar Foto" : "Change Photo"}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {data.photoUrl && (
              <button
                type="button"
                onClick={() => onChange({ photoUrl: "" })}
                className="text-stone-500 hover:text-red-600 text-xs font-semibold transition-colors px-2 py-1"
              >
                {isPt ? "Remover" : "Remove"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 pt-0.5 text-stone-600 dark:text-stone-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={data.showPhoto}
                onChange={(e) => onChange({ showPhoto: e.target.checked })}
                className="rounded text-amber-700"
              />
              <span>{isPt ? "Mostrar foto no CV" : "Show photo on CV"}</span>
            </label>

            {data.showPhoto && (
              <select
                value={data.photoShape || "circle"}
                onChange={(e) => onChange({ photoShape: e.target.value as any })}
                className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              >
                <option value="circle">{isPt ? "Circular" : "Circle"}</option>
                <option value="rounded">{isPt ? "Arredondada" : "Rounded"}</option>
                <option value="square">{isPt ? "Quadrada" : "Square"}</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Name & Professional Headline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            {isPt ? "Nome Completo *" : "Full Name *"}
          </label>
          <input
            type="text"
            value={data.fullName || ""}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder={isPt ? "Ex: Alex Silva" : "e.g. Alex Silva"}
            className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-850 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            {isPt ? "Título Profissional" : "Professional Title"} ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={data.headline?.[lang] || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                headline: { ...prev.headline, [lang]: e.target.value },
              }))
            }
            placeholder={isPt ? "Ex: Engenheiro de Software Sénior" : "e.g. Lead Software Engineer"}
            className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-850 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
          />
        </div>
      </div>

      {/* Contact info: Email, Phone, Location, Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="email@example.com"
            className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-850 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            {isPt ? "Telefone" : "Phone"}
          </label>
          <input
            type="tel"
            value={data.phone || ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(+123) 456 789 000"
            className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-850 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            {isPt ? "Localização" : "Location"} ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={data.location?.[lang] || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                location: { ...prev.location, [lang]: e.target.value },
              }))
            }
            placeholder={isPt ? "Ex: Lisboa / Porto, Portugal" : "e.g. London, UK"}
            className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-850 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            {isPt ? "Website / Portfólio" : "Website / Portfolio"}
          </label>
          <input
            type="url"
            value={data.website || ""}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://example.com"
            className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-850 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
          />
        </div>
      </div>

      {/* Social / Professional Links with Rich Icon Picker */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-semibold text-stone-700 dark:text-stone-300">
            {isPt ? "Links & Redes Sociais com Ícones Personalizados" : "Links & Social Platforms with Custom Icons"}
          </label>
          <button
            type="button"
            onClick={handleAddLink}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800"
          >
            <Plus size={12} />
            <span>{isPt ? "Adicionar Link" : "Add Link"}</span>
          </button>
        </div>

        <div className="space-y-2">
          {data.links?.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900/50 p-2 rounded-xl border border-stone-200 dark:border-stone-800"
            >
              {/* Interactive Visual Icon Picker */}
              <IconPicker
                value={link.platform}
                onChange={(newPlatform) =>
                  handleUpdateLink(link.id, { platform: newPlatform as any })
                }
                lang={lang}
              />

              <input
                type="text"
                placeholder={isPt ? "Rótulo visível" : "Visible label"}
                value={link.label?.[lang] || ""}
                onChange={(e) =>
                  handleUpdateLink(link.id, {
                    label: { ...link.label, [lang]: e.target.value },
                  })
                }
                className="flex-1 border border-stone-300 dark:border-stone-700 dark:bg-stone-850 text-stone-900 dark:text-stone-100 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500"
              />

              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                className="flex-1 border border-stone-300 dark:border-stone-700 dark:bg-stone-850 text-stone-900 dark:text-stone-100 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="button"
                onClick={() => handleRemoveLink(link.id)}
                className="text-stone-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                title={isPt ? "Remover link" : "Remove link"}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary / About */}
      <div>
        <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
          {isPt ? "Resumo / Perfil Profissional" : "Profile Summary"} ({lang.toUpperCase()})
        </label>
        <textarea
          rows={3}
          value={data.summary?.[lang] || ""}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              summary: { ...prev.summary, [lang]: e.target.value },
            }))
          }
          placeholder={
            isPt
              ? "Breve resumo da sua experiência profissional, conquistas e competências de destaque..."
              : "Concise summary outlining your core strengths, professional trajectory, and key achievements..."
          }
          className="w-full border border-stone-300 dark:border-stone-700 dark:bg-stone-850 text-stone-900 dark:text-stone-100 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-y"
        />
      </div>
    </div>
  );
}
