import type { CVDocument, SupportedLanguage } from "./cv";

export type DiffStatus = "unchanged" | "modified" | "added" | "removed";

export interface FieldDiff {
  field: string;
  label: string;
  valueA?: string;
  valueB?: string;
  status: DiffStatus;
}

export interface BulletDiff {
  type: "keep" | "add" | "remove";
  text: string;
}

export interface ItemDiff {
  id: string;
  title: string;
  subtitle?: string;
  status: DiffStatus;
  fieldChanges: FieldDiff[];
  bulletsDiff?: BulletDiff[];
  rawItemA?: any;
  rawItemB?: any;
}

export interface SectionDiff {
  sectionId: string;
  type: string;
  titleA: string;
  titleB: string;
  status: DiffStatus;
  itemsDiff: ItemDiff[];
}

export interface ATSComparisonMetric {
  name: string;
  valueA: number | string;
  valueB: number | string;
  diff: number | string;
  positiveBetter: boolean;
  improved: boolean | null;
}

export interface CVDiffResult {
  cvA: CVDocument;
  cvB: CVDocument;
  lang: SupportedLanguage;
  personalInfoDiff: FieldDiff[];
  sectionsDiff: SectionDiff[];
  atsMetrics: ATSComparisonMetric[];
  scoreA: number;
  scoreB: number;
  summary: {
    totalChanges: number;
    additions: number;
    deletions: number;
    modifications: number;
  };
}
