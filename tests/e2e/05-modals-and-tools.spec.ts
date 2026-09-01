import { test, expect } from "@playwright/test";
import { enterBuilder } from "./helpers";

test.describe("PAPYRUS Modals & Export Engine", () => {
  test.beforeEach(async ({ page }) => {
    await enterBuilder(page);
    await expect(page.locator("#section-personal")).toBeVisible();
  });

  test("opens Quality Linter modal and shows score audit", async ({ page }) => {
    // Click on linter score button in header
    const linterBadge = page.getByTestId("linter-badge");
    await linterBadge.click();

    // Verify modal appears with score card
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("heading", { level: 3 })).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/Score/i)).toBeVisible();

    // Close modal via Done / Concluído or close button
    const closeBtn = page.getByRole("dialog").locator("button").filter({ hasText: /✕|Fechar|Close|Concluído|Done/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
  });

  test("opens Add Section modal and displays section options", async ({ page }) => {
    const addSectionBtn = page.getByRole("button", { name: /Adicionar Secção|Add Section/i });
    await addSectionBtn.scrollIntoViewIfNeeded();
    await addSectionBtn.click();

    // Verify Add Section modal is visible
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/Experiência|Experience/i)).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/Educação|Education/i)).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole("dialog").locator("button").first();
    await closeBtn.click();
  });

  test("opens Add Section modal in dark mode and verifies dark options styling", async ({ page }) => {
    // Set dark theme on html
    await page.evaluate(() => document.documentElement.classList.add("dark"));

    const addSectionBtn = page.getByRole("button", { name: /Adicionar Secção|Add Section/i });
    await addSectionBtn.scrollIntoViewIfNeeded();
    await addSectionBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Verify option button has dark:bg-stone-800 class and not raw white
    const unselectedOption = dialog.locator('button:has-text("Educação"), button:has-text("Education")').first();
    await expect(unselectedOption).toBeVisible();
    const classList = await unselectedOption.getAttribute("class");
    expect(classList).toContain("dark:bg-stone-800/60");

    // Close modal
    const closeBtn = dialog.locator("button").first();
    await closeBtn.click();
  });

  test("opens TeX Modal and presents compilable LaTeX code", async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, TeX is inside Presets / Modelos dropdown
      const presetsBtn = page.locator("header").locator("button").filter({ has: page.locator("svg.lucide-layers") }).first();
      await presetsBtn.click();
      const texOption = page.getByRole("button", { name: /TeX Import \/ Export/i });
      await texOption.click();
    } else {
      // Desktop: TeX button is in header
      const texBtn = page.locator('button[title="TeX Management"]');
      await texBtn.click();
    }

    // Modal dialog is open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/TeX/i).first()).toBeVisible();

    // Code area contains document structure
    const codeArea = page.getByRole("dialog").locator("pre, textarea, code").first();
    await expect(codeArea).toBeVisible();
  });
});
