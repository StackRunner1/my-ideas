---
slug: s2u14-troubleshoot-and-commit
title: S2U14 — Troubleshooting & Commit (Optional Tag)
description:
  Stabilize your D2 work: verify CORS, RLS, token headers, and key auth/CRUD flows.
  Fix quick issues, commit/push safe changes, and optionally tag D2-END for a known-good
  checkpoint before moving to D3.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit14, troubleshoot, commit, tag, quality]
orderIndex: 14
updated_at: 2025-11-20T00:00:00Z
---

# Troubleshooting & Commit (Optional Tag)

# Status: Draft

## Objective

Perform a concise, end-to-end quality pass for **D2**:
- Validate **auth** (signup/signin/auto-refresh/logout) and **protected calls** (bearer header, `/auth/me`, `/items`).
- Confirm **RLS** (authenticated-only) and **CORS** are behaving correctly.
- Ensure **error normalization** and toasts are visible and helpful.
- Commit/push safe changes, and optionally tag **`D2-END`** for cohort sync/recovery.

## Definition of Done

- Manual checks for CORS, RLS, token header, and CRUD pass locally.
- Errors surface as `{code,message,details}` with a toast and **x-request-id** in dev.
- Git history is clean (no secrets, no env files); BE/FE both run from a fresh start.
- Optional Git tag **`D2-END`** exists and is pushed.

## Important

- **No secrets** in Git: verify `.env*` are git-ignored.
- **Studio-first** schema: any schema/policy changes must be new migrations under `/supabase/migrations/`.
- Keep this pass **time-boxed** (~10–15 min). Defer non-critical polish to D3.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Auth sanity (manual)

- [ ] Start FE (`/my-ideas/frontend`: `npm run dev`) and BE (`uvicorn … --port 8000`)
- [ ] **Signup** → **Signin** → land on `/app`
- [ ] **Hard refresh** on `/app` → still authenticated (auto refresh works)
- [ ] **Logout** → redirected to `/auth`

### 2) Protected request & headers

- [ ] Visit a protected screen (Items)
- [ ] DevTools → **Network** on `/items` → **Authorization: Bearer …** present
- [ ] Public routes (e.g., `/health`) DO NOT include `Authorization`

### 3) RLS (authenticated-only) behavior

- [ ] Signed-in user can **GET /items** and **POST /items** → OK
- [ ] (If possible) call `/items` **without** token → 401/403 as expected
- [ ] Confirm no accidental broad policies exist

### 4) CORS & cookies (backend auth endpoints)

- [ ] Confirm CORS allows credentials and local FE origins
- [ ] On signin, **http-only refresh cookie** set (dev flags acceptable)
- [ ] On logout, cookie **cleared**

### 5) Error normalization & toasts

- [ ] Trigger a validation error (e.g., title too long) → toast shows short message
- [ ] Trigger 401/403 → toast prompts re-auth (and/or redirect to `/auth`)
- [ ] Inspect response headers → **x-request-id** present; toast shows it in dev

### 6) Git safety & hygiene

- [ ] `git status` → no `.env*` or secrets staged
- [ ] Review diffs for unintended files (lockfiles, build artefacts)
- [ ] (Optional) run `prettier`/lint fixes if configured

### 7) Commit & push

- [ ] `git add` safe changes only
- [ ] `git commit -m "chore(s2): stabilize D2 (auth, RLS, CORS, error toasts)"`
- [ ] `git push`

### 8) Optional checkpoint tag

- [ ] Create tag: `git tag -a D2-END -m "D2 complete: auth + RLS + items + error normalization"`
- [ ] Push tags: `git push --tags`

### 9) What’s next (D3 preview)

- [ ] Owner-scoped RLS (`owner_id = auth.uid()`) and tightened policies
- [ ] Backend/Frontend tests and CI gating
- [ ] Loop deep dive (Intent→Plan→Code and PR flow) with more complex features