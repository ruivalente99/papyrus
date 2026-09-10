import { test, expect } from "@playwright/test";
import { enterBuilder } from "./helpers";

test.describe("PAPYRUS Modals & Export Engine", () => {
  test.beforeEach(async ({ page }) => {
    await enterBuilder(page);
    await expect(page.locator("#section-personal")).toBeVisible();
  });

  test("opens Quality Linter modal and shows score audit", async ({ page, isMobile }) => {
    // Click on linter score button in header
    if (isMobile) {
      const presetsBtn = page.locator("header").first().locator("button").filter({ has: page.locator("svg.lucide-layers") }).first();
      await presetsBtn.click();
      await page.getByRole("button", { name: /Auditoria|Quality/i }).click();
    } else {
      const linterBadge = page.getByTestId("linter-badge");
      await linterBadge.click();
    }

    // Verify modal appears with score card and full viewport size
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(dialog.getByText(/Score/i)).toBeVisible();

    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();
    if (dialogBox) {
      expect(dialogBox.height).toBeGreaterThan(250);
    }

    // Close modal via Done / Concluído or close button
    const closeBtn = dialog.locator("button").filter({ hasText: /✕|Fechar|Close|Concluído|Done/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
  });

  test("opens Add Section modal and displays section options", async ({ page }) => {
    const addSectionBtn = page.getByRole("button", { name: /Adicionar Secção|Add Section/i }).first();
    await addSectionBtn.scrollIntoViewIfNeeded();
    await addSectionBtn.click();

    // Verify Add Section modal is visible
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/Experiência|Experience/i)).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/Formação|Educação|Education/i)).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole("dialog").locator("button").first();
    await closeBtn.click();
  });

  test("opens Add Section modal in dark mode and verifies dark options styling", async ({ page }) => {
    // Set dark theme on html
    await page.evaluate(() => document.documentElement.classList.add("dark"));

    const addSectionBtn = page.getByRole("button", { name: /Adicionar Secção|Add Section/i }).first();
    await addSectionBtn.scrollIntoViewIfNeeded();
    await addSectionBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Verify option button has dark:bg-[#21262d] class and not raw white
    const unselectedOption = dialog.locator('button:has-text("Formação"), button:has-text("Educação"), button:has-text("Education")').first();
    await expect(unselectedOption).toBeVisible();
    const classList = await unselectedOption.getAttribute("class");
    expect(classList).toMatch(/dark:bg-\[#21262d\]|dark:bg-stone-800/);

    // Close modal
    const closeBtn = dialog.locator("button").first();
    await closeBtn.click();
  });

  test("opens LaTeX Code Editor and presents compilable LaTeX code", async ({ page }) => {
    const latexTab = page.locator('button:has-text("LaTeX")').first();
    await expect(latexTab).toBeVisible();
    await latexTab.click();

    // Code area contains document structure
    const codeArea = page.locator('textarea[spellcheck="false"]').first();
    await expect(codeArea).toBeVisible();
    const latexContent = await codeArea.inputValue();
    expect(latexContent).toContain("\\documentclass");
  });
});
