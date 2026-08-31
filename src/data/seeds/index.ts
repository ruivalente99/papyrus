import { creativeSidebarSeed } from "./template-sidebar";
import { technicalLatexSeed } from "./template-tech-latex";
import { executiveSeed } from "./template-executive";
import { emptySeed } from "./empty";
import type { CVDocument } from "@/types/cv";

export interface PresetOption {
  id: string;
  name: string;
  description: string;
  cv: CVDocument;
}

export const PRESET_SEEDS: PresetOption[] = [
  {
    id: "lateralis",
    name: "Lateralis (Sidebar)",
    description: "Modern split-column layout with customizable accent palette, portrait & timeline.",
    cv: creativeSidebarSeed,
  },
  {
    id: "classic",
    name: "Classic (Minimal ATS)",
    description: "Clean typography and minimalist layout, highly readable and 100% ATS-optimized.",
    cv: technicalLatexSeed,
  },
  {
    id: "matrix",
    name: "Matrix (Executive Grid)",
    description: "Structured multi-column executive layout with CEFR language competence matrix.",
    cv: executiveSeed,
  },
  {
    id: "empty",
    name: "Blank Canvas",
    description: "Clean starting point to build your curriculum vitae from scratch.",
    cv: emptySeed,
  },
];

export { creativeSidebarSeed, technicalLatexSeed, executiveSeed, emptySeed };
