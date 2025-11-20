---
slug: s2u5-env-files
title: S2U5 — Environment Files (FE & BE) — Git-Ignored
description:
  Place Supabase keys and config into VS Code env files for frontend and backend
  (no secrets in Git). Verify .env files are ignored and restart local servers to
  load changes.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit5, env, supabase, config, security]
orderIndex: 5
updated_at: 2025-11-20T00:00:00Z
---

# Environment Files (FE & BE) — Git-Ignored

# Status: Draft

## Objective

Safely configure the **frontend** and **backend** to talk to your Supabase
project by placing keys in local **env files** (git-ignored). Do **not** paste
secrets in source code or commit them to Git.

## Definition of Done

- `/my-ideas/frontend/.env.local` exists with **`VITE_SUPABASE_URL`** and
  **`VITE_SUPABASE_ANON_KEY`** (and optional `VITE_API_BASE_URL`).
- `/my-ideas/backend/.env` exists with **`SUPABASE_URL`** and
  **`SUPABASE_SERVICE_ROLE_KEY`**.
- `.gitignore` ignores `.env*`; `git status` shows **no** env files staged.
- Local servers restarted so apps read new env values.

## Important

- **Never commit secrets.** Keys belong only in env files and deployment secret
  managers.
- The **Vite** convention requires `VITE_*` prefixes for FE variables to be
  exposed at build time.
- Restart dev servers after editing env files—most processes read env on boot.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Frontend env (path: `/my-ideas/frontend/.env.local`)

- [ ] Create (or open) `/my-ideas/frontend/.env.local`
- [ ] Add (replace `...` with your values from Supabase Studio → Settings → API):
  - [ ] `VITE_SUPABASE_URL=...`
  - [ ] `VITE_SUPABASE_ANON_KEY=...`
  - [ ] (Optional) `VITE_API_BASE_URL=http://127.0.0.1:8000`
- [ ] Save the file

### 2) Backend env (path: `/my-ideas/backend/.env`)

- [ ] Create (or open) `/my-ideas/backend/.env`
- [ ] Add (replace `...` with your values from Supabase Studio → Settings → API):
  - [ ] `SUPABASE_URL=...`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=...`
- [ ] Save the file

### 3) Ensure env files are ignored by Git

- [ ] Open repo root `.gitignore` and confirm it includes a rule for `.env*`
      (e.g., `*.env`, `.env*`)
- [ ] Verify with Git:
  - [ ] `git check-ignore -v frontend/.env.local` shows it is ignored
  - [ ] `git check-ignore -v backend/.env` shows it is ignored

### 4) Restart local servers (load env)

- [ ] **FE** terminal (in `/my-ideas/frontend`): stop if running, then `npm run dev`
- [ ] **BE** terminal: ensure Python env active (`(vibe)` or `(.venv)`), stop if running,
      then `uvicorn backend.app.main:app --reload --port 8000`

### 5) Sanity checks (no commits of secrets)

- [ ] `git status` shows **no** env files staged or modified for commit
- [ ] (Optional) Add a secure note in your password manager with your keys
- [ ] Proceed to **S2U6 — Run Migrations & Practice Studio (Tables Review)**

