import { chromium, devices } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.resolve(process.cwd(), "public/guide/videos");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "https://papyrus.ruivalente.com";

async function recordAction(
  filename: string,
  options: { isMobile?: boolean; width?: number; height?: number },
  actionFn: (page: any) => Promise<void>
) {
  const finalPath = path.join(outDir, filename);
  if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 10000) {
    console.log(`- Skipping ${filename}, already recorded.`);
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const contextOptions: any = {
    recordVideo: {
      dir: outDir,
      size: {
        width: options.width || (options.isMobile ? 390 : 1000),
        height: options.height || (options.isMobile ? 700 : 580),
      },
    },
  };

  if (options.isMobile) {
    Object.assign(contextOptions, devices["iPhone 14"]);
  } else {
    contextOptions.viewport = { width: options.width || 1000, height: options.height || 580 };
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  try {
    await page.goto(baseUrl);
    await page.waitForLoadState("networkidle");

    const demoBtn = page.getByRole("button", { name: /Demo/i });
    if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await demoBtn.click();
      await page.waitForTimeout(500);
    }

    // Execute specific scenario
    await actionFn(page);
    await page.waitForTimeout(700);
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (video) {
      const tempPath = await video.path();
      if (fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
      }
      fs.renameSync(tempPath, finalPath);
      console.log(`✓ Saved ${filename} (${fs.statSync(finalPath).size} bytes)`);
    }
  }
}

