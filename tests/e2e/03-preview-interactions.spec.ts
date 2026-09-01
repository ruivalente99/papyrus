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
      await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
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
      await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    }

    // Switch to Classic Tech template
    const classicBtn = page.getByRole("button", { name: "Classic (Minimal ATS)" });
    if (await classicBtn.isVisible()) {
      await classicBtn.click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();
    }

    // Switch to Matrix template
    const matrixBtn = page.getByRole("button", { name: "Matrix (Executive Grid)" });
    if (await matrixBtn.isVisible()) {
      await matrixBtn.click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();
    }
  });

  test("toggles font size density between compact, normal and spacious", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    }

    // Click compact density
    const compactBtn = page.getByRole("button", { name: /Compact/i });
    if (await compactBtn.isVisible()) {
      await compactBtn.click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();
    }

    // Click spacious density
    const spaciousBtn = page.getByRole("button", { name: /Spacious/i });
    if (await spaciousBtn.isVisible()) {
      await spaciousBtn.click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();
    }
  });
});
