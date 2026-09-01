import { test, expect } from "@playwright/test";
import { enterBuilder } from "./helpers";

test.describe("PAPYRUS High-Performance Technical Suite", () => {
  test.beforeEach(async ({ page }) => {
    await enterBuilder(page);
    await expect(page.locator("#section-personal")).toBeVisible();
  });

  test("opens Command Palette with Cmd+K, searches, and switches template", async ({ page, isMobile }) => {
    // Press Meta+K or Ctrl+K to open Command Palette
    await page.keyboard.press("Meta+k");

    // Wait for palette input to be visible
    const searchInput = page.getByPlaceholder(/Digita um comando|Type a command/i);
    await expect(searchInput).toBeVisible();

    // Search for Matrix template
    await searchInput.fill("Matrix");
    await page.waitForTimeout(200);

    // Select and press Enter
    await page.keyboard.press("Enter");

    // Verify modal closes and Matrix template active
    await expect(searchInput).not.toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    }

    await expect(page.locator("#cv-printable-page")).toHaveAttribute("data-template", "matrix", { timeout: 5000 });
  });

  test("tests transactional Undo / Redo engine on name editing", async ({ page }) => {
    const nameInput = page.locator('#section-personal input[type="text"]').first();
    await expect(nameInput).toBeVisible();

    const originalName = await nameInput.inputValue();

    // Type a new name
    await nameInput.click();
    await nameInput.fill("Ada Lovelace");
    await page.waitForTimeout(500); // Wait for debounce capture

    // Check undo button in header is enabled
    const undoBtn = page.locator('button[title*="Desfazer"], button[title*="Undo"]').first();
    if (await undoBtn.isVisible()) {
      await expect(undoBtn).toBeEnabled();
      await undoBtn.click();
      await page.waitForTimeout(300);

      // Verify name reverted to original
      const revertedName = await nameInput.inputValue();
      expect(revertedName).toBe(originalName);

      // Check redo button is enabled
      const redoBtn = page.locator('button[title*="Refazer"], button[title*="Redo"]').first();
      await expect(redoBtn).toBeEnabled();
      await redoBtn.click();
      await page.waitForTimeout(300);

      // Verify name re-applied
      const redoneName = await nameInput.inputValue();
      expect(redoneName).toBe("Ada Lovelace");
    }
  });

  test("switches between Form and Split Code Editor (JSON / LaTeX)", async ({ page }) => {
    // Click JSON tab in editor mode selector
    const jsonTab = page.locator('button:has-text("JSON")').first();
    await jsonTab.click();

    // Check code editor pane is visible
    const codeArea = page.locator('textarea[spellcheck="false"]');
    await expect(codeArea).toBeVisible();
    const jsonContent = await codeArea.inputValue();
    expect(jsonContent).toContain('"personalInfo"');

    // Click LaTeX tab
    const latexTab = page.locator('button:has-text("LaTeX")').first();
    await latexTab.click();
    await page.waitForTimeout(200);

    const latexContent = await codeArea.inputValue();
    expect(latexContent).toContain("\\documentclass");

    // Return to Form mode
    const formTab = page.locator('button:has-text("Formulário"), button:has-text("Form")').first();
    await formTab.click();
    await expect(page.locator("#section-personal")).toBeVisible();
  });

  test("opens Linter and inspects ATS Parser Terminal view", async ({ page }) => {
    // Open linter badge
    const linterBadge = page.getByTestId("linter-badge");
    await linterBadge.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Switch to ATS Parser Terminal tab
    const atsTab = dialog.locator('button:has-text("Terminal"), button:has-text("ATS")').first();
    await atsTab.click();

    // Verify ATS terminal diagnostics are rendered
    await expect(dialog.getByText(/Compatibilidade|Match Rate/i)).toBeVisible();
    await expect(dialog.getByText(/Datas Padrão ISO|ISO Dates/i)).toBeVisible();
    await expect(dialog.getByText(/Tokens de Secções|Indexed Section Tokens/i)).toBeVisible();
    await expect(dialog.locator("pre")).toBeVisible();

    // Close modal
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
