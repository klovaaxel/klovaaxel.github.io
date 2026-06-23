import { config } from "./config.js";

const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  container.innerHTML = `<p class="loading">Loading GitHub activity…</p>`;

  try {
    const [user, activity] = await Promise.all([
      fetchGitHub(`/users/${config.github.username}`),
      fetchContributions(config.github.username),
    ]);

    const streaks = computeStreaks(activity.contributions);
    container.innerHTML = renderDashboard(user, activity, streaks);
  } catch {
    container.innerHTML = `<p class="empty-state">Could not load GitHub dashboard. <a href="${config.github.url}">View profile on GitHub</a>.</p>`;
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

function computeStreaks(contributions) {
  const activeDates = new Set(
    contributions.filter((day) => day.count > 0).map((day) => day.date),
  );

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

function buildWeeks(contributions) {
  const byDate = new Map(contributions.map((day) => [day.date, day]));
  const first = parseDate(contributions[0].date);
  const last = parseDate(contributions[contributions.length - 1].date);

  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  const cursor = new Date(start);

  while (cursor <= last) {
    const week = [];
    for (let day = 0; day < 7; day += 1) {
      const dateStr = toDateKey(cursor);
      week.push(byDate.get(dateStr) ?? { date: dateStr, count: 0, level: 0 });
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
    const month = parseDate(week[0].date).getMonth();
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

function renderDashboard(user, activity, streaks) {
  const weeks = buildWeeks(activity.contributions);
  const labels = monthLabels(weeks);
  const total = activity.total?.lastYear ?? 0;
  const profileUrl = user.html_url ?? config.github.url;

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
            src="${user.avatar_url}"
            alt=""
            width="48"
            height="48"
            loading="lazy"
          />
          <span class="github-dashboard-handle">@${escapeHtml(user.login)}</span>
        </a>
        <a class="github-dashboard-link" href="${profileUrl}" target="_blank" rel="noopener noreferrer">
          View on GitHub →
        </a>
      </div>

      <dl class="github-stats">
        ${stats
          .map(
            (stat) => `
          <div class="github-stat">
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

      <figure class="contrib-graph">
        <figcaption class="contrib-graph-caption">
          <span class="contrib-graph-total">${total} contributions in the last year</span>
        </figcaption>
        <div class="contrib-graph-scroll">
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
                role="img"
                aria-label="${total} contributions in the last year on GitHub"
              >
                ${weeks
                  .map(
                    (week) => `
                  <div class="contrib-week">
                    ${week
                      .map((day) => {
                        const label =
                          day.count === 0
                            ? `No contributions on ${formatDisplayDate(day.date)}`
                            : `${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDisplayDate(day.date)}`;
                        return `<span class="contrib-cell" data-level="${day.level}" title="${escapeHtml(label)}"></span>`;
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
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
