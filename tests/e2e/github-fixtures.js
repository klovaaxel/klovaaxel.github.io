/** Shared mock payloads for Playwright GitHub API interception. */

export const mockGitHubUser = {
    login: "klovaaxel",
    avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    public_repos: 12,
    followers: 3,
    html_url: "https://github.com/klovaaxel",
};

export function mockContributions(days = 21) {
    const contributions = [];
    const start = new Date();
    start.setDate(start.getDate() - days);

    for (let i = 0; i < days; i += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const key = date.toISOString().slice(0, 10);
        contributions.push({ date: key, count: i % 3 === 0 ? 0 : 1, level: i % 3 === 0 ? 0 : 1 });
    }

    return {
        contributions,
        total: { lastYear: 42 },
    };
}

/** Intercept GitHub user + contributions APIs; clear dashboard cache before navigation. */
export async function mockGitHubDashboard(page) {
    await page.addInitScript(() => {
        sessionStorage.clear();
    });

    await page.route("**/api.github.com/users/**", (route) => {
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockGitHubUser),
        });
    });

    await page.route("**/github-contributions-api.jogruber.de/**", (route) => {
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockContributions()),
        });
    });
}
