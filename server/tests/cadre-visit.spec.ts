import { expect, test } from "@playwright/test";

test.describe("External Site Tests", () => {
  test("visit CadreODR website", async ({ page }) => {
    // Navigate directly to CadreODR website
    await page.goto("https://cadreodr.com/");

    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Take a screenshot of the CadreODR website
    await page.screenshot({
      path: "test-results/cadreodr-website.png",
      fullPage: true,
    });

    // Validate that we are on the correct website
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain("cadreodr");
  });
});
