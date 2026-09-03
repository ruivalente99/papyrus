# PAPYRUS — Especificação Técnica: Comparador de CVs (CV Comparator)

> **Documento de Arquitetura e Engenharia de Produto**  
> **Versão:** 1.0.0 — Rascunho / Proposta Técnica  
> **Estado:** Em Especificação (Ready for Implementation)

---

## 1. Visão Geral e Motivação

O **Comparador de CVs** do PAPYRUS é uma ferramenta desenhada para permitir aos utilizadores e a agentes de IA inspecionar, contrastar e reconciliar duas versões distintas de um currículo (`CV A` vs `CV B`).

### Casos de Uso Críticos:
1. **Auditoria de Otimização ATS**: Comparar o CV genérico base contra um CV afinado para uma vaga específica (analisando palavras-chave, métricas quantificáveis e pontuação do linter).
2. **Controle de Versões & Iterações**: Comparar a versão atual contra um backup JSON histórico ou uma exportação prévia para identificar edições acidentais ou melhorias de redação.
3. **Sincronização Multilingue**: Comparar a paridade entre secções e marcadores em Português e Inglês, destacando itens que foram adicionados numa língua mas esquecidos na outra.
4. **Comparação de Estilos / Modelos**: Visualizar simultaneamente a mesma informação renderizada no modelo `lateralis` vs `classic` (TeX ATS) para tomada de decisão estética e de densidade.

---

## 2. Experiência de Utilizador (UX/UI)

### 2.1 Modos de Visualização
O comparador disponibilizará três modos de inspeção complementares:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [ Modo Visual Lado-a-Lado ]  │  [ Diff Semântico ]  │  [ Matriz ATS ] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│       CV A: "Tech Lead (2024)"        │       CV B: "Staff Eng (2025)"  │
│      ┌───────────────────────┐        │      ┌───────────────────────┐ │
│      │ [Foto Dylan]          │        │      │ [Foto Dylan]          │ │
│      │ João Silva            │        │      │ João Silva            │ │
│      │ - React, TypeScript   │        │      │ - React, TS, Rust [+] │ │
│      │ - 3 anos experiência  │        │      │ - 4 anos experiência  │ │
│      └───────────────────────┘        │      └───────────────────────┘ │
│                                                                        │
│  Linter Score: 88% (ATS)              │  Linter Score: 98% (+10%)      │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Modo 1: Visual Lado-a-Lado (Canvas A4 Synchronized)**:
   - Apresenta duas páginas A4 lado-a-lado com escala proporcional.
   - Opção de **Scroll Sincronizado**: rolar num CV move simultaneamente o segundo.
   - Badges visuais nos cabeçalhos de secção indicando `Identical` (cinzento), `Modified` (âmbar), ou `Added/Removed` (verde/vermelho).

2. **Modo 2: Diff Semântico Unificado (Textual & Bullet Points)**:
   - Focado no texto e conteúdo:
     - `+ Linha verde`: Marcador ou competência adicionada no CV B.
     - `- Linha vermelha`: Marcador ou competência removida do CV A.
     - `~ Linha âmbar`: Texto alterado com destaque intra-linha (word-level diff).
   - Filtro de língua: inspecionar alterações em `PT`, `EN` ou ambas lado-a-lado.

3. **Modo 3: Matriz Comparativa de Qualidade & ATS**:
   - Tabela comparativa de métricas:
     - **Pontuação de Qualidade (Linter Score)**: ex: `84%` vs `94%`.
     - **Número de Palavras & Densidade**: `420 palavras` vs `380 palavras` (mais conciso).
     - **Total de Páginas A4**: `1 página` vs `2 páginas` (alerta de overflow).
     - **Palavras de Ação (Action Verbs)**: Contagem de verbos de impacto utilizados nos highlights.
     - **Métricas Numéricas Quantificáveis**: Detecção de percentagens (`%`), dólares (`$`), e multiplicadores (`2x`).

---

## 3. Arquitetura de Dados e Algoritmo de Diffing (`src/lib/cvDiff.ts`)

### 3.1 Modelo de Dados da Diferença (`CVDiffResult`)

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

### 3.2 Algoritmo de Correspondência e Resolução
1. **Identificação de Secções**:
   - Correspondência primária por `id` de secção.
   - Correspondência secundária por `type` (`experience`, `education`, `skills`, etc.) para lidar com secções importadas de ficheiros externos que geraram IDs novos.
2. **Correspondência de Entradas de Experiência / Educação**:
   - Fuzzy match por combinação de `empresa + cargo` ou `instituição + curso`.
   - Limiar de similaridade de Jaro-Winkler > 0.85 para considerar o mesmo item modificado em vez de uma remoção + inserção.
3. **Diffing de Marcadores (Bullet Points)**:
   - Algoritmo de Myers / Longest Common Subsequence (LCS) para gerar diffs de adições e remoções limpos.

---

## 4. Funcionalidades de Ação: "Selective Merge" (Mesclar Escolhas)

O utilizador não deve apenas olhar para as diferenças, mas sim poder **agir** sobre elas:
- **Botão "Copiar para o CV Ativo"**: Permite transferir uma experiência afinada do CV B para o CV A com 1 clique.
- **Resolução de Conflitos**: Para cada secção com diferenças, o utilizador pode escolher:
  - `Manter Versão A`
  - `Aceitar Versão B`
  - `Combinar Ambas (Union)`

---

## 5. Plano de Implementação Modular

| Fase | Entregável | Ficheiros Envolvidos |
| :--- | :--- | :--- |
| **Fase 1** | Motor Puro de Diffing em TypeScript | `src/lib/cvDiff.ts`, `src/types/diff.ts` |
| **Fase 2** | Seletor de Documentos de Origem (Ativo vs Ficheiro/Preset) | `src/components/comparator/CVDiffSourceModal.tsx` |
| **Fase 3** | Visualizador Split-Pane Lado-a-Lado | `src/components/comparator/CVCompareView.tsx` |
| **Fase 4** | Matriz de Auditoria ATS Comparativa | `src/components/comparator/ATSCompareCard.tsx` |
| **Fase 5** | CLI Helper para Diffing via Terminal | `scripts/cv-diff-cli.ts` (`npm run cv -- diff a.json b.json`) |

---

## 6. Próximos Passos
Esta especificação está pronta a ser executada e serve de guia arquitetural completo para o desenvolvimento do módulo de comparação do PAPYRUS.
