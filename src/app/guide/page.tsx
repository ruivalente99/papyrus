"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  CheckCircle2,
  Play,
  Pause,
  Maximize2,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function GuidePage() {
  const [deviceMode, setDeviceMode] = useState<"web" | "mobile">("web");
  const [lang, setLang] = useState<"pt" | "en">("pt");
  const [activeStep, setActiveStep] = useState<number>(1);
  const [pausedVideos, setPausedVideos] = useState<Record<number, boolean>>({});
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  // Auto-detect device mode on mount
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

  const togglePlay = (stepNum: number) => {
    const v = videoRefs.current[stepNum];
    if (v) {
      if (v.paused) {
        v.play();
        setPausedVideos((p) => ({ ...p, [stepNum]: false }));
      } else {
        v.pause();
        setPausedVideos((p) => ({ ...p, [stepNum]: true }));
      }
    }
  };

  const steps = [
    {
      step: 1,
      icon: Layout,
      title: isPt ? "1. Troca de Modelos & Cores em Tempo Real" : "1. Live Templates & Color Switching",
      badge: isPt ? "Design & Estilo" : "Design & Style",
      descWeb: isPt
        ? "Vê a transformação imediata da folha A4 ao clicar entre Lateralis (com barra lateral moderna), Classic (minimalismo padrão LaTeX/ATS) e Matrix (grelha executiva). Clica na paleta de cores ou escolhe 'Outra' com o seletor nativo para personalizar a identidade visual."
        : "Watch the A4 sheet transform immediately when switching between Lateralis (modern sidebar), Classic (LaTeX/ATS standard), and Matrix (executive grid). Click preset swatches or pick 'Custom' with the native color picker.",
      descMobile: isPt
        ? "No telemóvel, no separador Pré-visualização, toca no botão flutuante 'Estilo'. Uma gaveta inferior estilo iOS abre-se para alternar instantaneamente entre os 3 modelos, densidade de texto e cores personalizadas sem sair do preview."
        : "On mobile, tap the 'Style' button on the Preview tab. An iOS-style bottom sheet slides up to switch templates, text density, and custom colors seamlessly.",
      videoWeb: "/guide/videos/web-action-1-templates.webm",
      videoMobile: "/guide/videos/mobile-action-1-templates.webm",
      posterWeb: "/guide/web-step1-templates.png",
      posterMobile: "/guide/mobile-step1-templates.png",
      actionLabel: isPt ? "Troca fluida entre 3 modelos e cores" : "Smooth live transformation",
      tips: isPt
        ? ["Lateralis, Classic e Matrix", "Seletor de cor livre com Pipette", "3 densidades de entrelinha"]
        : ["Lateralis, Classic & Matrix", "Dynamic color picker with Pipette", "3 typographic densities"],
    },
    {
      step: 2,
      icon: Pencil,
      title: isPt ? "2. Edição Live Sync no Editor" : "2. Real-Time Live Sync Editing",
      badge: isPt ? "Sincronização" : "Live Sync",
      descWeb: isPt
        ? "O painel esquerdo reflete instantaneamente cada tecla na folha A4 à direita, a 60fps sem qualquer recarregamento. Podes arrastar o divisor central para focar na escrita ou na folha, reorganizar secções e ocultar dados com 1 clique."
        : "Every keystroke in the left panel updates the A4 document on the right in real time at 60fps. Drag the central divider to balance your view, reorder blocks, and toggle visibility.",
      descMobile: isPt
        ? "No telemóvel, usa as pílulas de atalho fixas no topo ([ 👤 Pessoal ] [ 💼 Experiência ] [ ✨ Skills ]) para saltar diretamente para qualquer secção. O botão 'Recolher' compacta todas as secções numa visão panorâmica estilo iOS."
        : "On mobile, tap the sticky quick-jump pills at the top to navigate into any section immediately. Use 'Collapse' to compress all cards into an iOS-style overview.",
      videoWeb: "/guide/videos/web-action-2-editor.webm",
      videoMobile: "/guide/videos/mobile-action-2-editor.webm",
      posterWeb: "/guide/web-step2-editor.png",
      posterMobile: "/guide/mobile-step2-editor.png",
      actionLabel: isPt ? "Edição em direto refletida na folha A4" : "Live typing reflected instantly on A4",
      tips: isPt
        ? ["Sincronização reativa instantânea", "Divisor arrastável (25% a 75%)", "Atalhos rápidos por secção"]
        : ["Instant reactive synchronization", "Draggable split resizer", "Quick-jump section pills"],
    },
    {
      step: 3,
      icon: Move,
      title: isPt ? "3. Canvas Interativo (Estilo Miro) & Grelha" : "3. Miro-Style Canvas & Alignment Grid",
      badge: isPt ? "Canvas Miro" : "Miro Canvas",
      descWeb: isPt
        ? "A pré-visualização funciona como um canvas livre do Miro: clica e arrasta o fundo para mover a folha, usa a roda do rato ou botões de zoom para ampliar detalhes e ativa o botão [#] para ver a Grelha de Alinhamento com guias milimétricas."
        : "The preview works like a Miro infinite canvas: click and drag the backdrop to pan, use mouse wheel or floating zoom buttons, and toggle [#] for the precise Alignment Grid overlay.",
      descMobile: isPt
        ? "No telemóvel podes arrastar com 1 dedo para explorar os cantos da folha, fazer pinch-to-zoom com 2 dedos para aproximar detalhes e tocar no botão [ ⤢ ] para repor o enquadramento perfeito (Auto-Fit) ao ecrã."
        : "On mobile, pan across the page with 1 finger, pinch with 2 fingers to zoom smoothly, and tap [ ⤢ ] to snap into Auto-Fit screen view.",
      videoWeb: "/guide/videos/web-action-3-canvas.webm",
      videoMobile: "/guide/videos/mobile-action-3-canvas.webm",
      posterWeb: "/guide/web-step3-canvas.png",
      posterMobile: "/guide/mobile-step3-canvas.png",
      actionLabel: isPt ? "Arrasto livre, zoom e grelha de alinhamento" : "Free canvas pan, zoom and alignment grid",
      tips: isPt
        ? ["Grelha de alinhamento comutável [#]", "Atalho tecla Espaço para modo mão", "Barra flutuante com zoom e reset"]
        : ["Toggleable alignment grid [#]", "Spacebar quick-pan shortcut", "Floating Miro zoom toolbar"],
    },
    {
      step: 4,
      icon: ShieldCheck,
      title: isPt ? "4. Auditoria de Qualidade & Linter Dinâmico" : "4. Dynamic Quality Linter & Score",
      badge: isPt ? "Auditoria ATS" : "Quality Audit",
      descWeb: isPt
        ? "Toca no badge de pontuação no topo (ex: 88%) para abrir o diagnóstico completo de qualidade. O linter analisa proporção de texto, métricas de impacto, conformidade com filtros ATS de recrutamento e verifica se faltam traduções."
        : "Click the score badge in the header (e.g. 88%) to view the quality audit. The engine analyzes highlights, impact metrics, ATS parser compatibility, and missing translations.",
      descMobile: isPt
        ? "No telemóvel, o badge de score abre uma gaveta inferior que detalha sucessos, avisos e melhorias sem sair da página, com pontuação atualizada em tempo real enquanto editas."
        : "On mobile, tapping the score badge opens a bottom sheet showing detailed criteria (Successes, Warnings, and Improvements) with live score updates.",
      videoWeb: "/guide/videos/web-action-4-linter.webm",
      videoMobile: "/guide/videos/mobile-action-4-linter.webm",
      posterWeb: "/guide/web-step4-linter.png",
      posterMobile: "/guide/mobile-step4-linter.png",
      actionLabel: isPt ? "Diagnóstico em tempo real com pontuação ATS" : "Real-time audit breakdown & ATS score",
      tips: isPt
        ? ["Score percentual em tempo real", "Filtros rápidos (Erros, Avisos, Dicas)", "Deteção de campos por traduzir"]
        : ["Live real-time percentage score", "Category filters", "Missing translation checks"],
    },
    {
      step: 5,
      icon: Download,
      title: isPt ? "5. Exportação Oficial em 1 Clique (PDF & PNG)" : "5. 1-Click Official Export (PDF & PNG)",
      badge: isPt ? "Exportação" : "Export",
      descWeb: isPt
        ? "Clica no botão âmbar [ ⬇ PDF ] na barra superior. O motor PAPYRUS gera um PDF vectorial com dimensões A4 exatas (210×297mm), links clicáveis embutidos e quebras de página inteligentes que nunca cortam texto."
        : "Click the amber [ ⬇ PDF ] button. PAPYRUS compiles a strict vector A4 PDF (210×297mm) with clickable native hyperlinks and intelligent page break guards.",
      descMobile: isPt
        ? "No telemóvel, o botão de PDF fica sempre acessível na barra superior e no topo do preview, descarregando o ficheiro instantaneamente para o dispositivo, pronto para envio no WhatsApp, Email ou LinkedIn."
        : "On mobile, the PDF export action is always pinned in the preview bar, downloading the vector file directly to your smartphone ready to share.",
      videoWeb: "/guide/videos/web-action-5-export.webm",
      videoMobile: "/guide/videos/mobile-action-5-export.webm",
      posterWeb: "/guide/web-step5-export.png",
      posterMobile: "/guide/mobile-step5-export.png",
      actionLabel: isPt ? "Download direto de PDF vectorial A4" : "Instant vector A4 PDF download",
      tips: isPt
        ? ["Links clicáveis nativos embutidos", "Quebras de página inteligentes", "Exportação alternativa em PNG"]
        : ["Embedded clickable native links", "Smart page break engine", "High-res PNG export alternative"],
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-amber-500/20 touch-pan-y">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-4 sm:px-8 py-3 transition-colors">
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
              {isPt ? "Guia Interativo" : "Interactive Guide"}
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
      <section className="pt-8 sm:pt-14 pb-6 sm:pb-10 px-4 sm:px-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 text-xs font-bold mb-4 shadow-2xs">
          <Zap size={14} className="text-amber-600 animate-pulse" />
          <span>{isPt ? "Demonstrações em Ação Real" : "Real Live Action Demos"}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-950 dark:text-stone-50 mb-3 font-serif">
          {isPt ? "Como Construir o Teu CV no PAPYRUS" : "How to Build Your CV with PAPYRUS"}
        </h1>

        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl mx-auto">
          {isPt
            ? "Vê exatamente como cada funcionalidade funciona em tempo real. Escolhe entre o modo Computador ou Telemóvel e acompanha as ações animadas."
            : "See exactly how each feature works in real time. Switch between Desktop and Mobile and watch the live action demos."}
        </p>

        {/* Device Switcher (Segmented Control) */}
        <div className="inline-flex items-center p-1.5 bg-stone-200/80 dark:bg-stone-800/80 rounded-2xl border border-stone-300/70 dark:border-stone-700/70 shadow-xs gap-1.5 mb-6">
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

        {/* Quick Jump Step Navigation Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto px-2">
          {steps.map((s) => (
            <a
              key={s.step}
              href={`#passo-${s.step}`}
              onClick={() => setActiveStep(s.step)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeStep === s.step
                  ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-sm"
                  : "bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-amber-500"
              }`}
            >
              <span>{s.step}. {s.badge}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Action Showcase Cards */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 pb-20 space-y-12 sm:space-y-16">
        {steps.map((item) => {
          const isWeb = deviceMode === "web";
          const currentDesc = isWeb ? item.descWeb : item.descMobile;
          const currentVideo = isWeb ? item.videoWeb : item.videoMobile;
          const currentPoster = isWeb ? item.posterWeb : item.posterMobile;
          const isPaused = pausedVideos[item.step] || false;

          return (
            <article
              key={item.step}
              id={`passo-${item.step}`}
              className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md overflow-hidden transition-all hover:shadow-xl scroll-mt-20"
            >
              {/* Header Details */}
              <div className="p-6 sm:p-8 pb-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-300/60 dark:border-amber-800/60">
                      {item.badge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{isPt ? "Ação Dinâmica" : "Dynamic Action"}</span>
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-stone-400">
                    {item.step} / {steps.length}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-stone-950 dark:text-stone-50 mb-2.5 flex items-center gap-2.5">
                  <item.icon size={22} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{item.title}</span>
                </h2>

                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
                  {currentDesc}
                </p>

                {/* Key feature pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3.5">
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

              {/* Dynamic Action Video in Device Mockup */}
              <div className="px-4 sm:px-8 pb-8 pt-2">
                {isWeb ? (
                  /* macOS Browser Mockup Frame for Web */
                  <div className="rounded-2xl overflow-hidden border border-stone-300/80 dark:border-stone-700/80 bg-stone-100 dark:bg-stone-950 shadow-lg">
                    {/* macOS Window Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-stone-200/80 dark:bg-stone-800/80 border-b border-stone-300/70 dark:border-stone-700/70">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                      </div>

                      <div className="flex items-center gap-1.5 px-4 py-0.5 rounded-md bg-white/70 dark:bg-stone-900/70 text-[11px] font-mono text-stone-500 dark:text-stone-400 border border-stone-300/50 dark:border-stone-700/50 max-w-xs truncate">
                        <span>papyrus.app/editor</span>
                        <span className="text-stone-300 dark:text-stone-600">•</span>
                        <span className="text-amber-700 dark:text-amber-400 font-bold">{item.badge}</span>
                      </div>

                      <button
                        onClick={() => togglePlay(item.step)}
                        title={isPaused ? "Reproduzir demonstração" : "Pausar demonstração"}
                        className="p-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                      >
                        {isPaused ? <Play size={13} /> : <Pause size={13} />}
                      </button>
                    </div>

                    {/* Video Player */}
                    <div
                      onClick={() => togglePlay(item.step)}
                      className="relative cursor-pointer group bg-black flex items-center justify-center overflow-hidden"
                    >
                      <video
                        ref={(el) => {
                          videoRefs.current[item.step] = el;
                        }}
                        src={currentVideo}
                        poster={currentPoster}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto object-cover"
                      />

                      {/* Play/pause pill indicator */}
                      <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-stone-900/85 backdrop-blur-sm text-white text-[11px] font-mono flex items-center gap-1.5 transition-opacity ${isPaused ? "opacity-100 ring-2 ring-amber-500" : "opacity-0 group-hover:opacity-90"}`}>
                        {isPaused ? <Play size={11} className="text-amber-400" /> : <Pause size={11} />}
                        <span>{isPaused ? (isPt ? "Pausado" : "Paused") : (isPt ? "Pausar" : "Pause")}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Clean, Modern Mobile Action Card (No artificial notches or double phone bezels) */
                  <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-stone-300/80 dark:border-stone-700/80 bg-stone-100 dark:bg-stone-900 shadow-lg">
                    {/* Clean Header Bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-stone-200/80 dark:bg-stone-800/80 border-b border-stone-300/70 dark:border-stone-700/70">
                      <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-amber-600 dark:text-amber-400" />
                        <span className="text-[11px] font-mono font-bold text-stone-700 dark:text-stone-300">
                          {isPt ? "Ecrã Mobile" : "Mobile View"}
                        </span>
                        <span className="text-stone-300 dark:text-stone-600">•</span>
                        <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">{item.badge}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>LIVE</span>
                        </span>
                        <button
                          onClick={() => togglePlay(item.step)}
                          title={isPaused ? "Reproduzir" : "Pausar"}
                          className="p-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                        >
                          {isPaused ? <Play size={13} /> : <Pause size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Video Player - 100% visible, zero overlays covering UI, native aspect ratio */}
                    <div
                      onClick={() => togglePlay(item.step)}
                      className="relative cursor-pointer group bg-black flex items-center justify-center overflow-hidden"
                    >
                      <video
                        ref={(el) => {
                          videoRefs.current[item.step] = el;
                        }}
                        src={currentVideo}
                        poster={currentPoster}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto object-cover"
                      />

                      {/* Play/pause pill indicator */}
                      <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-stone-900/85 backdrop-blur-sm text-white text-[11px] font-mono flex items-center gap-1.5 transition-opacity ${isPaused ? "opacity-100 ring-2 ring-amber-500" : "opacity-0 group-hover:opacity-90"}`}>
                        {isPaused ? <Play size={11} className="text-amber-400" /> : <Pause size={11} />}
                        <span>{isPaused ? (isPt ? "Pausado" : "Paused") : (isPt ? "Pausar" : "Pause")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtitle / Caption for action */}
                <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-2 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
                    <span>{item.actionLabel}</span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {isPt ? "Clica no vídeo para pausar/reproduzir" : "Click video to pause/play"}
                  </span>
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
