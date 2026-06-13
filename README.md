# ⚽ World Cup 2026 Companion

A modern, responsive, production-ready companion web app for the FIFA World Cup 2026 — fixtures, live scores, group standings, knockout bracket, stadiums, squads, where-to-watch, notifications, calendar export, favorites, predictions, stats, travel guides, watch parties and a personalized "My World Cup" dashboard.

**Every piece of tournament data comes from official sources, with attribution and last-updated timestamps. Nothing is invented.**

- **Live demo:** https://world-cup-2026-companion-xi.vercel.app
- **Repository:** https://github.com/tahsinulmohsin/world-cup-2026-companion
- **Version:** v1.3.0

> Independent fan project. Not affiliated with, endorsed by, or connected to FIFA. No FIFA logos, mascots, or licensed assets are used.

## AI Development

This is a **completely vibe coded project**.
- **Tools used:** Claude Code and Google Antigravity
- **Models used:** Claude Fable 5, Claude 4.8 Opus, Gemini 3.1 Pro

---

## Features

- 🏠 Dashboard home: countdown, live/today/upcoming matches, quick filters, favorites, knockout preview, top stories, top scorers, watch-party teaser
- 📅 Full fixtures page: search + filters (date scope, team, group, round, stadium, host country, status, favorites, importance), spoiler-free toggle
- 🎫 Signature "stadium ticket" match cards with where-to-watch, notify-me, calendar and prediction actions
- 🔍 Match details: timeline, live stats, team comparison, head-to-head, squads, lineups, sourced-data-only preview, highlights links, player of the match, fan reactions
- 📺 Where to watch: country selector, official rights-holder data only, clear "not available yet" states
- 📊 Groups & standings with official tiebreakers, qualification highlighting and team links
- 🏆 Visual knockout bracket (R32 → Final) with spoiler-free support
- 🏟️ 16 stadium pages with local clocks, transit/airport info and match lists
- 🌎 Team & player profile pages from official FIFA / federation squad data
- ⭐ My World Cup: favorite teams, their matches, groups, news, reminders and calendar export
- 🔔 Browser notifications (30-min/kickoff alerts; goal/HT/FT/lineup/highlight categories ready for live status data)
- 🗓 Calendar export: per-match .ics, Google Calendar links, all-matches / favorites / knockout / showpiece bundles
- 🙈 Spoiler-free mode (all matches or favorites only) hiding scores, timelines, highlights and reactions
- 🗳 Match predictions and post-match fan reactions (localStorage MVP, DB-ready models)
- 📈 Stats page: golden boot, assists, cards, team goals/defense + clear unavailable states
- 📰 Official news summaries linking to original articles
- 🧳 Travel & host-city guides with matchday checklist
- 🎉 Watch party finder (official/authorized event sources + local localStorage watch parties)
- 🖼 Printable digital wall chart
- 📱 PWA: installable, offline shell, last-synced data, offline indicator
- 🌐 i18n: English + বাংলা today; Spanish/French/Arabic structured for translation
- 🕒 Timezone modes: my local / Bangladesh / stadium / host-country time
- 🌙 Polished dark mode (system-aware)
- 🛠 Admin source monitor: per-source health, cache state, error log, manual refresh

## Tech stack

Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Vercel Cron Jobs · Service worker PWA · localStorage preferences · zero runtime dependencies beyond React/Next.

## Screenshots

_Add screenshots here (home, fixtures, match details, dark mode, mobile)._

## Folder structure

```
app/                  Pages + API route handlers (cron, admin, broadcasters, live)
components/           ui · matches · teams · players · stadiums · standings ·
                      knockout · stats · news · travel · watch-parties · admin ·
                      layout · home · my · wallchart
services/
  officialSources/    One adapter per official source (env-configured endpoints)
  normalizers/        Raw payload → strict app models
  cache/              In-memory TTL cache with stale-while-error
  sync/               syncService (page-facing getters, refresh) + source status registry
  errors/             Typed SourceError
hooks/                Favorites, reminders, predictions, reactions, prefs, i18n…
types/                App data models · types/sources raw payload shapes
i18n/                 en, bn (+ es/fr/ar scaffolds)
data/fallback/        Small, clearly-labeled sample data (dev only)
data/cache/           Runtime cache dir (gitignored)
public/               manifest, sw.js, icons, robots.txt
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional in dev
npm run dev                  # http://localhost:3000
```

