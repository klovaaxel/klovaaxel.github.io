# axel-portfolio

Personal portfolio site for [axel.eyssen.se](https://axel.eyssen.se).

## Local preview

```bash
cd ~/Projects/axel-portfolio
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Configuration

Edit `js/config.js` to update your name, tagline, social links, and GitHub settings.

## Themes

The design system uses CSS custom properties:

- `css/tokens.css` — spacing, typography, layout (theme-agnostic)
- `css/themes/*.css` — color palettes per theme

Switch themes with the buttons in the top-right corner. The choice is saved in `localStorage`.

To add a new theme:

1. Create `css/themes/your-theme.css` with `[data-theme="your-theme"]` color variables
2. Import it in `css/base.css`
3. Add an entry to `config.themes` in `js/config.js`

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
├── index.html
├── CNAME
├── css/
│   ├── tokens.css      # Design tokens
│   ├── base.css        # Reset + theme imports
│   ├── layout.css      # Page structure
│   ├── components.css  # UI components
│   └── themes/         # Color themes
├── js/
│   ├── config.js       # Your profile & links
│   ├── theme.js        # Theme switcher
│   ├── github.js       # GitHub API integration
│   └── main.js         # Entry point
└── .github/workflows/pages.yml
```
