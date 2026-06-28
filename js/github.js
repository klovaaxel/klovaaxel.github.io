/**
 * GitHub dashboard: API fetch, contribution graph, streak stats.
 * Static shells live in <template> elements in index.html; dynamic data via DOM APIs.
 */
import { config } from "./config.js";
import { refreshCursorTargets } from "./cursor.js";
import { announceStatus } from "./live-region.js";

const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";
export const GITHUB_CACHE_KEY = "axel-portfolio-github-v1";
export const GITHUB_CACHE_TTL_MS = 5 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let loadGeneration = 0;

export function readGitHubCache(now = Date.now()) {
    if (typeof sessionStorage === "undefined") return null;

    try {
        const raw = sessionStorage.getItem(GITHUB_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed?.ts || now - parsed.ts > GITHUB_CACHE_TTL_MS) return null;
        if (!parsed.user || !parsed.activity) return null;

        return { user: parsed.user, activity: parsed.activity };
    } catch {
        return null;
    }
}

export function writeGitHubCache(user, activity) {
    if (typeof sessionStorage === "undefined") return;

    try {
        sessionStorage.setItem(
            GITHUB_CACHE_KEY,
            JSON.stringify({
                ts: Date.now(),
                user,
                activity,
            }),
        );
    } catch {
        // Private browsing or quota exceeded — skip cache write.
    }
}

function cloneTemplate(id) {
    const template = document.getElementById(id);
    if (!template) {
        throw new Error(`Missing template: #${id}`);
    }
    return template.content.cloneNode(true);
}

function profileUrl(user) {
    return user.html_url ?? config.github.url;
}

function renderDashboardInto(container, user, activity) {
    const contributions = activity.contributions ?? [];
    const streaks = computeStreaks(contributions);
    container.replaceChildren(buildDashboard(user, { ...activity, contributions }, streaks));
    wireContributionGridKeyboard(container);
    refreshCursorTargets();
}

function mountSkeleton(container) {
    container.replaceChildren(cloneTemplate("github-skeleton-template"));
}

function mountError(container) {
    const root = cloneTemplate("github-error-template");
    root.querySelectorAll("[data-github-profile-link]").forEach((link) => {
        link.href = config.github.url;
    });
    container.replaceChildren(root);
}

function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export async function loadGitHubDashboard({ bypassCache = false } = {}) {
    const container = document.getElementById("github-dashboard");
    if (!container) return;

    const generation = ++loadGeneration;

    const cached = bypassCache ? null : readGitHubCache();
    if (cached) {
        renderDashboardInto(container, cached.user, cached.activity);
        announceStatus("GitHub activity loaded");
        return;
    }

    mountSkeleton(container);
    announceStatus("Loading GitHub activity");

    try {
        const [user, activity] = await Promise.all([
            fetchGitHub(`/users/${config.github.username}`),
            fetchContributions(config.github.username),
        ]);

        if (generation !== loadGeneration) return;

        const contributions = activity.contributions ?? [];
        writeGitHubCache(user, { ...activity, contributions });
        renderDashboardInto(container, user, { ...activity, contributions });
        announceStatus("GitHub activity loaded");
    } catch {
        if (generation !== loadGeneration) return;

        mountError(container);
        container.querySelector(".github-retry-btn")?.addEventListener("click", (event) => {
            event.currentTarget.disabled = true;
            loadGitHubDashboard({ bypassCache: true });
        });
        announceStatus("Could not load GitHub activity");
    }
}

async function fetchGitHub(path) {
    const res = await fetch(`https://api.github.com${path}`, {
        headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return res.json();
}

async function fetchContributions(username) {
    const res = await fetch(`${CONTRIBUTIONS_API}/${username}?y=last`);
    if (!res.ok) throw new Error(`Contributions API ${res.status}`);
    return res.json();
}

export function computeStreaks(contributions) {
    if (!contributions?.length) {
        return { current: 0, longest: 0 };
    }

    const activeDates = new Set(contributions.filter((day) => day.count > 0).map((day) => day.date));

    let longest = 0;
    let run = 0;
    const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));

    for (const day of sorted) {
        if (day.count > 0) {
            run += 1;
            longest = Math.max(longest, run);
        } else {
            run = 0;
        }
    }

    let current = 0;
    const today = new Date();
    const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let i = 0; i < 366; i += 1) {
        const key = toDateKey(cursor);
        if (activeDates.has(key)) {
            current += 1;
            cursor.setDate(cursor.getDate() - 1);
        } else if (i === 0) {
            cursor.setDate(cursor.getDate() - 1);
        } else {
            break;
        }
    }

    return { current, longest };
}

