---
slug: s2u4-backend-supabase-clients
title: S2U4 — Backend Supabase Settings & Clients
description:
  Create backend scaffolding for clean, auditable Supabase access: settings loader,
  shared database wiring, admin_client (service role), and user_scoped_client (from
  bearer token). Add a minimal health probe route to verify connectivity.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit4, backend, supabase, settings, admin-client, user-scoped]
orderIndex: 4
updated_at: 2025-11-20T00:00:00Z
---

# Backend Supabase Settings & Clients

# Status: Draft

## Objective

Set up a **clean, auditable** way for your FastAPI backend to talk to Supabase:
a central **settings** loader, shared **database** wiring, an **admin_client**
(using the service role key, server-only), and a **user_scoped_client** that
constructs a Supabase client from the **incoming bearer access token** per
request. Add a minimal health probe route to confirm connectivity.

## Definition of Done

- Backend **modules** exist and import cleanly:
  - `/my-ideas/backend/app/core/settings.py`
  - `/my-ideas/backend/app/core/database.py`
  - `/my-ideas/backend/app/core/admin_client.py`
  - `/my-ideas/backend/app/core/user_scoped_client.py`
- **No secrets** are checked in; `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
  live only in `/my-ideas/backend/.env` (git-ignored).
- A **health probe route** mounts into FastAPI and can reach Supabase without
  crashing (e.g., returns a simple OK or time echo).
- `uvicorn` runs; calling the probe endpoint returns a 200.

## Important

- **AI-first**: All file creation/edits are performed by your IDE’s coding
  assistant (e.g., GitHub Copilot Chat). You run only the commands.
- **Secrets**: Never commit `SUPABASE_SERVICE_ROLE_KEY`. It must remain in
  `/backend/.env` and in your deployment secret manager.
- **Service role vs. user-scoped**:
  - `admin_client` is for privileged server-only operations (e.g., issuing
    signed URLs, system jobs). **Do not expose** this client to the browser.
  - `user_scoped_client` is derived from the **request’s bearer token** and is
    used for auditable, per-user data access (foundation for Agents).

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Pre-checks (env & imports)

- [ ] In **BE terminal**, ensure Python env is active (`(vibe)` or `(.venv)`)
- [ ] Confirm `supabase` Python SDK is installed (`python -c "import supabase; print('ok')"`)
- [ ] Ensure `/my-ideas/backend/.env` **already** has:
  - `SUPABAXE_URL=…` (from Studio)
  - `SUPABASE_SERVICE_ROLE_KEY=…` (from Studio)
  - (Verify `.env*` is git-ignored)

### 2) Create core modules (via AI assistant)

> In VS Code, use your coding assistant to generate the following files. Do not paste secrets in code—read from env via `settings.py`.

- [ ] `/backend/app/core/__init__.py` (empty)
- [ ] `/backend/app/core/settings.py`
  - Loads `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` from environment (e.g., with `pydantic-settings` or `os.environ`)
  - Exposes a typed `Settings` object
- [ ] `/backend/app/core/database.py`
  - Central place to instantiate Supabase clients
  - Optionally lazy-init pattern to avoid repeated connections
- [ ] `/backend/app/core/admin_client.py`
  - Factory or function `get_admin_client()` that returns a Supabase client constructed with `Settings.SUPABASE_URL` + `Settings.SUPABASE_SERVICE_ROLE_KEY`
  - **Comment:** “Service role; not for client-side use”
- [ ] `/backend/app/core/user_scoped_client.py`
  - Utility to accept a **bearer token** (from request) and return a Supabase client configured with that token
  - Clear docstring: used for **auditable per-user** DB operations

### 3) Minimal health probe route to validate connectivity

- [ ] Create `/backend/app/api/health.py` with a FastAPI router:
  - `GET /health/supabase` that:
    - Uses `get_admin_client()` **or** constructs a user-scoped client from a test token if available
    - Pings a benign endpoint (e.g., `client.auth.get_user()` if token present or a lightweight call like selecting `now()` via RPC if you’ve set one up)
    - Returns `{ "ok": true, "source": "supabase", "ts": <timestamp or echo> }`
- [ ] Mount the router in your existing `app/main.py`:
  - `app.include_router(health_router, prefix="/health")`

### 4) Run & verify

- [ ] Start backend: `uvicorn backend.app.main:app --reload --port 8000`
- [ ] Open http://127.0.0.1:8000/health (existing) → should be 200
- [ ] Open http://127.0.0.1:8000/health/supabase → should be 200 with a JSON body
- [ ] Watch terminal logs for any import or env errors; fix and re-run

### 5) Commit (no secrets)

- [ ] `git status` → new/changed files only under `/backend/app/**` (and possibly `requirements.txt` if you added settings libs)
- [ ] `git add backend/app`
- [ ] `git commit -m "feat(s2): add backend supabase settings, admin_client, user_scoped_client, health probe"`

### 6) (Optional) Notes & hardening

- [ ] Add type hints & docstrings to each helper for clarity
- [ ] Consider basic retry/backoff for transient Supabase network errors
- [ ] Consider injecting a **request-scoped** `x-request-id` into client headers for tracing
