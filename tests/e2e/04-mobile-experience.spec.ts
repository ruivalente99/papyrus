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
});
