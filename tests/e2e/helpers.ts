import { Page, expect } from "@playwright/test";

export async function enterBuilder(page: Page) {
  await page.goto("/");

  // Check if already in builder
  if (await page.locator("#section-personal").isVisible()) {
    return;
  }

  // If in setup screen:
  const resumeBtn = page.getByRole("button", { name: /Retomar|Resume/i });
  if (await resumeBtn.isVisible()) {
    await resumeBtn.click();
    await expect(page.locator("#section-personal")).toBeVisible();
    return;
  }

  const demoBtn = page.getByRole("button", { name: /Demo/i });
  if (await demoBtn.isVisible()) {
    await demoBtn.click();
    await expect(page.locator("#section-personal")).toBeVisible();
    return;
  }

  const blankBtn = page.getByRole("button", { name: /Blank|Em Branco/i });
  if (await blankBtn.isVisible()) {
    await blankBtn.click();
    await expect(page.locator("#section-personal")).toBeVisible();
    return;
  }
}
