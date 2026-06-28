# axel-portfolio

Personal portfolio site for [axel.eyssen.se](https://axel.eyssen.se).

## Local preview

```bash
cd ~/Projects/axel-portfolio
npm start
```

Open [http://localhost:8080](http://localhost:8080). (`npm start` runs `python3 -m http.server 8080`.)

## Configuration

### Profile and content

Edit **`index.html`** for visible copy and links:

- Hero (name, role, tagline)
- Experience timeline
- Skills
- Footer contact links and social links in the hero

Content is static HTML — no JavaScript hydration.

### GitHub and themes

Edit **`js/config.js`** for:

- GitHub username and profile URL (`config.github`)
- Theme labels, icons, and sketch gating (`THEME_META`)

The dashboard fetches data at runtime from two third-party origins (see [GitHub dashboard APIs](#github-dashboard-apis)).

Theme **colors and PWA chrome** (`themeColor`, `statusBarStyle`, default) live in **`#portfolio-theme-data`** JSON in `index.html`. `config.js` merges that bootstrap data with `THEME_META` at runtime.

### GitHub dashboard APIs

`js/github.js` loads the contributions widget on every visit:

| Origin                                            | Purpose                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `https://api.github.com`                          | User profile (avatar, repo count, followers) — unauthenticated, **60 requests/hour per IP** |
| `https://github-contributions-api.jogruber.de/v4` | Contribution history (not an official GitHub API)                                           |

**Behavior:**

- Responses are cached in **`sessionStorage`** for **5 minutes** (`GITHUB_CACHE_TTL_MS`). **Retry** bypasses cache.
- A **load-generation guard** discards stale in-flight fetches if a newer load starts (e.g. double Retry).
- On failure, the dashboard shows an error state with **Retry** and a link to the profile on GitHub.
- Avatar URLs from the API are restricted to **`https:`** before applying to `<img src>`.

**Head hints:** `<link rel="preconnect" href="https://api.github.com">` is in `index.html`. The contributions host has no preconnect (optional future improvement).

If either API is down or rate-limited, visitors still see static page content; only the GitHub section is affected.

## Themes

The design system uses CSS custom properties:

- `css/tokens.css` — spacing, typography, layout (theme-agnostic)
- `css/fonts.css` — self-hosted Atkinson Hyperlegible (latin 400/700); sketch fonts load on demand via `js/theme.js`
- `css/themes/*.css` — color palettes per theme

Switch themes with the buttons in the top-right corner. A **random theme** is chosen on each page load (`js/theme-bootstrap.js` in `<head>`). Manual picks apply for the **current session only** — nothing is saved to `localStorage`.

To add a new theme:

1. Create `css/themes/your-theme.css` with `[data-theme="your-theme"]` color variables
2. Import it in `css/base.css`
3. Add an entry to `#portfolio-theme-data` in `index.html` (`id`, `themeColor`, `statusBarStyle`)
4. Add a matching entry to `THEME_META` in `js/config.js` (label, icon; `requiresBorderShape` for sketch-like themes)
5. Add a static theme button in `index.html` (see existing switcher markup)

## Tests

```bash
npm test          # unit + smoke (Node)
npm run test:e2e  # Playwright browser smoke + axe
npm run test:all  # both (CI)
```

Runs Node built-in unit tests in `tests/` (theme helpers, GitHub math, HTML smoke, integration mocks) and Playwright E2E checks (scroll at top, theme switch, contribution grid keyboard, axe). CI runs `npm run test:all` via `.github/workflows/test.yml` on push and pull requests to `main`.

## Deploy to GitHub Pages

### 1. Create the GitHub repository

```bash
gh repo create klovaaxel.github.io --public --source=. --remote=origin --push
```

Using `klovaaxel.github.io` serves the site from the domain root. Alternatively, use any repo name and enable Pages from that repo.

### 2. Enable GitHub Pages

In the repo on GitHub:

1. **Settings → Pages**
2. **Source:** GitHub Actions (the workflow in `.github/workflows/pages.yml` handles deploys on push to `main`)

### 3. Configure custom domain (GoDaddy)

The `CNAME` file already contains `axel.eyssen.se`.

In **GoDaddy DNS** for `eyssen.se`:

| Type  | Name | Value               | TTL |
| ----- | ---- | ------------------- | --- |
| CNAME | axel | klovaaxel.github.io | 600 |

In **GitHub → Settings → Pages → Custom domain**, enter `axel.eyssen.se` and enable **Enforce HTTPS** once DNS propagates (can take up to 24 hours).

### 4. Verify DNS

```bash
dig axel.eyssen.se CNAME +short
# Should return: klovaaxel.github.io.
```

## Structure

```
├── index.html              # Static content, meta, theme JSON, theme-bootstrap.js
├── CNAME
├── site.webmanifest
├── package.json            # npm test script
├── assets/
│   ├── fonts/              # Self-hosted Atkinson Hyperlegible (latin woff2)
│   └── …                   # Theme background SVGs
├── css/
│   ├── fonts.css           # @font-face for display font
│   ├── tokens.css          # Design tokens
│   ├── base.css            # Reset + theme imports
│   ├── layout.css          # Page structure
│   ├── components.css      # UI components
│   ├── animations.css      # Reveals, theme sweep
│   ├── cursor.css          # Custom cursor + parallax
│   ├── sketch.css          # Sketch theme decorations
│   ├── border-shape.css    # border-shape progressive enhancement
│   └── themes/             # Color themes
├── js/
│   ├── config.js           # GitHub settings + theme metadata merge
│   ├── html.js             # Shared escapeHtml helper
│   ├── theme-bootstrap.js  # Sync random theme before first paint
│   ├── theme-pick.js       # Shared theme pool helpers (tests + theme.js)
│   ├── theme.js            # Theme switcher, browser chrome, switcher UI
│   ├── github.js           # GitHub API integration
│   ├── cursor.js           # Custom cursor, magnetic elements
│   ├── live-region.js      # aria-live announcements
│   └── main.js             # Entry point
├── tests/
│   ├── theme.test.js
│   ├── theme-pick.test.js
│   ├── github.test.js
│   ├── github-load.test.js
│   ├── smoke.test.js
│   └── e2e/                # Playwright smoke + axe
├── docs/
│   ├── IMPROVEMENT-WORKFLOW.md
│   └── UX-PRINCIPLES.md
├── playwright.config.js
├── icons/                  # Favicon, PWA icons
└── .github/workflows/
    ├── pages.yml           # GitHub Pages deploy
    └── test.yml            # CI unit tests
```
