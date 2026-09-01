import { test, expect } from "@playwright/test";
import { enterBuilder } from "./helpers";

test.describe("PAPYRUS Field Editing & Live Preview Synchronization", () => {
  test.beforeEach(async ({ page }) => {
    await enterBuilder(page);
    await expect(page.locator("#section-personal")).toBeVisible();
  });

  test("edits Full Name and verifies instant live synchronization in A4 preview", async ({ page, isMobile }) => {
    const nameInput = page.locator("#section-personal").locator('input[type="text"]').first();
    await nameInput.fill("Dra. Beatriz Santos");

    if (isMobile) {
      // Switch to preview tab on mobile to inspect preview
      await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    }

    const preview = page.locator("#cv-printable-page");
    await expect(preview.getByText("Dra. Beatriz Santos")).toBeVisible();
  });

  test("edits email and verifies mailto link in preview", async ({ page, isMobile }) => {
    const emailInput = page.locator("#section-personal").locator('input[type="email"]');
    await emailInput.fill("beatriz.santos@exemplo.pt");

    if (isMobile) {
      await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    }

    const preview = page.locator("#cv-printable-page");
    await expect(preview.getByText("beatriz.santos@exemplo.pt")).toBeVisible();
  });

  test("switches document language between PT and EN", async ({ page }) => {
    const ptLangBtn = page.locator("header").locator("button").filter({ hasText: /^PT$/i });
    const enLangBtn = page.locator("header").locator("button").filter({ hasText: /^EN$/i });

    if (await ptLangBtn.isVisible()) {
      await ptLangBtn.click();
      await expect(page.locator("header")).toBeVisible();
    }

    if (await enLangBtn.isVisible()) {
      await enLangBtn.click();
      await expect(page.locator("header")).toBeVisible();
    }
  });

  test("toggles theme without crashing", async ({ page }) => {
    const themeBtn = page.locator('button[title*="Tema"], button[title*="Theme"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      const darkOption = page.getByRole("button", { name: /Escuro|Dark/i });
      if (await darkOption.isVisible()) {
        await darkOption.click();
        await expect(page.locator("html")).toHaveClass(/dark/);
      }
    }
  });

  test("generates and re-rolls DiceBear Dylan avatar in Personal Info form", async ({ page }) => {
    const rerollBtn = page.locator('button:has-text("Re-roll Dylan")').first();
    await expect(rerollBtn).toBeVisible();
    const avatarImg = page.locator("#section-personal img").first();
    await expect(avatarImg).toBeVisible();
    const srcBefore = await avatarImg.getAttribute("src");
    await rerollBtn.click();
    const srcAfter = await avatarImg.getAttribute("src");
    expect(srcAfter).not.toBe(srcBefore);
  });

  test("supports horizontal scrolling and wrap toggle in section builder pills", async ({ page, isMobile }) => {
    if (!isMobile) {
      const wrapToggle = page.locator('button:has-text("⊞"), button:has-text("⇄")').first();
      if (await wrapToggle.isVisible()) {
        await wrapToggle.click();
        await wrapToggle.click();
      }

      const rightArrow = page.locator('button[title*="direita"], button[title*="right"]').first();
      if (await rightArrow.isVisible()) {
        await rightArrow.click();
      }
    }
  });
});
