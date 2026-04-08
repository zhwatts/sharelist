# Sharelist

Cross-platform music playlist sharing. Connect Spotify, Apple Music, or YouTube Music and share playlists across platforms — no matter which service your friends use.

## Quick start

```bash
git clone https://github.com/zhwatts/sharelist.git
cd sharelist
npm run setup
```

The setup command installs all dependencies and creates a `.env` file from the example template.

Then fill in your credentials in `.env` and start the development servers:

```bash
npm run dev
```

This runs the API (port 3001) and the frontend (port 5173) concurrently.

## Project structure

```
apps/
  api/    — Node/Express backend
  web/    — React frontend
packages/
  shared/ — Shared types and utilities
scripts/  — Automation and tooling scripts
```

## Environment variables

See `.env.example` for all required variables. The key ones to fill in before running locally:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_SUPABASE_URL` | Same URL, exposed to the frontend |
| `VITE_SUPABASE_ANON_KEY` | Same anon key, exposed to the frontend |

Streaming service OAuth credentials (Spotify, Apple Music, Google) are only needed when working on those integrations.

## Tech stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database & Auth:** Supabase (Postgres + Auth)
- **Deployment:** Render