Build & run production:

```bash
npm run build
npm start
```

Lint: `npm run lint`

## Environment variables

See `.env.example`. All `OFFICIAL_*_URL` variables point at official endpoints/feeds you are permitted to use. With none configured, the app runs in development mode on small bundled sample data (clearly labeled "Sample data") and shows honest unavailable states for broadcasters, news, match centre and watch parties.

| Variable | Purpose |
| --- | --- |
| `OFFICIAL_FIFA_FIXTURES_URL` | Official fixtures feed (JSON) |
| `OFFICIAL_FIFA_STANDINGS_URL` | Official group standings |
| `OFFICIAL_FIFA_MATCH_CENTRE_URL` | Live timeline/stats/lineups/highlights |
| `OFFICIAL_FIFA_TEAMS_URL` | Qualified teams |
| `OFFICIAL_FEDERATION_SQUADS_URL` | Squad lists from federations |
| `OFFICIAL_BROADCASTERS_URL` | Where-to-watch rights holders |
| `OFFICIAL_NEWS_RSS_URL` | Official RSS/JSON news feed |
| `OFFICIAL_STADIUMS_URL`, `OFFICIAL_TRAVEL_URL`, `OFFICIAL_WATCH_PARTIES_URL`, `OFFICIAL_TICKETS_URL` | Venue, travel, fan-event, ticketing feeds |
| `FOOTBALL_DATA_API_KEY` | [football-data.org](https://www.football-data.org) free-tier API key for live scores/standings overlay |
| `WEATHER_API_KEY`, `MAPS_API_KEY` | Optional, only if their terms allow |
| `ADMIN_PASSWORD` | Enables `/admin` + admin API |
| `CRON_SECRET` | Authenticates Vercel cron calls |

## Official data source strategy

Priority order: 1) FIFA official site/tournament pages → 2) FIFA match centre/data feeds → 3) national federation sites (squads, team news) → 4) official stadium/host-city/venue sites → 5) official broadcasters/rights holders → 6) official ticketing & hospitality → 7) official tournament news feeds → 8) permitted weather/maps/transport APIs.

Rules enforced in code:
- Endpoints only via environment variables — nothing hardcoded, no keys in the repo.
- Each adapter validates → normalizes → stamps `SourceMeta` (`sourceName`, `sourceUrl`, `fetchedAt`, `lastUpdatedAt`, `reliability`).
- UI shows a source badge + relative "Updated x ago" wherever fetched data renders.
- 10s request timeout, conservative 5s minimum gap between live fetches, HTTP 429 surfaced as rate-limit errors.
- Stale-while-error: on failure the last good payload is served and the error is logged to the admin monitor.
- **No guessing:** broadcasters, news, match-centre data and watch parties have *no* sample fallback — they show explicit unavailable states instead.
- Respect `robots.txt`, terms of use and rate limits; never bypass paywalls, auth or anti-bot systems.

### Adding/replacing a source adapter

1. Create `services/officialSources/<name>Source.ts` using `createOfficialSource()` with an `envUrlKey`, TTL, `validate`, `normalize` (put mapping logic in `services/normalizers/`), and a `fallback` (return `null` for "never fabricate" data).
2. Expose a getter in `services/sync/syncService.ts` and add the scope to `refreshScope`.
3. Add the env var to `.env.example` and, if it should auto-refresh, a cron route + `vercel.json` entry.

## Cache & refresh strategy

Three layers: in-memory TTL cache per source → Next.js route revalidation (`revalidate` per page) → Vercel Cron force-refresh. Default TTLs: fixtures 15 min, standings 5 min, match centre 60 s, squads/tickets 12 h, news 30 min, broadcasters/stadiums/travel 24 h. The admin panel can force-refresh any scope.

> **Vercel note:** the Hobby plan only allows daily cron schedules; the included `vercel.json` schedules (e.g. every 15 min) require a Pro plan. On Hobby, either loosen the schedules to daily or rely on request-time revalidation, which works fine.

