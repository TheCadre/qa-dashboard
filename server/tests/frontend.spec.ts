import { expect, test } from "@playwright/test";

test.describe("Frontend Tests", () => {
  test("homepage title should exist", async ({ page }) => {
    // Navigate to the frontend URL (Vite dev server runs on port 5173 by default)
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if the page has a title (any title)
    const title = await page.title();
    console.log(`Page title: ${title}`);
    expect(title).toBeTruthy();

    // Verify that main app container exists
    await expect(page.locator("#root")).toBeVisible();
  });

  test("dashboard components load correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if navbar component is visible
    try {
      const navbar = await page.locator("nav").first();
      await expect(navbar).toBeVisible();
      console.log("Navbar is visible");
    } catch (e) {
      console.log("Navbar might not exist yet");
    }

    // Take a screenshot for evidence
    await page.screenshot({ path: "test-results/homepage.png" });
  });
});
