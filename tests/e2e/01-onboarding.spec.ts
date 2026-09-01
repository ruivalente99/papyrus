import { test, expect } from "@playwright/test";

test.describe("PAPYRUS Onboarding & Template Lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("displays setup screen on fresh visit with brand and actions", async ({ page }) => {
    // Brand title lowercase papyrus
    await expect(page.locator("header").getByText("papyrus")).toBeVisible();

    // Dropzone upload area
    await expect(page.getByText(/Drop or upload|Arraste ou carregue/i)).toBeVisible();

    // Blank canvas and Demo buttons
    await expect(page.getByRole("button", { name: /Blank|Em Branco/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Demo/i })).toBeVisible();
  });

  test("switching UI language on setup screen toggles between EN and PT", async ({ page }) => {
    const ptButton = page.locator("header").getByRole("button", { name: "PT" });
    const enButton = page.locator("header").getByRole("button", { name: "EN" });

    if (await ptButton.isVisible()) {
      await ptButton.click();
      await expect(page.getByText("Em Branco")).toBeVisible();
    }

    if (await enButton.isVisible()) {
      await enButton.click();
      await expect(page.getByText("Blank")).toBeVisible();
    }
  });

  test("selecting Demo preset loads the builder split-pane", async ({ page, isMobile }) => {
    const demoBtn = page.getByRole("button", { name: /Demo/i });
    await demoBtn.click();

    if (isMobile) {
      await expect(page.locator("#section-personal")).toBeVisible();
      // Switch to preview tab
      await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
      await expect(page.locator("#cv-printable-page")).toBeVisible();
    } else {
      await expect(page.locator("#cv-printable-page")).toBeVisible();
      await expect(page.locator("#section-personal")).toBeVisible();
    }
  });

  test("selecting blank canvas creates an empty document in builder", async ({ page }) => {
    const blankBtn = page.getByRole("button", { name: /Blank|Em Branco/i });
    await blankBtn.click();

    await expect(page.locator("#section-personal")).toBeVisible();
  });
});
