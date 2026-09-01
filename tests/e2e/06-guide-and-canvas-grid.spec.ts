import { test, expect } from "@playwright/test";

test.describe("PAPYRUS Guide Page, Alignment Grid & Pointer/Drag Switching", () => {
  test("navigates to /guide, toggles device selector, and verifies step-by-step content", async ({ page }) => {
    await page.goto("/guide");
    await page.waitForLoadState("networkidle");

    // Verify title and header
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText(/1\. Troca de Modelos|1\. Live Templates|1\. Escolher/i)).toBeVisible();

    // Verify device switcher exists and toggles
    const mobileBtn = page.getByRole("button", { name: /Telemóvel|Mobile/i });
    const webBtn = page.getByRole("button", { name: /Computador|Desktop/i });
    await expect(mobileBtn).toBeVisible();
    await expect(webBtn).toBeVisible();

    // Switch to mobile mode
    await mobileBtn.click();
    await expect(page.locator('video[src*="mobile-action-1-templates.webm"]')).toBeVisible();

    // Switch to web mode
    await webBtn.click();
    await expect(page.locator('video[src*="web-action-1-templates.webm"]')).toBeVisible();

    // Click back to editor link
    await page.getByRole("link", { name: /Voltar ao Editor|Back to Editor/i }).first().click();
    await page.waitForURL("**/");
  });

  test("verifies smooth vertical scroll works on /guide page", async ({ page }) => {
    await page.goto("/guide");
    await page.waitForLoadState("networkidle");

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
    expect(scrollHeight).toBeGreaterThan(clientHeight);

    // Scroll down 400px
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: "instant" }));
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);

    // Scroll to the bottom CTA
    await page.getByText(/Pronto para criar o teu currículo|Ready to craft your resume/i).scrollIntoViewIfNeeded();
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(500);
  });

  test("toggles alignment grid on preview canvas and verifies grid overlay", async ({ page, isMobile }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // If onboarding is open, click Demo
    const demoBtn = page.getByRole("button", { name: /Demo/i });
    if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await demoBtn.click();
    }

    if (isMobile) {
      await page.getByRole("button", { name: /Pré-visualização|Preview/i }).click();
    }

    await expect(page.locator("#cv-printable-page")).toBeVisible();

    // Find grid button on floating toolbar
    const gridBtn = page.getByTestId("canvas-floating-toolbar").getByTitle(/grelha|grid/i);
    await expect(gridBtn).toBeVisible();

    // Toggle grid on
    await gridBtn.click();
    await expect(page.getByTestId("alignment-grid-overlay")).toBeVisible();

    // Toggle grid off
    await gridBtn.click();
    await expect(page.getByTestId("alignment-grid-overlay")).not.toBeVisible();
  });

  test("switches between pointer and hand mode and verifies section click-to-edit in pointer mode", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop pointer/hand tool mode test");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const demoBtn = page.getByRole("button", { name: /Demo/i });
    if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await demoBtn.click();
    }

    await expect(page.locator("#cv-printable-page")).toBeVisible();

    const canvasToolbar = page.getByTestId("canvas-floating-toolbar");
    const handBtn = canvasToolbar.getByTitle(/Modo Mão|Hand tool/i);
    const pointerBtn = canvasToolbar.getByTitle(/Modo Seleção|Selection mode/i);

    // Switch to Hand mode
    await handBtn.click();

    // Switch back to Pointer mode
    await pointerBtn.click();

    // Click on personal header or experience section in preview
    const previewName = page.locator("#cv-printable-page").locator("h1").first();
    await previewName.click();

    // Verify click-to-edit triggered and focused/highlighted editor card
    const personalCard = page.locator("#section-personal");
    await expect(personalCard).toBeVisible();
  });
});
