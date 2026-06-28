import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockGitHubDashboard } from "./github-fixtures.js";

/** Theme switch adds `.theme-transitioning` for ~750ms; axe must run after tokens settle. */
async function waitForThemeSettled(page) {
    await expect
        .poll(async () =>
            page.evaluate(
                () =>
                    !document.documentElement.classList.contains("theme-transitioning") &&
                    !document.documentElement.classList.contains("theme-sweeping"),
            ),
        )
        .toBe(true);
}

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

    test("passes color-contrast on core themes (sketch excluded)", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width: 1280, height: 4000 });
        await mockGitHubDashboard(page);

        const themes = [
            { label: "Dark theme", theme: "dark" },
            { label: "Light theme", theme: "light" },
            { label: "Forest theme", theme: "forest" },
            { label: "Ocean theme", theme: "ocean" },
        ];

        for (const { label, theme } of themes) {
            await page.goto("/");
            await page.getByRole("button", { name: label }).click();
            await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
            await waitForThemeSettled(page);
            await expect(page.locator(".github-dashboard")).toBeVisible({ timeout: 10_000 });

            const results = await new AxeBuilder({ page })
                .exclude(".theme-ambient, .theme-sweep, .sketch-filters")
                .withRules(["color-contrast"])
                .analyze();
            expect(results.violations, `color-contrast violations on ${theme}`).toEqual([]);
        }
    });

    test("contribution grid keyboard keeps scroll at top", async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 4000 });
        await mockGitHubDashboard(page);
        await page.goto("/");

        const rovingCell = page.locator('.contrib-cell[role="gridcell"][tabindex="0"]').first();
        await expect(rovingCell).toBeVisible({ timeout: 10_000 });
        await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);

        const startWeek = await rovingCell.getAttribute("data-week");

        for (let i = 0; i < 80; i += 1) {
            const onGrid = await page.evaluate(
                () => document.activeElement?.classList.contains("contrib-cell") ?? false,
            );
            if (onGrid) break;
            await page.keyboard.press("Tab");
        }

        await expect
            .poll(async () => page.evaluate(() => document.activeElement?.classList.contains("contrib-cell") ?? false))
            .toBe(true);

        const scrollBefore = await page.evaluate(() => window.scrollY);
        await page.keyboard.press("ArrowRight");
        const scrollAfter = await page.evaluate(() => window.scrollY);
        expect(scrollAfter).toBe(scrollBefore);

        await expect(rovingCell).not.toHaveAttribute("data-week", startWeek ?? "");
    });
});
