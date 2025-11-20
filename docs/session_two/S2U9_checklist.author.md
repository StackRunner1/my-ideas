---
slug: s2u9-frontend-axios-interceptor
title: S2U9 — Axios Interceptor: Attach Access Token (Header)
description:
  Add a frontend Axios request interceptor that reads the current Supabase session
  and attaches Authorization: Bearer <access_token> to protected API requests.
  Keep tokens in memory, never in localStorage. Skip attaching for public endpoints.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit9, frontend, axios, auth, bearer, supabase]
orderIndex: 9
updated_at: 2025-11-20T00:00:00Z
---

# Axios Interceptor — Attach Access Token (Header)

# Status: Draft

## Objective

Configure a **frontend Axios request interceptor** that reads the **current Supabase
session** and adds `Authorization: Bearer <access_token>` to **protected** API requests.
Keep access tokens **in memory** (do **not** store in localStorage). Define a clear
**allow/deny list** so the interceptor **skips public endpoints** (e.g., `/health`,
static assets, auth callbacks).

## Definition of Done

- Axios client lives under `src/api/` and is used across the app.
- Request interceptor retrieves `access_token` from the in-memory session (from the
  AuthProvider or `supabase.auth.getSession()`), and sets `Authorization` only for
  **protected** endpoints.
- Public endpoints (e.g., `/health`, `/auth/*`, static files) are **not** decorated.
- Basic 401 handling exists (e.g., route to `/auth` or emit a global sign-out).
- No tokens or secrets stored in localStorage; env values come from `/frontend/.env.local`.

## Important

- **Path discipline matters**: run all FE commands in `/my-ideas/frontend`.
- Prereqs:
  - S2U8: FE auth + Supabase client + session listener in place.
  - S2U5: `/frontend/.env.local` defines `VITE_API_BASE_URL` and Supabase keys.
  - S2U2: `@supabase/supabase-js` installed.
- **Error normalization** is handled in a later TL; here we only attach the header
  and optionally redirect on 401.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Verify environment & paths

- [ ] FE terminal is at **`/my-ideas/frontend`**
- [ ] `@supabase/supabase-js` present (`npm ls @supabase/supabase-js`)
- [ ] `src/lib/supabaseClient.ts` (or equivalent) exists from S2U8
- [ ] `VITE_API_AVURL` (or your chosen name, e.g. `VITE_API_BASE_URL`) is set in `.env.local`

### 2) Centralize Axios client

- [ ] Ensure a single shared client module exists (e.g., `src/api/apiClient.ts`)
- [ ] Client uses `baseURL: import.meta.env.VITE_API_BASE_URL`
- [ ] Client sets default JSON headers (e.g., `Accept: application/json`, `Content-Type: application/json`)

### 3) Implement request interceptor (AI-first)

- [ ] Via AI assistant, add a request interceptor to `apiClient` that:
  - [ ] Asynchronously fetches the current session (from your AuthProvider or `supabase.auth.getSession()`)
  - [ ] Reads `access_token` from session (in memory)
  - [ ] Calls a small predicate, e.g. `shouldAttachAuth(url)` to decide whether to attach
  - [ ] If `shouldAttachAuth(url)` is true and a token exists, set `Authorization: Bearer <token>`
  - [ ] Never logs or stores the token; never writes to localStorage

> **Example rules for `shouldAttachAuth(url)` (describe in code comments):**  
> - Return **false** for: `GET /health`, `/auth/*`, static assets, `<baseURL>/public/*`  
> - Default to **true** for `/app/*`, `/items*`, `/auth/me`, or any route that needs user identity

### 4) Basic 401 handling (front-end)

- [ ] In a **response interceptor** (or per-call wrapper), if `status === 401`:
  - [ ] Clear local in-memory session (via AuthProvider)
  - [ ] Redirect to `/auth` **or** show a “Session expired” prompt with a **Sign in** button
  - [ ] Do **not** leak token values to logs

### 5) Sanity checks

- [ ] Start FE dev server: `npm run dev` (in `/my-ideas/frontend`)
- [ ] Sign in (from S2U8) to obtain a session
- [ ] Trigger a **protected** request (you can temporarily call a placeholder like `GET /auth/me` if present, or another protected endpoint once available)
- [ ] Open **DevTools → Network** and inspect the request:
  - [ ] `Authorization: Bearer <token>` header present for **protected** routes
  - [ ] No `Authorization` on `/health` or other public endpoints
- [ ] Stop and restart the FE app to ensure behavior persists

### 6) Cleanliness & security

- [ ] Confirm **no tokens** in localStorage or committed files
- [ ] Confirm `VITE_*` values in `.env.local` only; not committed
- [ ] Confirm no accidental logs of token/headers

### 7) Commit (no secrets)

- [ ] `git status` shows safe file changes (e.g., `src/api/apiClient.ts`, `src/lib/**`, router/guard)
- [ ] `git add` changed FE files (exclude `.env.local`)
- [ ] `git commit -m "feat(s2): add axios auth interceptor with bearer token + basic 401 handling"`
- [ ] Proceed to **S2U10 — Backend Auth Endpoints (cookie + header strategy)**