export function buildWeeks(contributions) {
    if (!contributions?.length) {
        return [];
    }

    const byDate = new Map(contributions.map((day) => [day.date, day]));
    const first = parseDate(contributions[0].date);
    const last = parseDate(contributions[contributions.length - 1].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = today > last ? today : last;

    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay());

    const weeks = [];
    const cursor = new Date(start);

    while (cursor <= end) {
        const week = [];
        for (let day = 0; day < 7; day += 1) {
            const dateStr = toDateKey(cursor);
            const entry = byDate.get(dateStr);
            if (entry) {
                week.push(entry);
            } else if (cursor > today) {
                week.push({ date: dateStr, count: 0, level: 0, hidden: true });
            } else {
                week.push({ date: dateStr, count: 0, level: 0 });
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
    }

    return weeks;
}

function monthLabels(weeks) {
    const labels = [];
    let lastMonth = -1;

    weeks.forEach((week, index) => {
        const anchor = week.find((day) => !day.hidden && day.date);
        if (!anchor) return;

        const month = parseDate(anchor.date).getMonth();
        if (month !== lastMonth) {
            labels.push({ index, label: MONTHS[month] });
            lastMonth = month;
        }
    });

    return labels;
}

function formatDisplayDate(dateStr) {
    return parseDate(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function contributionCellLabel(day) {
    if (day.count === 0) {
        return `No contributions on ${formatDisplayDate(day.date)}`;
    }
    const plural = day.count === 1 ? "" : "s";
    return `${day.count} contribution${plural} on ${formatDisplayDate(day.date)}`;
}

function buildStatItem({ label, value, suffix }) {
    const item = cloneTemplate("github-stat-template");
    item.querySelector(".github-stat-label").textContent = label;
    item.querySelector(".github-stat-number").textContent = String(value);
    const suffixEl = item.querySelector(".github-stat-suffix");
    if (suffix) {
        suffixEl.textContent = suffix;
        suffixEl.hidden = false;
    }
    return item;
}

function buildContributionCell(day, weekIndex, dayIndex) {
    if (day.hidden) {
        return cloneTemplate("github-contrib-cell-empty-template");
    }

    const cell = cloneTemplate("github-contrib-cell-template").firstElementChild;
    const label = contributionCellLabel(day);
    cell.dataset.level = String(day.level);
    cell.dataset.week = String(weekIndex);
    cell.dataset.day = String(dayIndex);
    cell.setAttribute("aria-label", label);
    cell.title = label;
    return cell;
}

function buildContributionGraph(weeks, labels, total) {
    if (!weeks.length) {
        return cloneTemplate("github-contrib-empty-template");
    }

    const figure = cloneTemplate("github-contrib-graph-template");
    const layout = figure.querySelector(".contrib-graph-layout");
    const monthsContainer = figure.querySelector(".contrib-months");
    const grid = figure.querySelector(".contrib-grid");

    figure.querySelector(".contrib-graph-total").textContent = `${total} contributions in the last year`;
    layout.style.setProperty("--week-count", String(weeks.length));
    grid.setAttribute("aria-label", `${total} contributions in the last year on GitHub`);

    for (const item of labels) {
        const month = cloneTemplate("github-contrib-month-template").firstElementChild;
        month.textContent = item.label;
        month.style.gridColumn = String(item.index + 1);
        monthsContainer.append(month);
    }

    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex += 1) {
        const weekEl = cloneTemplate("github-contrib-week-template").firstElementChild;
        const week = weeks[weekIndex];
        for (let dayIndex = 0; dayIndex < week.length; dayIndex += 1) {
            weekEl.append(buildContributionCell(week[dayIndex], weekIndex, dayIndex));
        }
        grid.append(weekEl);
    }

    return figure;
}

function buildDashboard(user, activity, streaks) {
    const contributions = activity.contributions ?? [];
    const weeks = buildWeeks(contributions);
    const labels = monthLabels(weeks);
    const total = activity.total?.lastYear ?? 0;
    const url = profileUrl(user);

    const dashboard = cloneTemplate("github-dashboard-template");
    const avatar = dashboard.querySelector("[data-github-avatar]");
    avatar.src = user.avatar_url ?? "";
    dashboard.querySelector("[data-github-handle]").textContent = `@${user.login}`;
    dashboard.querySelectorAll("[data-github-profile-link]").forEach((link) => {
        link.href = url;
    });

    const statsContainer = dashboard.querySelector("[data-github-stats]");
    const stats = [
        { label: "Contributions", value: total, suffix: "last year" },
        { label: "Public repos", value: user.public_repos },
        { label: "Followers", value: user.followers },
        { label: "Current streak", value: streaks.current, suffix: "days" },
        { label: "Longest streak", value: streaks.longest, suffix: "days" },
    ];
    for (const stat of stats) {
        statsContainer.append(buildStatItem(stat));
    }

    dashboard.querySelector("[data-github-contrib-mount]").append(buildContributionGraph(weeks, labels, total));

    return dashboard;
}

function getContributionCells(grid) {
    return [...grid.querySelectorAll('.contrib-cell[role="gridcell"]')];
}

export function cellCoords(cell) {
    return {
        week: Number(cell.dataset.week),
        day: Number(cell.dataset.day),
    };
}

export function findCellByCoords(cells, week, day) {
    return cells.find((cell) => {
        const { week: w, day: d } = cellCoords(cell);
        return w === week && d === day;
    });
}

const GRID_DIRECTIONS = {
    ArrowRight: { dWeek: 1, dDay: 0 },
    ArrowLeft: { dWeek: -1, dDay: 0 },
    ArrowDown: { dWeek: 0, dDay: 1 },
    ArrowUp: { dWeek: 0, dDay: -1 },
};

export function findCellInDirection(cells, startCell, direction) {
    const delta = GRID_DIRECTIONS[direction];
    if (!delta) return null;

    let { week, day } = cellCoords(startCell);
    const maxWeek = Math.max(...cells.map((cell) => cellCoords(cell).week));
    const maxDay = 6;

    week += delta.dWeek;
    day += delta.dDay;

    while (week >= 0 && week <= maxWeek && day >= 0 && day <= maxDay) {
        const cell = findCellByCoords(cells, week, day);
        if (cell) return cell;
        week += delta.dWeek;
        day += delta.dDay;
    }

    return null;
}

export function findFirstCellInDayRow(cells, day) {
    const maxWeek = Math.max(...cells.map((cell) => cellCoords(cell).week));
    for (let week = 0; week <= maxWeek; week += 1) {
        const cell = findCellByCoords(cells, week, day);
        if (cell) return cell;
    }
    return null;
}

export function findLastCellInDayRow(cells, day) {
    const maxWeek = Math.max(...cells.map((cell) => cellCoords(cell).week));
    for (let week = maxWeek; week >= 0; week -= 1) {
        const cell = findCellByCoords(cells, week, day);
        if (cell) return cell;
    }
    return null;
}

function setRovingTabIndex(cells, activeCell) {
    cells.forEach((item) => {
        item.tabIndex = item === activeCell ? 0 : -1;
    });
}

function focusContributionCell(cells, cell) {
    setRovingTabIndex(cells, cell);
    cell?.focus({ preventScroll: true });
}

export function wireContributionGridKeyboard(container) {
    const grid = container.querySelector(".contrib-grid[role='grid']");
    if (!grid) return;

    const cells = getContributionCells(grid);
    if (!cells.length) return;

    const initial = cells.find((cell) => Number(cell.dataset.level) > 0) ?? cells[0];
    setRovingTabIndex(cells, initial);

    grid.addEventListener("keydown", (event) => {
        const active = document.activeElement;
        if (!active?.classList.contains("contrib-cell")) return;

        const { day } = cellCoords(active);
        let next = null;

        switch (event.key) {
            case "ArrowRight":
            case "ArrowLeft":
            case "ArrowDown":
            case "ArrowUp":
                next = findCellInDirection(cells, active, event.key);
                break;
            case "Home":
                next = findFirstCellInDayRow(cells, day);
                break;
            case "End":
                next = findLastCellInDayRow(cells, day);
                break;
            case "Enter":
            case " ":
                announceStatus(active.getAttribute("aria-label") ?? "");
                event.preventDefault();
                return;
            default:
                return;
        }

        if (next) {
            event.preventDefault();
            focusContributionCell(cells, next);
        }
    });
}
