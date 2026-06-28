/**
 * GitHub dashboard: API fetch, contribution graph, streak stats.
 *
 * innerHTML templating:
 * - Trusted (static markup, numeric counters, MONTHS labels, skeleton/error shells): no escape.
 * - Escaped via escapeHtml: API strings (login, avatar URL, profile URL, tooltips, stat labels).
 */
import { config } from "./config.js";
import { refreshCursorTargets } from "./cursor.js";
import { escapeHtml } from "./html.js";
import { announceStatus } from "./live-region.js";

const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NEW_TAB_SR_ONLY = '<span class="sr-only"> (opens in new tab)</span>';
const STAT_LABELS = ["Contributions", "Public repos", "Followers", "Current streak", "Longest streak"];

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

export async function loadGitHubDashboard() {
    const container = document.getElementById("github-dashboard");
    if (!container) return;

    container.innerHTML = renderSkeleton();
    announceStatus("Loading GitHub activity");

    try {
        const [user, activity] = await Promise.all([
            fetchGitHub(`/users/${config.github.username}`),
            fetchContributions(config.github.username),
        ]);

        const contributions = activity.contributions ?? [];
        const streaks = computeStreaks(contributions);
        container.innerHTML = renderDashboard(user, { ...activity, contributions }, streaks);
        wireContributionGridKeyboard(container);
        refreshCursorTargets();
        announceStatus("GitHub activity loaded");
    } catch {
        container.innerHTML = renderError();
        container.querySelector(".github-retry-btn")?.addEventListener("click", () => {
            loadGitHubDashboard();
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

function renderSkeleton() {
    return `
    <div class="github-dashboard github-skeleton" aria-busy="true" aria-label="Loading GitHub activity">
      <div class="github-dashboard-header">
        <div class="github-skeleton-profile">
          <span class="github-skeleton github-skeleton-avatar" aria-hidden="true"></span>
          <span class="github-skeleton github-skeleton-handle" aria-hidden="true"></span>
        </div>
        <span class="github-skeleton github-skeleton-link" aria-hidden="true"></span>
      </div>

      <dl class="github-stats" aria-hidden="true">
        ${STAT_LABELS.map(
            () => `
          <div class="github-skeleton-stat">
            <span class="github-skeleton github-skeleton-stat-label"></span>
            <span class="github-skeleton github-skeleton-stat-value"></span>
          </div>
        `,
        ).join("")}
      </dl>

      <div class="github-skeleton-graph" aria-hidden="true">
        <span class="github-skeleton github-skeleton-graph-caption"></span>
        <div class="github-skeleton github-skeleton-graph-grid"></div>
      </div>
    </div>
  `;
}

function renderError() {
    const profileUrl = escapeHtml(config.github.url);
    return `
    <div class="github-dashboard-error empty-state">
      <p>Could not load GitHub dashboard.</p>
      <p>
        <button type="button" class="github-retry-btn">Retry</button>
        <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">
          View profile on GitHub
          ${NEW_TAB_SR_ONLY}
        </a>
      </p>
    </div>
  `;
}

function renderContributionGraph(weeks, labels, total) {
    if (!weeks.length) {
        return `
      <figure class="contrib-graph">
        <figcaption class="contrib-graph-caption">
          <span class="contrib-graph-total">No contribution data available</span>
        </figcaption>
        <p class="empty-state">Contribution history is unavailable right now.</p>
      </figure>
    `;
    }

    return `
      <figure class="contrib-graph">
        <figcaption class="contrib-graph-caption">
          <span class="contrib-graph-total">${total} contributions in the last year</span>
        </figcaption>
        <div
          class="contrib-graph-scroll"
          tabindex="0"
          aria-label="Contribution graph scroll region"
        >
          <div class="contrib-graph-layout" style="--week-count: ${weeks.length}">
            <div class="contrib-months" aria-hidden="true">
              ${labels
                  .map(
                      (item) => `
                <span class="contrib-month" style="grid-column: ${item.index + 1}">${item.label}</span>
              `,
                  )
                  .join("")}
            </div>
            <div class="contrib-body">
              <div class="contrib-days" aria-hidden="true">
                <span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span>
              </div>
              <div
                class="contrib-grid"
                role="grid"
                aria-label="${total} contributions in the last year on GitHub"
              >
                ${weeks
                    .map(
                        (week, weekIndex) => `
                  <div class="contrib-week" role="row">
                    ${week
                        .map((day, dayIndex) => {
                            if (day.hidden) {
                                return `<span class="contrib-cell contrib-cell--empty" aria-hidden="true"></span>`;
                            }
                            const label =
                                day.count === 0
                                    ? `No contributions on ${formatDisplayDate(day.date)}`
                                    : `${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDisplayDate(day.date)}`;
                            const safeLabel = escapeHtml(label);
                            return `<span class="contrib-cell" role="gridcell" data-level="${day.level}" data-week="${weekIndex}" data-day="${dayIndex}" tabindex="-1" aria-label="${safeLabel}" title="${safeLabel}"></span>`;
                        })
                        .join("")}
                  </div>
                `,
                    )
                    .join("")}
              </div>
            </div>
          </div>
        </div>
        <div class="contrib-legend" aria-hidden="true">
          <span>Less</span>
          <span class="contrib-cell" data-level="0"></span>
          <span class="contrib-cell" data-level="1"></span>
          <span class="contrib-cell" data-level="2"></span>
          <span class="contrib-cell" data-level="3"></span>
          <span class="contrib-cell" data-level="4"></span>
          <span>More</span>
        </div>
      </figure>
    `;
}

function renderDashboard(user, activity, streaks) {
    const contributions = activity.contributions ?? [];
    const weeks = buildWeeks(contributions);
    const labels = monthLabels(weeks);
    const total = activity.total?.lastYear ?? 0;
    const profileUrl = escapeHtml(user.html_url ?? config.github.url);
    const avatarUrl = escapeHtml(user.avatar_url ?? "");

    const stats = [
        { label: "Contributions", value: total, suffix: "last year" },
        { label: "Public repos", value: user.public_repos },
        { label: "Followers", value: user.followers },
        { label: "Current streak", value: streaks.current, suffix: "days" },
        { label: "Longest streak", value: streaks.longest, suffix: "days" },
    ];

    return `
    <div class="github-dashboard">
      <div class="github-dashboard-header">
        <a class="github-dashboard-profile" href="${profileUrl}" target="_blank" rel="noopener noreferrer">
          <img
            class="profile-avatar"
            src="${avatarUrl}"
            alt=""
            width="48"
            height="48"
            loading="lazy"
          />
          <span class="github-dashboard-handle">@${escapeHtml(user.login)}</span>
          ${NEW_TAB_SR_ONLY}
        </a>
        <a class="github-dashboard-link" href="${profileUrl}" target="_blank" rel="noopener noreferrer">
          View on GitHub →
          ${NEW_TAB_SR_ONLY}
        </a>
      </div>

      <dl class="github-stats">
        ${stats
            .map(
                (stat) => `
          <div class="github-stat" data-magnetic>
            <dt class="github-stat-label">${escapeHtml(stat.label)}</dt>
            <dd class="github-stat-value">
              ${stat.value}
              ${stat.suffix ? `<span class="github-stat-suffix">${escapeHtml(stat.suffix)}</span>` : ""}
            </dd>
          </div>
        `,
            )
            .join("")}
      </dl>

      ${renderContributionGraph(weeks, labels, total)}
    </div>
  `;
}

function getContributionCells(grid) {
    return [...grid.querySelectorAll('.contrib-cell[role="gridcell"]')];
}

function cellCoords(cell) {
    return {
        week: Number(cell.dataset.week),
        day: Number(cell.dataset.day),
    };
}

function findCellByCoords(cells, week, day) {
    return cells.find((cell) => {
        const { week: w, day: d } = cellCoords(cell);
        return w === week && d === day;
    });
}

function focusContributionCell(cells, cell) {
    cells.forEach((item) => {
        item.tabIndex = item === cell ? 0 : -1;
    });
    cell?.focus();
}

function wireContributionGridKeyboard(container) {
    const grid = container.querySelector(".contrib-grid[role='grid']");
    if (!grid) return;

    const cells = getContributionCells(grid);
    if (!cells.length) return;

    const maxWeek = Math.max(...cells.map((cell) => cellCoords(cell).week));
    const maxDay = 6;

    const initial =
        cells.find((cell) => Number(cell.dataset.level) > 0) ?? cells[0];
    focusContributionCell(cells, initial);

    grid.addEventListener("keydown", (event) => {
        const active = document.activeElement;
        if (!active?.classList.contains("contrib-cell")) return;

        const { week, day } = cellCoords(active);
        let next = null;

        switch (event.key) {
            case "ArrowRight":
                next = findCellByCoords(cells, Math.min(week + 1, maxWeek), day);
                break;
            case "ArrowLeft":
                next = findCellByCoords(cells, Math.max(week - 1, 0), day);
                break;
            case "ArrowDown":
                next = findCellByCoords(cells, week, Math.min(day + 1, maxDay));
                break;
            case "ArrowUp":
                next = findCellByCoords(cells, week, Math.max(day - 1, 0));
                break;
            case "Home":
                next = findCellByCoords(cells, 0, day);
                break;
            case "End":
                next = findCellByCoords(cells, maxWeek, day);
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
