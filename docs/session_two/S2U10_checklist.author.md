---
slug: s2u10-backend-auth-endpoints
title: S2U10 — Backend Auth Endpoints (Cookie + Header Strategy)
description:
  Implement FastAPI auth endpoints (/auth/signup, /auth/signin, /auth/me, /auth/logout)
  using Supabase. Set an http-only refresh cookie (server-managed) and return a short-lived
  access token for frontend in-memory use. Read per-user identity via user_scoped_client.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit10, backend, auth, supabase, cookies, bearer, gotrue]
orderIndex: 10
updated_at: 2025-11-20T00:00:00Z
---

# Backend Auth Endpoints — Cookie (refresh) + Header (access token)

# Status: Draft

## Objective

Provide a minimal set of **auth endpoints** behind FastAPI that delegate to **Supabase Auth**
and implement a **hybrid token model**:

- On **signin/signup**: issue a short-lived **access token** (returned in JSON to the FE and stored **in memory only**) and set an **HTTP-only refresh cookie** (server-managed).
- Expose `/auth/me` that validates the caller via the **bearer access token** and returns the current user using `user_scoped_client`.
- Implement `/auth/logout` to clear the refresh cookie.
- Keep error responses consistent with `{ "code": "...", "message": "...", "details": {...} }` (full normalization refined in S2U12).

## Definition of Done

- Endpoints exist and are mounted under `/auth`: `POST /auth/signup`, `POST /auth/signin`,
  `GET /auth/me`, `POST /auth/logout`.
- Refresh token stored as **HTTP-only cookie** (e.g. `sb_refresh_token`); access token **not** persisted.
- `/auth/me` returns current user using **user_scoped_client** (derived from bearer token).
- CORS allows credentials for refresh endpoint; no secrets committed.
- Manual tests: signup → signin → `/auth/me` ok → page refresh → token still refreshable via cookie → logout clears cookie.

## Important

- **Prereqs**: S2U4 backend clients (`settings.py`, `admin_client.py`, `user_scoped_client.py`) and S2U5 envs present;
  S2U8 FE auth UI exists; S2U9 Axios interceptor attaches `Authorization: Bearer <access_token>`.
- **Never return or log the refresh token.** Only set/clear it as an http-only cookie from the server.
- **CORS**: `allow_credentials=True`, `allow_origins=['http://localhost:5173','http://127.0.0.1:5173']`.
- **Cookie flags (dev)**: `HttpOnly=true`, `SameSite=Lax`, `Path=/`, `Secure=false` (true in production with HTTPS).
- Use **AI-first** to write code; you run only the commands and perform manual verification.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Verify environment & paths