async function main() {
  console.log(`🎬 Recording dynamic action videos/GIFs from ${baseUrl}...`);

  // Web 1: Templates & Colors Live Transformation
  await recordAction("web-action-1-templates.webm", { isMobile: false }, async (page) => {
    await page.waitForTimeout(500);
    const classicBtn = page.locator('button:has-text("Classic")').first();
    await classicBtn.click();
    await page.waitForTimeout(900);

    const matrixBtn = page.locator('button:has-text("Matrix")').first();
    await matrixBtn.click();
    await page.waitForTimeout(900);

    const emeraldBtn = page.getByTitle(/Emerald/i);
    if (await emeraldBtn.isVisible()) {
      await emeraldBtn.click();
      await page.waitForTimeout(800);
    }

    const lateralisBtn = page.locator('button:has-text("Lateralis")').first();
    await lateralisBtn.click();
    await page.waitForTimeout(900);
  });

  // Web 2: Live Sync Typing in Editor
  await recordAction("web-action-2-editor.webm", { isMobile: false }, async (page) => {
    await page.waitForTimeout(400);
    const titleInput = page.locator('input[placeholder*="Lead Software Engineer"], input[placeholder*="Senior Software Engineer"], input[value*="Project Management"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.click();
      await titleInput.fill("");
      await page.waitForTimeout(200);
      await titleInput.pressSequentially("Principal Solutions Architect & Tech Lead", { delay: 40 });
      await page.waitForTimeout(1200);
    }
  });

  // Web 3: Canvas Pan, Zoom & Grid Toggle
  await recordAction("web-action-3-canvas.webm", { isMobile: false }, async (page) => {
    await page.waitForTimeout(400);
    // Pan on backdrop
    await page.mouse.move(800, 300);
    await page.mouse.down();
    await page.mouse.move(680, 180, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    const canvasToolbar = page.getByTestId("canvas-floating-toolbar");
    // Zoom in
    await canvasToolbar.getByTitle(/Zoom in|Aumentar/i).click();
    await page.waitForTimeout(600);

    // Toggle Grid On
    const gridBtn = canvasToolbar.getByTitle(/grelha|grid/i);
    await gridBtn.click();
    await page.waitForTimeout(900);

    // Reset View
    await canvasToolbar.getByTitle(/Repor posição original|Reset view/i).click();
    await page.waitForTimeout(600);

    // Toggle Grid Off
    await gridBtn.click();
    await page.waitForTimeout(400);
  });

  // Web 4: Quality Linter Audit Modal
  await recordAction("web-action-4-linter.webm", { isMobile: false }, async (page) => {
    await page.waitForTimeout(400);
    const badge = page.getByTestId("linter-badge");
    await badge.click();
    await page.waitForTimeout(1200);
    // Click on filter
    const pill = page.locator('button:has-text("Avisos"), button:has-text("Warnings"), button:has-text("Todos")').first();
    if (await pill.isVisible()) {
      await pill.click();
      await page.waitForTimeout(800);
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  });

  // Web 5: PDF Vector Export Flow
  await recordAction("web-action-5-export.webm", { isMobile: false }, async (page) => {
    await page.waitForTimeout(500);
    const pdfBtn = page.getByRole("button", { name: /^PDF$/i }).first();
    if (await pdfBtn.isVisible()) {
      await pdfBtn.hover();
      await page.waitForTimeout(600);
      await pdfBtn.click();
      await page.waitForTimeout(1500);
    }
  });

  // Mobile 1: Mobile Style Drawer
  await recordAction("mobile-action-1-templates.webm", { isMobile: true }, async (page) => {
    await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Estilo"), button:has-text("Style")').first().click();
    await page.waitForTimeout(800);

    const matrixBtn = page.getByRole("dialog").locator('button:has-text("Matrix")').first();
    if (await matrixBtn.isVisible()) {
      await matrixBtn.click();
      await page.waitForTimeout(800);
    }

    const colorBtn = page.getByRole("dialog").getByTitle(/Emerald/i);
    if (await colorBtn.isVisible()) {
      await colorBtn.click();
      await page.waitForTimeout(600);
    }

    await page.getByRole("dialog").getByRole("button", { name: /Concluído|Done/i }).click();
    await page.waitForTimeout(800);
  });

  // Mobile 2: Sticky Jump Pills & Collapse in Editor
  await recordAction("mobile-action-2-editor.webm", { isMobile: true }, async (page) => {
    await page.waitForTimeout(400);
    const expPill = page.locator('button:has-text("Experiência"), button:has-text("Work Experience")').first();
    if (await expPill.isVisible()) {
      await expPill.click();
      await page.waitForTimeout(800);
    }
    const collapseBtn = page.locator('button:has-text("Recolher"), button:has-text("Collapse")').first();
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await page.waitForTimeout(800);
      await collapseBtn.click();
      await page.waitForTimeout(600);
    }
  });

  // Mobile 3: Interactive Touch Preview & Auto-Fit
  await recordAction("mobile-action-3-canvas.webm", { isMobile: true }, async (page) => {
    await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    await page.waitForTimeout(400);

    await page.mouse.move(200, 450);
    await page.mouse.down();
    await page.mouse.move(200, 250, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(600);

    const fitBtn = page.getByTitle(/Ajustar ao tamanho do ecrã|Fit to screen/i).first();
    if (await fitBtn.isVisible()) {
      await fitBtn.click();
      await page.waitForTimeout(700);
    }
  });

  // Mobile 4: Linter Mobile Bottom Sheet
  await recordAction("mobile-action-4-linter.webm", { isMobile: true }, async (page) => {
    await page.waitForTimeout(400);
    const badge = page.getByTestId("linter-badge");
    await badge.click();
    await page.waitForTimeout(1200);
    const doneBtn = page.getByRole("button", { name: /Concluído|Done/i });
    if (await doneBtn.isVisible()) {
      await doneBtn.click();
      await page.waitForTimeout(500);
    }
  });

  // Mobile 5: Mobile Export PDF Action
  await recordAction("mobile-action-5-export.webm", { isMobile: true }, async (page) => {
    await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    await page.waitForTimeout(400);
    const pdfBtn = page.locator('button:has-text("PDF")').first();
    if (await pdfBtn.isVisible()) {
      await pdfBtn.click();
      await page.waitForTimeout(1400);
    }
  });

  console.log("🎉 All 10 live action videos recorded successfully!");
}

main().catch((err) => {
  console.error("Error recording guide actions:", err);
  process.exit(1);
});
