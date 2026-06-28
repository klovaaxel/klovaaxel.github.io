# axel-portfolio

Personal portfolio site for [axel.eyssen.se](https://axel.eyssen.se).

## Local preview

```bash
cd ~/Projects/axel-portfolio
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Configuration

### Profile and content

Edit **`index.html`** for visible copy and links:

- Hero (name, role, tagline)
- Experience timeline
- Skills
- Connect section and social links in the nav

Content is static HTML — no JavaScript hydration.

### GitHub and themes

Edit **`js/config.js`** for:

- GitHub username and profile URL (`config.github`)
- Theme labels, icons, and sketch gating (`THEME_META`)

Theme **colors and PWA chrome** (`themeColor`, `statusBarStyle`, default) live in **`#portfolio-theme-data`** JSON in `index.html`. `config.js` merges that bootstrap data with `THEME_META` at runtime.

## Themes

The design system uses CSS custom properties:

- `css/tokens.css` — spacing, typography, layout (theme-agnostic)
- `css/fonts.css` — self-hosted Atkinson Hyperlegible (latin 400/700); sketch fonts load on demand via `js/theme.js`
- `css/themes/*.css` — color palettes per theme

Switch themes with the buttons in the top-right corner. The choice is saved in `localStorage`.

To add a new theme:

1. Create `css/themes/your-theme.css` with `[data-theme="your-theme"]` color variables
2. Import it in `css/base.css`
3. Add an entry to `#portfolio-theme-data` in `index.html` (`id`, `themeColor`, `statusBarStyle`)
4. Add a matching entry to `THEME_META` in `js/config.js` (label, icon; `requiresBorderShape` for sketch-like themes)
5. Add a static theme button in `index.html` (see existing switcher markup)

## Tests

```bash
npm test
```

Runs Node built-in unit tests in `tests/` (pure helpers such as theme resolution and GitHub date math). CI runs the same command via `.github/workflows/test.yml` on push and pull requests to `main`.

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
├── index.html              # Static content, meta, theme JSON, early theme boot
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
│   ├── animations.css      # Reveals, theme sweep, Connect flip
│   ├── cursor.css          # Custom cursor + parallax
│   ├── sketch.css          # Sketch theme decorations
│   ├── border-shape.css    # border-shape progressive enhancement
│   └── themes/             # Color themes
├── js/
│   ├── config.js           # GitHub settings + theme metadata merge
│   ├── html.js             # Shared escapeHtml helper
│   ├── theme.js            # Theme switcher, storage, browser chrome
│   ├── github.js           # GitHub API integration
│   ├── cursor.js           # Custom cursor, magnetic elements
│   ├── live-region.js      # aria-live announcements
│   └── main.js             # Entry point
├── tests/
│   ├── theme.test.js
│   └── github.test.js
├── icons/                  # Favicon, PWA icons
└── .github/workflows/
    ├── pages.yml           # GitHub Pages deploy
    └── test.yml            # CI unit tests
```
