# PAPYRUS — Technical Specification: CV Comparator

> **Product Architecture & Engineering Document**  
> **Version:** 1.0.0 — Specification / Technical Proposal  
> **Status:** Ready for Implementation

---

## 1. Overview & Motivation

The **PAPYRUS CV Comparator** is designed to allow users and autonomous AI agents to inspect, contrast, and reconcile two distinct versions of a resume (`CV A` vs `CV B`).

### Critical Use Cases:
1. **ATS Optimization Auditing**: Compare a generic baseline CV against a tailored resume for a specific job opening (analyzing keyword density, quantifiable metrics, and linter score differentials).
2. **Version Control & Iteration Tracking**: Compare the active document against a historical JSON backup or previously exported file to identify unintended edits or phrasing enhancements.
3. **Multilingual Synchronization**: Compare structural and content parity across Portuguese and English sections, highlighting items added in one language but omitted in another.
4. **Layout & Template Benchmarking**: Concurrently visualize identical data rendered under `lateralis` vs `classic` (LaTeX ATS) to make informed layout, spacing, and density decisions.

---

## 2. User Experience (UX/UI)

### 2.1 Inspection Modes
The comparator will provide three complementary inspection modes:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [ Synchronized Side-by-Side ]  │  [ Semantic Diff ]  │  [ ATS Matrix ]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│       CV A: "Tech Lead (2024)"        │       CV B: "Staff Eng (2025)"  │
│      ┌───────────────────────┐        │      ┌───────────────────────┐ │
│      │ [Photo Avatar]        │        │      │ [Photo Avatar]        │ │
│      │ John Doe              │        │      │ John Doe              │ │
│      │ - React, TypeScript   │        │      │ - React, TS, Rust [+] │ │
│      │ - 3 years experience  │        │      │ - 4 years experience  │ │
│      └───────────────────────┘        │      └───────────────────────┘ │
│                                                                        │
│  Linter Score: 88% (ATS)              │  Linter Score: 98% (+10%)      │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Mode 1: Synchronized Side-by-Side Canvas (A4)**:
   - Displays two A4 pages side-by-side with proportional scaling.
   - **Synchronized Scrolling**: Scrolling in CV A moves CV B in lockstep.
   - Visual header badges indicating `Identical` (gray), `Modified` (amber), or `Added/Removed` (green/red).

2. **Mode 2: Unified Semantic Diff (Text & Bullet Points)**:
   - Focused on content changes:
     - `+ Green line`: Bullet point or skill added in CV B.
     - `- Red line`: Bullet point or skill removed from CV A.
     - `~ Amber line`: Altered text with word-level inline highlights.
   - Language selector: inspect diffs in `PT`, `EN`, or both side-by-side.

3. **Mode 3: Comparative Quality & ATS Matrix**:
   - Side-by-side metrics table:
     - **Quality Score (Linter Score)**: e.g., `84%` vs `94%`.
     - **Word Count & Density**: `420 words` vs `380 words` (conciseness indicator).
     - **Total A4 Pages**: `1 page` vs `2 pages` (page overflow warning).
     - **Action Verbs**: Total count of high-impact action verbs used in experience highlights.
     - **Quantifiable Metrics**: Detection of percentages (`%`), currencies (`$`, `€`), and multipliers (`2x`, `10x`).

---

## 3. Data Architecture & Diffing Algorithm (`src/lib/cvDiff.ts`)

### 3.1 Diff Result Data Model (`CVDiffResult`)

```typescript
export interface CVDiffResult {
  personalInfoDiff: {
    field: string;
    valueA: string | undefined;
    valueB: string | undefined;
    hasChanged: boolean;
  }[];
  sectionsDiff: SectionDiffItem[];
  linterComparison: {
    scoreA: number;
    scoreB: number;
    diff: number;
    resolvedIssues: string[];
    newIssues: string[];
  };
}

export interface SectionDiffItem {
  sectionId: string;
  type: string;
  status: "unchanged" | "modified" | "added" | "removed";
  titleA?: string;
  titleB?: string;
  itemsDiff: ItemDiff[];
}

export interface ItemDiff {
  id: string;
  title: string;
  status: "unchanged" | "modified" | "added" | "removed";
  fieldChanges: {
    field: string;
    from: any;
    to: any;
  }[];
  highlightsDiff?: {
    type: "add" | "remove" | "keep";
    text: string;
  }[];
}
```

### 3.2 Matching & Resolution Algorithm
1. **Section Identification**:
   - Primary match by section `id`.
   - Secondary match by section `type` (`experience`, `education`, `skills`, etc.) to reconcile imported documents with freshly generated UUIDs.
2. **Experience & Education Item Matching**:
   - Fuzzy matching by `company + role` or `institution + degree`.
   - Jaro-Winkler similarity threshold > 0.85 to classify items as modified rather than delete + insert.
3. **Bullet Point Diffing**:
   - Myers / Longest Common Subsequence (LCS) algorithm to produce clean additions and deletions.

---

## 4. Action Features: "Selective Merge"

Users can not only inspect differences but actively **reconcile** them:
- **"Copy to Active CV" Action**: Transfer a tailored experience or bullet point from CV B to CV A with one click.
- **Section Conflict Resolution**: For each differing section, the user can select:
  - `Keep Version A`
  - `Accept Version B`
  - `Combine Both (Union)`

---

## 5. Modular Implementation Roadmap

| Phase | Deliverable | Target Files |
| :--- | :--- | :--- |
| **Phase 1** | Pure TypeScript Diffing Engine | `src/lib/cvDiff.ts`, `src/types/diff.ts` |
| **Phase 2** | Source Selection Modal (Active vs File/Preset) | `src/components/comparator/CVDiffSourceModal.tsx` |
| **Phase 3** | Synchronized Side-by-Side Split-Pane Viewer | `src/components/comparator/CVCompareView.tsx` |
| **Phase 4** | Comparative ATS Audit Card | `src/components/comparator/ATSCompareCard.tsx` |
| **Phase 5** | CLI Diffing Helper for Terminal / LLM Use | `scripts/cv-diff-cli.ts` (`npm run cv -- diff a.json b.json`) |

---

## 6. Next Steps
This specification is approved for execution and serves as the architectural foundation for the PAPYRUS CV Comparator module.
