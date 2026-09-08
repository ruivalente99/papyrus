import fs from "fs";
import path from "path";
import { parseBoardMarkdown } from "../src/lib/boardParser";

console.log("🧪 Testing PAPYRUS Board Markdown Parser...");

const boardMdPath = path.join(process.cwd(), "board.md");
if (!fs.existsSync(boardMdPath)) {
  console.error("❌ board.md not found at", boardMdPath);
  process.exit(1);
}

const markdown = fs.readFileSync(boardMdPath, "utf-8");
const data = parseBoardMarkdown(markdown);

// Assertions
console.log(`✓ Parsed Title: "${data.title}"`);
console.log(`✓ Last Updated: "${data.lastUpdated}", Stable Version: "${data.stableVersion}"`);

if (!data.title.includes("PAPYRUS")) {
  console.error("❌ Title should contain PAPYRUS");
  process.exit(1);
}

console.log(`✓ Metrics extracted: ${data.metrics.length}`);
if (data.metrics.length < 5) {
  console.error("❌ Expected at least 5 metrics, got", data.metrics.length);
  process.exit(1);
}

console.log(`✓ Timeline groups extracted: ${data.timeline.length}`);
if (data.timeline.length < 3) {
  console.error("❌ Expected at least 3 timeline groups, got", data.timeline.length);
  process.exit(1);
}

console.log(`✓ Tasks extracted: ${data.tasks.length}`);
if (data.tasks.length < 20) {
  console.error("❌ Expected at least 20 tasks, got", data.tasks.length);
  process.exit(1);
}

const shipped = data.tasks.filter((t) => t.status === "shipped");
const progress = data.tasks.filter((t) => t.status === "progress");
const backlog = data.tasks.filter((t) => t.status === "backlog");
const icebox = data.tasks.filter((t) => t.status === "icebox");

console.log(`  - Shipped: ${shipped.length}`);
console.log(`  - In Progress: ${progress.length}`);
console.log(`  - Backlog: ${backlog.length}`);
console.log(`  - Icebox: ${icebox.length}`);

// Verify FEAT-001, FEAT-022, FEAT-012, IDEA-001
const f1 = data.tasks.find((t) => t.id === "FEAT-001");
if (!f1 || f1.status !== "shipped" || !f1.tags.includes("i18n")) {
  console.error("❌ FEAT-001 assertion failed", f1);
  process.exit(1);
}

const f22 = data.tasks.find((t) => t.id === "FEAT-022");
if (!f22 || f22.status !== "shipped") {
  console.error("❌ FEAT-022 assertion failed", f22);
  process.exit(1);
}

const f12 = data.tasks.find((t) => t.id === "FEAT-012");
if (!f12 || f12.status !== "progress") {
  console.error("❌ FEAT-012 assertion failed", f12);
  process.exit(1);
}

const idea1 = data.tasks.find((t) => t.id === "IDEA-001");
if (!idea1 || idea1.status !== "icebox") {
  console.error("❌ IDEA-001 assertion failed", idea1);
  process.exit(1);
}

console.log("🎉 ALL BOARD PARSER TESTS PASSED (100% SUCCESS)!");
