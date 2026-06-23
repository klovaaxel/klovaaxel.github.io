import { config } from "./config.js";

const LANG_COLORS = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572a5",
    Swift: "#f05138",
    HTML: "#e34c26",
    CSS: "#563d7c",
    C: "#555555",
    "C#": "#178600",
    Rust: "#dea584",
    Go: "#00add8",
    Ruby: "#701516",
    Java: "#b07219",
    Shell: "#89e051",
    Zig: "#ec915c",
};

export async function loadGitHubProfile() {
    const container = document.getElementById("github-profile");
    if (!container) return;

    try {
        const user = await fetchGitHub(`/users/${config.github.username}`);
        container.innerHTML = renderProfile(user);
    } catch {
        container.innerHTML = `<p class="empty-state">Could not load GitHub profile.</p>`;
    }
}

export async function loadGitHubRepos() {
    const container = document.getElementById("github-repos");
    if (!container) return;

    container.innerHTML = `<p class="loading">Loading projects…</p>`;

    try {
        const repos = await fetchGitHub(
            `/users/${config.github.username}/repos?sort=${config.githubRepos.sort}&per_page=100`,
        );

        const excludeSet = new Set(config.githubRepos.exclude ?? []);
        const nonForks = repos.filter(
            (repo) => (config.githubRepos.excludeForks ? !repo.fork : true) && !excludeSet.has(repo.name),
        );

        let filtered;
        if (config.githubRepos.mode === "featured" && config.githubRepos.featured?.length) {
            const byName = new Map(nonForks.map((repo) => [repo.name, repo]));
            filtered = config.githubRepos.featured
                .map((name) => byName.get(name))
                .filter(Boolean)
                .slice(0, config.githubRepos.maxCount);
        } else {
            filtered = nonForks.slice(0, config.githubRepos.maxCount);
        }

        if (filtered.length === 0) {
            container.innerHTML = `<p class="empty-state">No public repositories found.</p>`;
            return;
        }

        container.innerHTML = `<div class="repo-grid">${filtered.map(renderRepoCard).join("")}</div>`;
    } catch {
        container.innerHTML = `<p class="empty-state">Could not load repositories.</p>`;
    }
}

async function fetchGitHub(path) {
    const res = await fetch(`https://api.github.com${path}`, {
        headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return res.json();
}

function renderProfile(user) {
    return `
    <div class="profile-card">
      <img
        class="profile-avatar"
        src="${user.avatar_url}"
        alt="${user.name ?? user.login}'s avatar"
        width="72"
        height="72"
        loading="lazy"
      />
      <div class="profile-info">
        <p class="profile-name">${escapeHtml(user.name ?? user.login)}</p>
        <p class="profile-bio">${escapeHtml(user.bio ?? config.linkedin.headline ?? config.tagline)}</p>
        <div class="profile-stats">
          <span>${user.public_repos} repos</span>
          <span>${user.followers} followers</span>
          ${user.location ? `<span>${escapeHtml(user.location)}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderRepoCard(repo) {
    const lang = repo.language;
    const langColor = lang ? (LANG_COLORS[lang] ?? "var(--color-accent)") : null;

    return `
    <a class="repo-card" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
      <div class="repo-card-header">
        <span class="repo-card-name">${escapeHtml(repo.name)}</span>
        ${
            repo.stargazers_count > 0
                ? `<span class="repo-card-stars">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ${repo.stargazers_count}
          </span>`
                : ""
        }
      </div>
      <p class="repo-card-desc">${escapeHtml(repo.description ?? "No description")}</p>
      <div class="repo-card-meta">
        ${
            lang
                ? `<span class="repo-card-lang">
            <span class="lang-dot" style="background: ${langColor}"></span>
            ${escapeHtml(lang)}
          </span>`
                : ""
        }
      </div>
    </a>
  `;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
