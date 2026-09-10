import { test, expect } from "@playwright/test";
import { enterBuilder } from "./helpers";

test.describe("PAPYRUS Preview Interactions & Click-to-Edit", () => {
  test.beforeEach(async ({ page }) => {
    await enterBuilder(page);
    await expect(page.locator("#section-personal")).toBeVisible();
  });

  test("clicking section in preview highlights and focuses editor card (Click-to-Edit)", async ({ page, isMobile }) => {
    if (isMobile) {
      // Switch to preview tab first
      await page.getByRole("button", { name: /Pré-visualiz|Preview/i }).click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();

      // Click on personal info header text in preview
      const previewName = page.locator("#cv-printable-page").locator("h1").first();
      await previewName.click({ force: true });

      // Should automatically switch back to edit tab and have personal card visible
      await expect(page.locator("#section-personal")).toBeVisible();
    } else {
      // Desktop split-pane view
      await expect(page.locator("#cv-printable-page")).toBeVisible();

      // Click on personal info name heading in preview
      const previewName = page.locator("#cv-printable-page").locator("h1").first();
      await previewName.click({ force: true });

      // Personal info card in builder should receive ring-amber-500 highlight class
      await expect(page.locator("#section-personal")).toHaveClass(/ring-amber-500/);
    }
  });

  test("switches templates using preview toolbar buttons", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: /Pré-visualiz|Preview/i }).click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();

      // Open Style sheet
      const styleBtn = page.getByRole("button", { name: /Estilo|Style/i });
      await styleBtn.click();
      await expect(page.getByRole("dialog")).toBeVisible();

      // Click Classic template
      await page.getByRole("dialog").locator('button[data-template-btn="classic"]').click();

      // Click Matrix template
      await page.getByRole("dialog").locator('button[data-template-btn="matrix"]').click();

      // Close sheet
      await page.getByRole("dialog").getByRole("button", { name: /Concluído|Done/i }).click();
      await expect(page.locator("#cv-printable-page").first()).toBeVisible();
    } else {
      // Switch to Classic Tech template
      const classicBtn = page.locator('button[data-template-tab="classic"]');
      if (await classicBtn.isVisible()) {
        await classicBtn.click();
        await expect(page.locator("#cv-printable-page").first()).toBeVisible();
      }

      // Switch to Matrix template
      const matrixBtn = page.locator('button[data-template-tab="matrix"]');
      if (await matrixBtn.isVisible()) {
        await matrixBtn.click();
        await expect(page.locator("#cv-printable-page").first()).toBeVisible();
      }
    }
  });

  test("toggles font size density between compact, normal and spacious", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: /Pré-visualiz|Preview/i }).click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();

      // Open Style sheet
      const styleBtn = page.getByRole("button", { name: /Estilo|Style/i });
      await styleBtn.click();
      await expect(page.getByRole("dialog")).toBeVisible();

      // Click compact density
      await page.getByRole("dialog").getByRole("button", { name: /Compact/i }).click();

      // Click spacious density
      await page.getByRole("dialog").getByRole("button", { name: /Spacious|Espaçoso/i }).click();

      // Close sheet
      await page.getByRole("dialog").getByRole("button", { name: /Concluído|Done/i }).click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();
    } else {
      // Click compact density
      const compactBtn = page.getByRole("button", { name: /Compact/i });
      if (await compactBtn.isVisible()) {
        await compactBtn.click();
        await expect(page.locator("#cv-printable-page")).toBeVisible();
      }

      // Click spacious density
      const spaciousBtn = page.getByRole("button", { name: /Spacious|Espaçoso/i });
      if (await spaciousBtn.isVisible()) {
        await spaciousBtn.click();
        await expect(page.locator("#cv-printable-page")).toBeVisible();
      }
    }
  });

  test("allows resizing split-pane on desktop using draggable divider", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop specific test");

    const resizer = page.getByTestId("split-resizer");
    await expect(resizer).toBeVisible();

    const box = await resizer.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Drag resizer to the right (increase editor width)
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 80, box.y + box.height / 2);
      await page.mouse.up();

      // Double click resizer to reset to 50%
      await resizer.dblclick();
      await expect(resizer).toHaveAttribute("aria-valuenow", "50");
    }
  });

  test("provides Miro-style canvas pan and zoom toolbar controls", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: /Pré-visualiz|Preview/i }).click();
    }
    await expect(page.locator("#cv-printable-page")).toBeVisible();

    // Verify floating Miro canvas control bar
    const canvasToolbar = page.getByTestId("canvas-floating-toolbar");
    await expect(canvasToolbar).toBeVisible();

    // Test Zoom In via floating toolbar
    const zoomInBtn = canvasToolbar.getByTitle(/Zoom in|Aumentar/i);
    await zoomInBtn.click();

    // Test Auto-Fit via floating toolbar
    const fitBtn = canvasToolbar.getByTitle(/Ajustar ao tamanho do ecrã|Fit to screen size/i);
    await fitBtn.click();

    // Test Reset view via floating toolbar
    const resetBtn = canvasToolbar.getByTitle(/Repor posição original|Reset view/i);
    await resetBtn.click();
    await expect(canvasToolbar.getByText("100%")).toBeVisible();
  });
});