## Notifications

"Notify me" stores a reminder (localStorage, DB-ready shape), requests browser permission, and an in-app scheduler fires alerts 30 minutes before official kickoff while the app is open. Category toggles (goals, half-time, full-time, lineup, result, highlights) are stored per match and activate as the official live-status feed supplies events. Unsupported browsers get a clear fallback message and the reminder list still works.

## Calendar export

RFC 5545 `.ics` generation (UTC times — calendar apps localize automatically, including Bangladesh time) plus Google Calendar links. Bundles: single match, all matches, favorite teams, knockout only, opener + semis + final, and a My World Cup export.

## PWA & offline

`manifest.webmanifest` + neutral generated icons + `public/sw.js` (network-first pages/API with cache fallback, cache-first static assets, `/offline` fallback). Favorites, reminders and preferences live in localStorage so they work offline; an offline banner shows the last synced time.

## Multi-language

Simple JSON dictionaries in `i18n/` with an English fallback for missing keys. English and Bangla ship complete; `es.json`, `fr.json`, `ar.json` are ready to fill. Official quotes are never machine-translated silently — translated summaries must be labeled.

## Admin source monitor

`/admin` (set `ADMIN_PASSWORD`) shows per-source configuration, cache state, item counts, last fetch/success, last error, a rolling error log and per-scope refresh buttons. It manages syncing only — tournament data can never be hand-edited.

## Deploying to Vercel

```bash
npm i -g vercel
vercel login
vercel link        # or: import the GitHub repo at vercel.com/new
vercel --prod
```

- Framework preset: **Next.js** (build `next build`, output handled automatically)
- Add the environment variables above in Project → Settings → Environment Variables
- Cron jobs are picked up from `vercel.json` (Pro plan for sub-daily schedules; see note)
- After deploy: put the live URL in this README and the repo's About section

## Versioning & releases

Semantic versioning. Current release: **v1.3.0** (git tag `v1.3.0`).

**v1.3.0** — UI Polish, Favicon & Local Watch Parties
- Created a sleek SVG favicon (soccer ball on green circle)
- Refined translucent dark navbar with backdrop-blur
- Added global scrollbar hiding for a cleaner UI
- Re-architected stats page to only display tournament-specific match and standings data
- Fixed filter layout overlap issues on mobile
- Implemented user-created local watch parties with localStorage persistence
- Scraped Wikipedia to integrate official broadcasters for matches
- Fixed a critical React 18 `useSyncExternalStore` hydration infinite loop on the Watch Parties page

**v1.2.0** — Wikipedia integration & ESPN live matches
- Integrated ESPN live scoreboard and summary endpoints for match centre live commentary
- Dynamically scraped Wikipedia for official 2026 World Cup squads
- Implemented bulk Wikipedia `pageimages` fetching to render high-quality player portraits
- Extracted career international goals and appearances to populate fallback tournament stats
- Made stats board dynamically render to provide instant updates
- Streamlined UI by removing missing bios and gracefully handling empty leaderboards

**v1.1.0** — football-data.org v4 live-score overlay
- Add `services/normalizers/footballData.ts`: normalizes fixtures and standings from the football-data.org v4 API (free tier with API key)
- Export `resolveTeamMeta` from the openfootball normalizer so cross-normalizer team lookups share the same TEAMS registry
- Add optional `headers()` config to `baseSource` so API-key sources (like football-data.org) can inject auth headers without touching the base fetch logic

**v1.0.0** — Initial release

## Roadmap

- Shared backend for community predictions, reactions and watch-party submissions
- Web-push notifications (server-sent, works when the app is closed)
- Wall chart image/share export
- Qualification scenario calculator
- Weather + maps integration behind permitted APIs
- Complete es/fr/ar translations

## License & legal

MIT (see `LICENSE`) for the application code. The license does not cover FIFA trademarks or third-party data. Use only data sources you are legally allowed to access, respect their terms/robots.txt/rate limits, link news to the original articles, and never embed unlicensed video. Buy tickets only from official FIFA channels.
