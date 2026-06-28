import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("portfolio smoke", () => {
    test("loads at scroll top with hero visible", async ({ page }) => {
        await page.goto("/");
        await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);
        await expect(page.locator(".hero-name-part").first()).toBeVisible();
    });

    test("does not jump scroll after GitHub widget init", async ({ page }) => {
        await page.goto("/");
        await page.waitForTimeout(800);
        await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("theme switcher applies a theme for the session", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Light theme" }).click();
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    });

    test("shows matching ambient layer for each core theme", async ({ page }) => {
        const cases = [
            { label: "Ocean theme", theme: "ocean", layer: ".ambient-ocean" },
            { label: "Forest theme", theme: "forest", layer: ".ambient-forest" },
            { label: "Dark theme", theme: "dark", layer: ".ambient-space" },
            { label: "Light theme", theme: "light", layer: ".ambient-sunny" },
        ];

        for (const { label, theme, layer } of cases) {
            await page.goto("/");
            await page.getByRole("button", { name: label }).click();
            await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
            await expect(page.locator(layer)).toBeVisible();
        }
    });

    test("passes axe accessibility scan", async ({ page }) => {
        await page.goto("/");
        const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
        expect(results.violations).toEqual([]);
    });
});
