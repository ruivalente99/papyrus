import { chromium, devices } from "playwright";
import fs from "fs";
import path from "path";

async function main() {
  const outDir = path.resolve(process.cwd(), "public/guide");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "https://papyrus.ruivalente.com";
  console.log(`Capturing guide screenshots against ${baseUrl}...`);

  // ==========================================
  // 1. DESKTOP (Web) CAPTURES (1280x820)
  // ==========================================
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 820 },
    deviceScaleFactor: 2,
  });
  const deskPage = await desktopContext.newPage();

  await deskPage.goto(baseUrl);
  await deskPage.waitForLoadState("networkidle");

  const demoBtn = deskPage.getByRole("button", { name: /Experimentar Demonstração|Try Demo/i });
  if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await demoBtn.click();
    await deskPage.waitForTimeout(500);
  }

  const ptBtn = deskPage.getByRole("button", { name: /^PT$/i });
  if (await ptBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await ptBtn.click();
  }

  // Web Step 1: Templates & Design Selection
  await deskPage.screenshot({
    path: path.join(outDir, "web-step1-templates.png"),
    clip: { x: 450, y: 55, width: 830, height: 420 },
  });
  console.log("✓ Captured web-step1-templates.png");

  // Web Step 2: Editor Pane
  await deskPage.screenshot({
    path: path.join(outDir, "web-step2-editor.png"),
    clip: { x: 0, y: 53, width: 620, height: 600 },
  });
  console.log("✓ Captured web-step2-editor.png");

  // Web Step 3: Interactive Canvas with Grid
  const gridBtn = deskPage.getByTestId("canvas-floating-toolbar").getByTitle(/grelha/i);
  if (await gridBtn.isVisible()) {
    await gridBtn.click();
    await deskPage.waitForTimeout(200);
  }
  await deskPage.screenshot({
    path: path.join(outDir, "web-step3-canvas.png"),
    clip: { x: 550, y: 150, width: 730, height: 640 },
  });
  console.log("✓ Captured web-step3-canvas.png");

  if (await gridBtn.isVisible()) {
    await gridBtn.click();
  }

  // Web Step 4: Quality Linter Modal
  const linterBadge = deskPage.locator('[data-testid="linter-badge"]');
  if (await linterBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
    await linterBadge.click();
    await deskPage.waitForTimeout(400);
    await deskPage.screenshot({
      path: path.join(outDir, "web-step4-linter.png"),
      clip: { x: 300, y: 80, width: 680, height: 600 },
    });
    console.log("✓ Captured web-step4-linter.png");
    await deskPage.keyboard.press("Escape");
    await deskPage.waitForTimeout(300);
  }

  // Web Step 5: Export Buttons
  await deskPage.screenshot({
    path: path.join(outDir, "web-step5-export.png"),
    clip: { x: 920, y: 70, width: 350, height: 180 },
  });
  console.log("✓ Captured web-step5-export.png");

  await desktopContext.close();

  // ==========================================
  // 2. MOBILE CAPTURES (iPhone 14: 390x844)
  // ==========================================
  const mobileContext = await browser.newContext({
    ...devices["iPhone 14"],
    deviceScaleFactor: 2,
  });
  const mobPage = await mobileContext.newPage();

  await mobPage.goto(baseUrl);
  await mobPage.waitForLoadState("networkidle");

  const mobDemo = mobPage.getByRole("button", { name: /Experimentar Demonstração|Try Demo/i });
  if (await mobDemo.isVisible({ timeout: 2000 }).catch(() => false)) {
    await mobDemo.click();
    await mobPage.waitForTimeout(500);
  }

  // Mobile Step 2: Mobile Editor
  await mobPage.screenshot({
    path: path.join(outDir, "mobile-step2-editor.png"),
    clip: { x: 0, y: 53, width: 390, height: 500 },
  });
  console.log("✓ Captured mobile-step2-editor.png");

  const previewTab = mobPage.getByRole("button", { name: /Pré-visualização|Preview/i });
  if (await previewTab.isVisible()) {
    await previewTab.click();
    await mobPage.waitForTimeout(300);
  }

  // Mobile Step 1: Style Drawer
  const styleBtn = mobPage.locator('button:has-text("Estilo"), button:has-text("Style")').first();
  if (await styleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await styleBtn.click();
    await mobPage.waitForTimeout(400);
    await mobPage.screenshot({
      path: path.join(outDir, "mobile-step1-templates.png"),
      clip: { x: 0, y: 250, width: 390, height: 594 },
    });
    console.log("✓ Captured mobile-step1-templates.png");
    const doneBtn = mobPage.getByRole("button", { name: /Concluído|Done/i });
    if (await doneBtn.isVisible()) {
      await doneBtn.click();
      await mobPage.waitForTimeout(300);
    }
  }

  // Mobile Step 3: Interactive Canvas
  await mobPage.screenshot({
    path: path.join(outDir, "mobile-step3-canvas.png"),
    clip: { x: 0, y: 53, width: 390, height: 600 },
  });
  console.log("✓ Captured mobile-step3-canvas.png");

  // Mobile Step 4: Quality Linter
  const mobLinter = mobPage.locator('[data-testid="linter-badge"]');
  if (await mobLinter.isVisible({ timeout: 2000 }).catch(() => false)) {
    await mobLinter.click();
    await mobPage.waitForTimeout(400);
    await mobPage.screenshot({
      path: path.join(outDir, "mobile-step4-linter.png"),
      clip: { x: 0, y: 200, width: 390, height: 644 },
    });
    console.log("✓ Captured mobile-step4-linter.png");
    const doneBtn = mobPage.getByRole("button", { name: /Concluído|Done/i });
    if (await doneBtn.isVisible()) {
      await doneBtn.click();
      await mobPage.waitForTimeout(300);
    }
  }

  // Mobile Step 5: Export Actions
  await mobPage.screenshot({
    path: path.join(outDir, "mobile-step5-export.png"),
    clip: { x: 0, y: 53, width: 390, height: 260 },
  });
  console.log("✓ Captured mobile-step5-export.png");

  await mobileContext.close();
  await browser.close();
  console.log("🎉 All 10 guide screenshots successfully captured and saved in public/guide/!");
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
