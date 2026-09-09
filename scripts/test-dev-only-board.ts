import assert from "node:assert";

async function runTests() {
  console.log("🧪 Testing Dev-Only Board Route & API Guards...");

  // 1. Test production behavior for /api/board
  (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  delete process.env.ENABLE_DEV_BOARD;

  // Dynamically import routes to evaluate under NODE_ENV=production
  const { GET: getApiBoardProd } = await import("../src/app/api/board/route");
  const apiResProd = await getApiBoardProd();
  assert.strictEqual(apiResProd.status, 404, "API /api/board should return 404 in production");
  const apiJsonProd = await apiResProd.json();
  assert.strictEqual(apiJsonProd.error, "Not found", "API error message should be 'Not found'");
  console.log("✓ /api/board returns 404 in production");

  // 2. Test production behavior for /board.md
  const { GET: getBoardMdProd } = await import("../src/app/board.md/route");
  const mdResProd = await getBoardMdProd();
  assert.strictEqual(mdResProd.status, 404, "/board.md should return 404 in production");
  console.log("✓ /board.md returns 404 in production");

  // 3. Test dev behavior for /api/board
  (process.env as Record<string, string | undefined>).NODE_ENV = "development";
  // Re-run handler under development mode
  const apiResDev = await getApiBoardProd();
  assert.strictEqual(apiResDev.status, 200, "API /api/board should return 200 in development");
  const apiJsonDev = await apiResDev.json();
  assert(apiJsonDev.tasks && apiJsonDev.tasks.length > 0, "API should return parsed tasks in dev");
  assert(apiJsonDev.metrics && apiJsonDev.metrics.length > 0, "API should return metrics in dev");
  console.log(`✓ /api/board returns 200 OK with ${apiJsonDev.tasks.length} tasks in development`);

  // 4. Test dev behavior for /board.md
  const mdResDev = await getBoardMdProd();
  assert.strictEqual(mdResDev.status, 200, "/board.md should return 200 in development");
  const mdText = await mdResDev.text();
  assert(mdText.includes("PAPYRUS"), "board.md should return markdown content in dev");
  console.log("✓ /board.md returns 200 OK with raw markdown in development");

  // 5. Test override flag ENABLE_DEV_BOARD=true in production
  (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  process.env.ENABLE_DEV_BOARD = "true";
  const apiResOverride = await getApiBoardProd();
  assert.strictEqual(apiResOverride.status, 200, "ENABLE_DEV_BOARD=true allows access in production");
  console.log("✓ ENABLE_DEV_BOARD=true enables board in production environments if desired");

  console.log("\n🎉 ALL DEV-ONLY BOARD ROUTE TESTS PASSED!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
