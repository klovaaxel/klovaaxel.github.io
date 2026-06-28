import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL: "http://127.0.0.1:8080",
        trace: "on-first-retry",
    },
    webServer: {
        command: "python3 -m http.server 8080 --bind 127.0.0.1",
        port: 8080,
        reuseExistingServer: !process.env.CI,
    },
});
