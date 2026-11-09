# Release - Haapsaly Bassline

A web application for managing a label's releases: a public release catalog, album pages (featuring cover art, tracklists, and streaming links), and an admin panel.

- Public website: https://release.hpsbassline.club
- Public API: `/api/releases`, `/api/footer`

## Tech Stack

- Node.js (ESM) + Express 4
- Data storage in JSON files (`data/`)
- Cover art uploads via `multer` (`src/uploads/`)
- Server-side rendering (SSR) of Open Graph / Twitter Card meta tags for album pages
- Vanilla JS/CSS on the frontend (no build step)
- Vercel configuration (`vercel.json`) for deployment

## Structure

```
server.js              Express server, API, and SSR for album pages
src/index.html         Public-facing page (SPA)
src/js/app.js          Logic for the public-facing side
src/css/styles.css     Styles
src/admin-panel.html   Admin panel
src/js/admin-panel.js  Logic for the admin panel
src/uploads/           Uploaded cover art (runtime, not tracked in Git)
data/                  releases.json, footer.json, and settings (runtime, not tracked in Git)
```

## Getting Started

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm start              # or npm run dev (uses nodemon)
```

By default, the server listens at `http://localhost:1616` (the port can be configured via the `PORT` environment variable).

For Windows, a `Release.bat` file is provided to execute `node server.js` from the project directory.

## Environment Variables

| Variable | Purpose | Default | |---|---|---|
| `PORT` | HTTP server port | `1616` |
| `ADMIN_PASSWORD` | Password for the admin panel | - |
| `SESSION_SECRET` | Secret used to sign session cookies | Generated randomly at startup |
| `DATA_DIR` | Directory for JSON data | `data` |
| `PUBLIC_BASE_URL` | Base URL of the site (for OG tags) | `https://release.hpsbassline.club` |
| `SHARE_BASE_URL` | Base URL for "share" links | `https://rls.hpsbassline.club` |

The `.env` file is not included in the repository, as it contains actual secrets.

## Admin Panel

- Login: `/admin` (or via the hidden padlock icon in the top-left corner of the public-facing page)
- Release management: title, artist, slug, genres, year, tracks, service links, merchandise, cover art, and draft/published status
- Footer edits are saved to `data/footer.json`

## License

[MIT](LICENSE) © 2026 Haapsaly Bassline
