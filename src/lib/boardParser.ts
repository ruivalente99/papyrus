/**
 * PAPYRUS Board Markdown Parser
 * Parses board.md as the authoritative single source of truth for the project board,
 * extracting Kanban tasks, project metrics, release timeline, and metadata.
 */

export interface BoardTask {
  id: string;
  title: string;
  status: "shipped" | "progress" | "backlog" | "icebox";
  tags: string[];
  version: string;
  files: string;
  desc: string;
}

export interface BoardMetric {
  metric: string;
  value: string;
  target: string;
  status: string;
}

export interface BoardTimelineGroup {
  version: string;
  items: string[];
}

export interface BoardData {
  title: string;
  lastUpdated: string;
  stableVersion: string;
  systemStatus: string;
  metrics: BoardMetric[];
  timeline: BoardTimelineGroup[];
  tasks: BoardTask[];
}

interface RawTaskItem {
  id: string;
  title: string;
  status: "shipped" | "progress" | "backlog" | "icebox";
  tags: string[];
  version: string;
  files: string;
  bullets: string[];
}

/**
 * Parses raw Markdown content from board.md into a structured BoardData object.
 */
export function parseBoardMarkdown(markdown: string): BoardData {
  const lines = markdown.split(/\r?\n/);

  let title = "PAPYRUS Board";
  let lastUpdated = "";
  let stableVersion = "v1.1.2";
  let systemStatus = "Active";

  // 1. Extract header metadata
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].replace(/^[^\w\s]+/, "").trim();
  }

  const metaMatch = markdown.match(
    /\*Last Updated:\*\s*([^•]+)•\s*\*Status:\*\s*([^•]+)•\s*\*Stable Version:\*\s*([^\n\r]+)/i
  );
  if (metaMatch) {
    lastUpdated = metaMatch[1].trim();
    systemStatus = metaMatch[2].trim();
    stableVersion = metaMatch[3].trim();
  }

  // 2. Extract Project Health & Key Metrics table
  const metrics: BoardMetric[] = [];
  const tableMatch = markdown.match(
    /##\s+.*?Project Health & Key Metrics[\s\S]*?\n\n\| Metric \|[^\n]+\n\|[^\n]+\n([\s\S]*?)\n\n---/
  );
  if (tableMatch) {
    const rows = tableMatch[1].trim().split(/\r?\n/);
    for (const row of rows) {
      const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 4) {
        metrics.push({
          metric: cells[0].replace(/\*\*/g, ""),
          value: cells[1],
          target: cells[2],
          status: cells[3],
        });
      }
    }
  }

  // 3. Extract Version Release Timeline (mermaid block)
  const timeline: BoardTimelineGroup[] = [];
  const timelineMatch = markdown.match(/```mermaid[\s\S]*?timeline[\s\S]*?\n([\s\S]*?)```/);
  if (timelineMatch) {
    const tlines = timelineMatch[1].trim().split(/\r?\n/);
    let currentGroup: BoardTimelineGroup | null = null;
    for (const line of tlines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("title ")) continue;
      if (trimmed.includes(" : ")) {
        const parts = trimmed.split(" : ");
        currentGroup = {
          version: parts[0].trim(),
          items: [parts[1].trim()],
        };
        timeline.push(currentGroup);
      } else if (trimmed.startsWith(": ") && currentGroup) {
        currentGroup.items.push(trimmed.slice(2).trim());
      }
    }
  }

  // 4. Extract Kanban Board Tasks
  const tasks: BoardTask[] = [];
  let currentSectionStatus: BoardTask["status"] = "backlog";
  let currentSectionVersion = "v1.0";
  let currentTask: RawTaskItem | null = null;

  function finishCurrentTask() {
    if (!currentTask) return;
    const desc = currentTask.bullets
      .map((b) => b.replace(/\*\*/g, "").replace(/\*/g, ""))
      .join(" ");
    tasks.push({
      id: currentTask.id,
      title: currentTask.title,
      status: currentTask.status,
      tags: currentTask.tags,
      version: currentTask.version,
      files: currentTask.files,
      desc,
    });
    currentTask = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers
    if (line.startsWith("### ")) {
      finishCurrentTask();
      const heading = line.toLowerCase();
      if (heading.includes("shipped") || heading.includes("completed")) {
        currentSectionStatus = "shipped";
        currentSectionVersion = "v1.1";
      } else if (heading.includes("in progress") || heading.includes("current sprint")) {
        currentSectionStatus = "progress";
        currentSectionVersion = "v1.2";
      } else if (heading.includes("backlog") || heading.includes("priority")) {
        currentSectionStatus = "backlog";
        currentSectionVersion = "v2.0";
      } else if (heading.includes("icebox") || heading.includes("future")) {
        currentSectionStatus = "icebox";
        currentSectionVersion = "v3.0";
      }

      const verMatch = line.match(/\((v[0-9]+(?:\.[0-9]+)*(?:\s*-\s*v[0-9]+(?:\.[0-9]+)*)?)\)/i);
      if (verMatch) {
        currentSectionVersion = verMatch[1];
      }
      continue;
    }

    if (line.startsWith("## ") || line.startsWith("---")) {
      finishCurrentTask();
      continue;
    }

    // Detect task lines: - [x] **[ID]** **Title** `tags: ...`
    const taskMatch = line.match(/^-\s*\[([ xX])\]\s*\*\*\[([A-Z0-9_-]+)\]\*\*\s*\*\*(.+)\*\*(.*)$/);
    if (taskMatch) {
      finishCurrentTask();

      const isChecked = taskMatch[1].toLowerCase() === "x";
      const id = taskMatch[2];
      const taskTitle = taskMatch[3].trim();
      const rest = taskMatch[4] || "";

      let tags: string[] = [];
      const tagsMatch = rest.match(/`tags:\s*([^`]+)`/i);
      if (tagsMatch) {
        tags = tagsMatch[1]
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      currentTask = {
        id,
        title: taskTitle,
        status: isChecked ? "shipped" : currentSectionStatus,
        tags,
        version: currentSectionVersion,
        files: "",
        bullets: [],
      };
      continue;
    }

    // Collect bullet points or detail lines
    if (currentTask && line.trim()) {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bullet = trimmed.replace(/^[-*]\s+/, "");
        const fileMatch = bullet.match(/\*Files:\*\s*(.+)/i) || bullet.match(/\[`([^`]+)`\]/);
        if (fileMatch && !currentTask.files) {
          currentTask.files = fileMatch[1];
        }
        currentTask.bullets.push(bullet);
      } else if (trimmed.match(/^[0-9]+\.\s+/)) {
        currentTask.bullets.push(trimmed.replace(/^[0-9]+\.\s+/, ""));
      }
    }
  }

  finishCurrentTask();

  return {
    title,
    lastUpdated,
    stableVersion,
    systemStatus,
    metrics,
    timeline,
    tasks,
  };
}
