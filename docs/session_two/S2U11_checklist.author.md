---
slug: s2u11-backend-items-user-scoped
title: S2U11 — Backend `/items`: Pydantic & User-Scoped Ops
description:
  Implement FastAPI endpoints GET /items and POST /items with Pydantic models (ItemCreate, ItemRead)
  and execute all database operations via user_scoped_client (derived from the caller's bearer token).
  Return errors in a consistent shape; verify 401/403 vs happy path.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit11, backend, items, pydantic, user-scoped, supabase]
orderIndex: 11
updated_at: 2025-11-20T00:00:00Z
---

# Backend `/items`: Pydantic & User-Scoped Ops

# Status: Draft

## Objective

Expose two endpoints on the backend:
- `GET /items` — return the signed-in user’s items.
- `POST /items` — create a new item owned by the signed-in user.

All Supabase calls must go through **`user_scoped_client`** constructed from the
**bearer access token** (auditable, per-user). Use **Pydantic** models for
validation and return early, readable errors (normalized in S2U13).

## Definition of Done

- Pydantic models exist: **`ItemCreate`**, **`ItemRead`** (and any small helpers).
- Routes exist under a router (e.g., `backend/app/api/items.py`): **`GET /items`** and **`POST /items`**.
- Both endpoints use `user_scoped_client` (no admin client) and obey RLS (auth-only).
- Happy path tested with a signed-in user; 401/403 paths verified with missing/invalid tokens.
- Errors returned in `{ "code", "message", "details" }` structure (even if minimal for now).

## Important

- **Prereqs**: S2U7 RLS enabled; S2U8 FE auth; S2U9 Axios interceptor; S2U10 auth endpoints.
- **Never** use `admin_client` for these routes. All operations must be **user-scoped**.
- Keep `title` validation simple (length 1–256). Owner scoping is via RLS for now; owner-only will be tightened later.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Create models & router (AI-first)

- [ ] File `backend/app/models/items.py` with:
  - [ ] `class ItemCreate(BaseModel): title: constr(min_length=1, max_length=256)`
  - [ ] `class ItemRead(BaseModel): id: UUID; title: str; created_at: datetime`
- [ ] File `backend/app/api/items.py` with `APIRouter(prefix="/items", tags=["items"])`

### 2) Wire user-scoped client extraction

- [ ] In a small dependency or helper, read `Authorization: Bearer <token>` from the request
- [ ] Pass the token to **`user_scoped_client.from_token(token)`** (or equivalent) to get a scoped client instance
- [ ] On missing/invalid token: return 401 `{ "code":"unauthorized", "message":"Missing or invalid token" }`

### 3) Implement `GET /items`

- [ ] Use the scoped client to `select` from `public.items` (RLS enforces auth-only)
- [ ] Map DB rows to `ItemRead` list; return 200 JSON
- [ ] On Supabase error: return `{code,message,details}` with an appropriate status (e.g., 500)

### 4) Implement `POST /items`

- [ ] Validate body with `ItemCreate`
- [ ] Insert row with `title` (and set `owner_id` if you already included it in insert logic; RLS is auth-only today)
- [ ] Return the inserted record mapped to `ItemRead`
- [ ] On Supabase error: return `{code,message,details}` with 400/500 as appropriate

### 5) Mount router & run

- [ ] In `backend/app/main.py`: `app.include_router(items_router)`
- [ ] Run backend: `uvicorn backend.app.main:app --reload --port 8000`

### 6) Manual tests

- [ ] **GET /items** with no token → 401
- [ ] **GET /items** with valid token → 200 `[]` (or list of user’s items)
- [ ] **POST /items** with valid token → 201/200 and item is returned
- [ ] **GET /items** again → newly created item appears
- [ ] Confirm Network → request contains `Authorization: Bearer <token>` (thanks to S2U9)

### 7) Error shape & logging

- [ ] Ensure errors use `{ "code", "message", "details" }` consistently
- [ ] Do not log tokens or secrets; if logging, include **`x-request-id`** (already added in D1) for correlation

### 8) Commit

- [ ] `git status` shows safe changes under `/backend/app/**`
- [ ] `git add backend/app`
- [ ] `git commit -m "feat(s2): items endpoints (GET/POST) via user_scoped_client with Pydantic models"`
- [ ] Proceed to **S2U12 — Frontend Items List & Create**
