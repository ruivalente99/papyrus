import { test, expect } from "@playwright/test";
import { enterBuilder } from "./helpers";

test.describe("PAPYRUS Mobile Layout & iOS Standards", () => {
  test.beforeEach(async ({ page }) => {
    await enterBuilder(page);
    await expect(page.locator("#section-personal")).toBeVisible();
  });

  test("verifies zero horizontal page overflow on mobile viewport", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile specific test");
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);
  });

  test("mobile header renders without excessive wrapping height", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile specific test");
    const header = page.locator("header");
    const headerHeight = await header.evaluate((el) => el.getBoundingClientRect().height);

    // Single-line header stays below 70px including safe area padding
    expect(headerHeight).toBeLessThanOrEqual(70);
  });

  test("mobile bottom navigation tab bar switches between editor and preview", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile specific test");
    const editBtn = page.getByRole("button", { name: /Editar|Edit/i });
    const previewBtn = page.getByRole("button", { name: /Pré-visualização|Preview/i });

    // Initially in Edit mode
    await expect(page.locator(".builder-form-pane")).toBeVisible();

    // Switch to Preview
    await previewBtn.click();
    await expect(page.locator(".builder-preview-pane")).toBeVisible();

    // Switch back to Edit
    await editBtn.click();
    await expect(page.locator(".builder-form-pane")).toBeVisible();
  });

  test("form editor pane has sufficient bottom scroll clearance for floating bar", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile specific test");
    const formContainer = page.locator(".builder-form-pane > div");
    const classList = await formContainer.getAttribute("class");
    expect(classList).toContain("pb-28");
  });

  test("mobile preview sheet is fully visible, centered, and not cut off on the left", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile specific test");
    const previewBtn = page.getByRole("button", { name: /Pré-visualização|Preview/i });
    await previewBtn.click();
    await expect(page.locator("#cv-printable-page")).toBeVisible();

    // Wait for auto-fit animation to settle
    await page.waitForTimeout(200);

    // Check that the preview sheet's left edge is within the viewport (not pushed negative)
    const box = await page.locator("#cv-printable-page").boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      const viewportWidth = page.viewportSize()?.width || 390;
      // It should fit horizontally on screen without pushing right edge off-screen
      expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 20);
    }
  });

  test("mobile preview style sheet opens and allows customizing colors and templates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile specific test");
    const previewBtn = page.getByRole("button", { name: /Pré-visualização|Preview/i });
    await previewBtn.click();
    await expect(page.locator("#cv-printable-page")).toBeVisible();

    // Open style sheet
    const styleBtn = page.getByRole("button", { name: /Estilo|Style/i });
    await styleBtn.click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();

    // Select a color swatch (e.g. Emerald)
    const emeraldSwatch = sheet.locator('button[title*="Emerald"]').first();
    if (await emeraldSwatch.isVisible()) {
      await emeraldSwatch.click();
    }

    // Close sheet
    const doneBtn = sheet.getByRole("button", { name: /Concluído|Done/i });
    await doneBtn.click();
    await expect(sheet).not.toBeVisible();
  });

  test("mobile linter modal opens as bottom sheet and score is fully visible without clipping", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile specific test");
    const linterBadge = page.getByTestId("linter-badge");
    await linterBadge.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Verify header is visible and inside top viewport boundary (never clipped off top of screen)
    const heading = dialog.getByRole("heading", { level: 3 });
    await expect(heading).toBeVisible();
    const headingBox = await heading.boundingBox();
    expect(headingBox).not.toBeNull();
    if (headingBox) {
      expect(headingBox.y).toBeGreaterThanOrEqual(0);
    }

    // Verify Score is visible
    await expect(dialog.getByText(/Score/i)).toBeVisible();

    // Close via Done button
    await dialog.getByRole("button", { name: /Concluído|Done/i }).click();
    await expect(dialog).not.toBeVisible();
  });
});
