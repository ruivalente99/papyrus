"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Sparkles,
  Layout,
  Pencil,
  Move,
  ShieldCheck,
  Download,
  ChevronRight,
  Globe,
  Grid,
  CheckCircle2,
} from "lucide-react";

export default function GuidePage() {
  const [deviceMode, setDeviceMode] = useState<"web" | "mobile">("web");
  const [lang, setLang] = useState<"pt" | "en">("pt");

  // Auto-detect device dimensions on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setDeviceMode("mobile");
    }
    try {
      const savedLang = localStorage.getItem("papyrus_lang") as "pt" | "en";
      if (savedLang === "pt" || savedLang === "en") {
        setLang(savedLang);
      }
    } catch (e) {}
  }, []);

  const isPt = lang === "pt";

  const steps = [
    {
      step: 1,
      icon: Layout,
      title: isPt ? "1. Escolher o Modelo e Personalizar o Estilo" : "1. Choose Template & Customize Style",
      badge: isPt ? "Aparência" : "Appearance",
      descWeb: isPt
        ? "No topo da pré-visualização, alterna livremente entre os 3 modelos: Lateralis (moderno com barra lateral), Classic (minimalista LaTeX/ATS) e Matrix (executivo com grelha). Escolhe a densidade de espaçamento e uma das 7 cores de destaque ou clica em 'Outra' com o conta-gotas para definir uma cor personalizada à tua escolha."
        : "At the top of the preview pane, switch freely between 3 templates: Lateralis (modern split-column), Classic (minimalist LaTeX/ATS), and Matrix (executive layout). Choose spacing density and accent colors, or pick 'Custom' with the color picker.",
      descMobile: isPt
        ? "No telemóvel, no separador 'Pré-visualização', toca no botão 'Estilo' no topo. Abre-se uma gaveta táctil onde podes alternar modelos, ajustar a densidade do texto e escolher qualquer paleta de cores ou cor personalizada."
        : "On mobile, tap the 'Style' button on the Preview tab to open a bottom drawer where you can change templates, adjust spacing density, and pick colors.",
      imageWeb: "/guide/web-step1-templates.png",
      imageMobile: "/guide/mobile-step1-templates.png",
      tips: isPt
        ? ["3 modelos profissionais desenhados para ATS", "Color picker dinâmico para personalização de marca", "3 níveis de densidade de texto"]
        : ["3 ATS-optimized layouts", "Dynamic color picker for branding", "3 typography density settings"],
    },
    {
      step: 2,
      icon: Pencil,
      title: isPt ? "2. Preencher Dados & Usar Atalhos Rápidos" : "2. Fill Details & Use Quick Shortcuts",
      badge: isPt ? "Edição" : "Editor",
      descWeb: isPt
        ? "O painel esquerdo organiza as secções do currículo: Dados Pessoais, Experiência, Educação, Competências e Línguas. As alterações aparecem instantaneamente na folha A4 à direita. Podes arrastar o divisor central para dar mais espaço ao editor ou ao preview."
        : "The left editor organizes sections: Personal Info, Experience, Education, Skills, and Languages. Edits sync live with the A4 page on the right. Drag the central divider to balance your workspace.",
      descMobile: isPt
        ? "No telemóvel tens uma barra de atalhos rápidos fixa no topo: toca em 'Pessoal', 'Experiência' ou 'Skills' para saltar e expandir diretamente essa secção. Podes usar o botão 'Recolher' para fechar tudo e reorganizar secções facilmente com um único toque."
        : "On mobile, use the sticky quick-jump pills at the top to jump directly into any section. Tap 'Collapse' to compress all cards into an iOS-style overview.",
      imageWeb: "/guide/web-step2-editor.png",
      imageMobile: "/guide/mobile-step2-editor.png",
      tips: isPt
        ? ["Barra de atalhos horizontais no topo", "Botão recolher/expandir tudo", "Suporte bilingue (EN/PT) com tradução por campo"]
        : ["Sticky horizontal jump pills", "Expand/collapse all toggle", "Bilingual EN/PT toggle with per-field text"],
    },
    {
      step: 3,
      icon: Move,
      title: isPt ? "3. Navegar no Canvas Interativo (Estilo Miro & Gestos)" : "3. Interactive Canvas Navigation (Miro & Gestures)",
      badge: isPt ? "Canvas" : "Canvas",
      descWeb: isPt
        ? "A área da folha A4 funciona como uma tela infinita do Miro: clica e arrasta com o rato no fundo para mover a folha, usa Ctrl + Roda do rato para zoom fluido e ativa a 'Grelha de Alinhamento' para verificar margens e alinhamentos milimétricos. Mantém a barra de espaço pressionada para ativar a mão a qualquer momento."
        : "The preview works like a Miro infinite canvas: click and drag the canvas background to pan, use Ctrl + Mouse wheel to zoom smoothly, and toggle the Alignment Grid to check exact margins and alignment.",
      descMobile: isPt
        ? "No telemóvel, podes fazer pinch-to-zoom com 2 dedos para aproximar ou afastar a folha, arrastar com 1 dedo para explorar cantos da página, e dar duplo-toque para alternar rapidamente entre enquadramento ao ecrã (Auto-Fit) e 100% de leitura real."
        : "On mobile, pinch with 2 fingers to zoom in and out, drag with 1 finger to move the A4 sheet, and double-tap to toggle between Auto-Fit and 100% zoom.",
      imageWeb: "/guide/web-step3-canvas.png",
      imageMobile: "/guide/mobile-step3-canvas.png",
      tips: isPt
        ? ["Grelha de alinhamento milimétrica comutável", "Barra flutuante com zoom, auto-fit e reset", "Gestos táteis nativos no telemóvel"]
        : ["Toggleable alignment grid", "Floating toolbar with zoom, auto-fit, and reset", "Native multitouch gestures on mobile"],
    },
    {
      step: 4,
      icon: ShieldCheck,
      title: isPt ? "4. Auditar a Qualidade do Currículo (Linter)" : "4. Audit CV Quality (Dynamic Linter)",
      badge: isPt ? "Qualidade" : "Quality",
      descWeb: isPt
        ? "Clica no badge de percentagem no cabeçalho (ex: 88%) para abrir a auditoria de qualidade. O sistema analisa em tempo real a completude dos dados, a proporção de texto, eventuais traduções em falta para a língua selecionada e conformidade com filtros ATS."
        : "Click the score badge in the header (e.g. 88%) to open the quality audit. The engine analyzes completeness, highlights, missing translations, and ATS compatibility.",
      descMobile: isPt
        ? "No telemóvel, o badge de score abre uma gaveta inferior que detalha o diagnóstico do teu currículo em categorias claras (Sucessos, Avisos e Melhorias), sem tapar o ecrã."
        : "On mobile, tapping the score badge opens a bottom sheet with a detailed audit breakdown (Successes, Warnings, and Improvements).",
      imageWeb: "/guide/web-step4-linter.png",
      imageMobile: "/guide/mobile-step4-linter.png",
      tips: isPt
        ? ["Deteção de traduções em falta", "Recomendações automáticas de conteúdo", "Score instantâneo em tempo real"]
        : ["Detects missing translations", "Automated content recommendations", "Live real-time score"],
    },
    {
      step: 5,
      icon: Download,
      title: isPt ? "5. Exportar em 1 Clique (PDF Oficial & PNG)" : "5. Export in 1 Click (Official PDF & PNG)",
      badge: isPt ? "Finalização" : "Export",
      descWeb: isPt
        ? "Quando estiver pronto, clica no botão âmbar '⬇ PDF' na barra superior. O motor PAPYRUS gera um PDF vectorial em dimensões estritas A4 (210×297mm) a 96 DPI com hiperligações ativas e quebras de página inteligentes. Também podes exportar uma imagem PNG de alta resolução."
        : "When ready, click the amber '⬇ PDF' button. PAPYRUS generates a vector PDF with strict A4 dimensions (210×297mm), active hyperlinks, and smart page breaks. PNG export is also available.",
      descMobile: isPt
        ? "No telemóvel, o botão de PDF fica acessível tanto na barra superior como no separador de pré-visualização, descarregando o ficheiro diretamente para o teu telemóvel pronto a enviar."
        : "On mobile, the PDF button is readily accessible in the preview toolbar, downloading the final document straight to your device.",
      imageWeb: "/guide/web-step5-export.png",
      imageMobile: "/guide/mobile-step5-export.png",
      tips: isPt
        ? ["Links clicáveis nativos embutidos no PDF", "Quebras de página inteligentes sem cortar texto", "Formato A4 estrito universal"]
        : ["Embedded clickable native links", "Smart page break engine", "Universal strict A4 format"],
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-amber-500/20 touch-pan-y">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>{isPt ? "Voltar ao Editor" : "Back to Editor"}</span>
          </Link>

          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <span className="font-serif tracking-widest text-base font-bold text-amber-800 dark:text-amber-500 uppercase">
              PAPYRUS
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
              {isPt ? "Guia Oficial" : "Official Guide"}
            </span>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setLang("pt")}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                lang === "pt"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                lang === "en"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 text-xs font-bold mb-4 shadow-2xs">
          <Sparkles size={14} />
          <span>{isPt ? "Guia Rápido de Utilização" : "Quick User Guide"}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-950 dark:text-stone-50 mb-4 font-serif">
          {isPt ? "Como Construir o Teu Currículo Perfeito" : "How to Build Your Perfect CV"}
        </h1>

        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
          {isPt
            ? "Aprende em 5 passos simples como tirar o máximo partido do PAPYRUS, navegar no canvas interativo estilo Miro e exportar um currículo com estética suíça impecável."
            : "Learn in 5 simple steps how to master PAPYRUS, navigate the Miro-style interactive canvas, and export a flawless Swiss-style resume."}
        </p>

        {/* Device Switcher (Segmented Control) */}
        <div className="inline-flex items-center p-1.5 bg-stone-200/80 dark:bg-stone-800/80 rounded-2xl border border-stone-300/70 dark:border-stone-700/70 shadow-xs gap-1.5">
          <button
            type="button"
            onClick={() => setDeviceMode("web")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              deviceMode === "web"
                ? "bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-50 shadow-md scale-100"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            <Monitor size={16} className={deviceMode === "web" ? "text-amber-600 dark:text-amber-400" : ""} />
            <span>{isPt ? "Computador (Web)" : "Desktop (Web)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode("mobile")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              deviceMode === "mobile"
                ? "bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-50 shadow-md scale-100"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            <Smartphone size={16} className={deviceMode === "mobile" ? "text-amber-600 dark:text-amber-400" : ""} />
            <span>{isPt ? "Telemóvel (Mobile)" : "Mobile Phone"}</span>
          </button>
        </div>
      </section>

      {/* Step by Step Cards */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 pb-20 space-y-12 sm:space-y-16">
        {steps.map((item) => {
          const isWeb = deviceMode === "web";
          const currentDesc = isWeb ? item.descWeb : item.descMobile;
          const currentImg = isWeb ? item.imageWeb : item.imageMobile;

          return (
            <article
              key={item.step}
              className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Step Header */}
              <div className="p-6 sm:p-8 pb-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-300/60 dark:border-amber-800/60">
                    {item.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-400">
                    {item.step} / {steps.length}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-stone-950 dark:text-stone-50 mb-3 flex items-center gap-2.5">
                  <item.icon size={22} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{item.title}</span>
                </h2>

                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
                  {currentDesc}
                </p>

                {/* Key feature pills */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {item.tips.map((tip, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                    >
                      <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{tip}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Step Screenshot Visual */}
              <div className="px-6 sm:px-8 pb-8 pt-2">
                <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 shadow-inner flex items-center justify-center p-2 sm:p-4">
                  <div className="relative w-full max-h-[460px] flex items-center justify-center overflow-hidden rounded-xl">
                    <img
                      src={currentImg}
                      alt={item.title}
                      className="rounded-xl object-contain max-h-[460px] w-auto shadow-md border border-black/5 dark:border-white/5 transition-transform duration-300 hover:scale-[1.01]"
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {/* Bottom CTA Card */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-700 to-amber-900 text-white p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
              {isPt ? "Pronto para criar o teu currículo?" : "Ready to craft your resume?"}
            </h3>
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
              {isPt
                ? "Entra no editor do PAPYRUS agora e cria um currículo impecável com suporte multilíngue, exportação para PDF e sincronização em tempo real."
                : "Jump straight into the PAPYRUS editor and build your resume with multilingual support, PDF export, and instant live preview."}
            </p>
            <div className="pt-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-stone-100 text-amber-900 font-bold text-sm rounded-full shadow-lg transition-transform active:scale-95"
              >
                <span>{isPt ? "Abrir Editor do PAPYRUS" : "Launch PAPYRUS Editor"}</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
