# Sharelist — Claude project context

## What this project is
Sharelist is a cross-platform music playlist sharing app. Users connect their 
streaming services (Spotify, Apple Music, YouTube Music) and share playlists 
across platforms. It does not stream audio — it is a metadata and sharing layer.

## Monorepo structure
/apps/web        → React frontend, deploys to Render
/apps/api        → Node/Express backend, deploys to Render  
/packages        → shared types, utilities, constants
/scripts         → automation scripts (GitHub, tooling)
/.claude/agents  → agent role definitions

## Tech stack
- Frontend: React, TypeScript, Tailwind
- Backend: Node.js, Express, TypeScript
- Database & auth: Supabase (Postgres + Auth)
- Deployment: Render (both frontend and backend)
- Logging: structured JSON logs, centralized and searchable

## GitHub workflow
- All work is tracked as issues on the GitHub Project board
- Issues move through: Backlog → In Progress → In Review → Done
- Every piece of work must have a corresponding issue before code is written
- The orchestrator agent manages issue creation and board movement

## Workflow rules
The GitHub Project board is the single source of truth for all work. Agents
must never self-schedule, self-assign, or begin work on any issue unless the
developer has explicitly moved it to "In Progress" first.

**Column ownership:**
- Backlog → only the developer moves items out of Backlog
- In Progress → developer-only trigger. Moving an issue here is the explicit
  instruction for agents to begin work on it
- In Review → the builder agent moves the issue here when code is complete
  and ready for developer review
- Done → only the developer marks items Done after reviewing and approving

**Agent behavior:**
- At the start of every session, the orchestrator checks the board for issues
  currently in "In Progress" — those are the only issues agents may work on
- If no issues are In Progress, agents must stop and inform the developer
  rather than pulling work from the Backlog themselves
- Agents must never move an issue backwards (e.g. In Review → In Progress)
  without explicit developer instruction
- Agents must never move an issue to Done — that is the developer's action only

**No work without a ticket — no exceptions:**
This rule applies to every change, no matter how small: config edits, env var
changes, refactors, dependency updates, documentation. If there is no open
GitHub issue covering the change, the agent must create one first and wait for
the developer to move it to "In Progress" before touching any file.

Conversational answers, explanations, and architectural recommendations do not
require a ticket. Any action that writes, edits, or deletes a file does.

**Every new issue must be on the project board with Backlog status:**
The GitHub Project board is the primary visibility mechanism for all work. An
issue not on the board — or on the board with no status — is invisible to the
developer. See `.claude/agents/github-agent.md` for the exact creation
procedure, including the GraphQL mutation required to set the status.

## Agent roles
- Orchestrator: receives goals, creates issues, delegates to other agents
- Builder: writes and reviews all application code
- GitHub agent: manages the project board and issue lifecycle

## Frontend architecture — API-only
The frontend (`apps/web`) must never interact with Supabase directly. All data
access and authentication goes through the Express API (`apps/api`).

- No `@supabase/supabase-js` in `apps/web`
- No Supabase URL or anon key in any `VITE_*` env var
- The only env var the frontend needs is `VITE_API_URL`
- Auth tokens received from the API are stored client-side and sent as
  `Authorization: Bearer <token>` headers on subsequent API requests

## Out of scope
- Audio streaming or playback
- Podcast or audiobook content
- Mobile app (web first)
- Downloading or offline access

## Logging philosophy
Structured JSON logs on the backend. Every error includes stack trace and 
request context. Logs should be easy to copy directly to Claude for diagnosis.

## Deployment rules
- Never commit secrets or .env files
- All env vars live in Render dashboard
- Pushing to main triggers automatic deployment
- Failed deploys must not affect the running production service