- [ ] **Backend** terminal active with Python env (`(vibe)` / `(.venv)`), at `/my-ideas`
- [ ] `/my-ideas/backend/.env` contains:
  - [ ] `SUPABASE_URL=...`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=...` (never commit)
- [ ] Clients present from S2U4:
  - [ ] `backend/app/core/settings.py`
  - [ ] `backend/app/core/admin_client.py`
  - [ ] `backend/app/core/user_scoped_client.py`
- [ ] FastAPI app runs: `uvicorn backend.app.main:app --reload --port 8000`

### 2) Create auth router & mount points (AI-first)

- [ ] Use AI assistant to scaffold `backend/app/api/auth.py` with a `APIRouter(prefix="/auth")`
- [ ] In `backend/app/main.py`, `include_router(auth_router, prefix="/auth")`
- [ ] Ensure `CORSMiddleware` is configured with:
  - [ ] `allow_origins=["http://localhost:5173","http://127.0.0.1:5173"]`
  - [ ] `allow_credentials=True`, `allow_methods=["*"]`, `allow_headers=["*"]`

### 3) Implement `/auth/signup` (POST)

- [ ] Request body: `{ "email": string, "password": string, "profile": { "displayName"?: string } }`
- [ ] Use **admin client** or GoTrue API to create user (server-side):
  - [ ] Create user with email/password via Supabase auth
  - [ ] After creation, write a row to **`public.user_profile`** with `id = auth.uid()` (or returned user id),
        `display_name` if provided
- [ ] Return JSON `{ "user": { "id": "...", "email": "..." } }` (no tokens in body yet)
- [ ] Error shape `{ "code", "message", "details" }` (basic now; refine in S2U12)

> **Note**: Many teams prefer FE-direct signup via `supabase-js`. We use a server endpoint to keep auth flow centralized and to create `user_profile` atomically.

### 4) Implement `/auth/signin` (POST)

- [ ] Request body: `{ "email": string, "password": string }`
- [ ] Server calls Supabase Auth (GoTrue) to verify credentials
- [ ] On success:
  - [ ] Extract **access token** (short-lived) and **refresh token**
  - [ ] **Set http-only cookie** `sb_refresh_token=<token>` with `HttpOnly` + `SameSite=Lax` + `Path=/` (+ `Secure` in prod)
  - [ ] Return JSON: `{ "accessToken": "<jwt>", "user": { "id": "...", "email": "..." } }`
- [ ] On failure: return `{ "code":"auth_invalid_credentials", "message":"Invalid email or password", "details":{} }` with 401

### 5) Implement `/auth/me` (GET)

- [ ] Expect `Authorization: Bearer <access_token>` header
- [ ] Use **user_scoped_client** to validate token and fetch current user (e.g., `supabase.auth.get_user(token)`)
- [ ] Return `{ "user": { "id": "...", "email": "...", "profile": { ... } } }`
  - [ ] Optionally join/read `public.user_profile` via user_scoped_client to include `display_name`
- [ ] On missing/invalid token: 401 `{ "code":"unauthorized", "message":"Missing or invalid token" }`

### 6) Implement `/auth/logout` (POST)

- [ ] Clear the **refresh cookie** (`sb_refresh_token`) by setting it with an immediate expiry and `Path=/`
- [ ] Optionally call Supabase sign-out via admin or user token
- [ ] Return `{ "ok": true }`

### 7) Minimal refresh endpoint (optional for later)

- [ ] (Optional) Add `/auth/refresh` to exchange the **refresh cookie** for a new **access token**
- [ ] Reads `sb_refresh_token` from cookie; calls Supabase to refresh; sets new `sb_refresh_token`; returns `{ accessToken }`
- [ ] FE will call this transparently in a later TL or inside the `/auth` provider if needed

### 8) Security & CSRF (minimal)

- [ ] Ensure all auth endpoints that rely on cookies have CSRF mitigations:
  - [ ] Require a simple **`X-CSRF-Token`** header on `POST`/`DELETE` auth routes (e.g., `/auth/signin`, `/auth/logout`, `/auth/refresh`)
  - [ ] In dev, you can set a static CSRF secret; in prod, rotate and store in server config
- [ ] Never log tokens; strip `Authorization` headers from error logs
- [ ] Ensure `admin_client` is **never** exposed to FE

### 9) Manual tests (happy paths)

- [ ] **Signup**:
  - [ ] `POST /auth/signup` with email/password → 200, user returned
  - [ ] Verify `user_profile` row created with matching `id`
- [ ] **Signin**:
  - [ ] `POST /auth/signin` → 200, `accessToken` in JSON; cookie `sb_refresh_token` set (http-only)
  - [ ] Inspect response headers in browser devtools → `Set-Cookie` present
- [ ] **/auth/me**:
  - [ ] Using `Authorization: Bearer <access_token>` → 200 with current user
- [ ] **/auth/logout**:
  - [ ] POST → 200, cookie cleared

### 10) Error paths

- [ ] Wrong password on signin → 401 `{ code: "auth_invalid_credentials" }`
- [ ] No bearer token on `/auth/me` → 401
- [ ] Missing cookie on refresh (if implemented) → 401
- [ ] Ensure responses include `{code,message,details}` structure (S2U12 will centralize)

### 11) Commit (no secrets)

- [ ] `git status` shows safe changes under `/backend/app/**`
- [ ] `git add backend/app`
- [ ] `git commit -m "feat(s2): backend auth endpoints (signup/signin/me/logout) with http-only refresh cookie and bearer access token"`
- [ ] Proceed to **S2U11 — Backend `/items`: Pydantic & User-Scoped Ops**
