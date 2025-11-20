---
slug: s2u13-error-normalization-e2e
title: S2U13 — Error Normalization E2E (BE {code,message,details} + FE toasts)
description:
  Centralize backend errors to a single JSON shape {code,message,details} and surface them
  in the frontend with clear toasts (sonner). Include x-request-id in responses and display
  it in debug to aid support and tracing. Add an Axios response interceptor mapper.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit13, errors, toasts, tracing, axios, fastapi, sonner]
orderIndex: 13
updated_at: 2025-11-20T00:00:00Z
---

# Error Normalization E2E — `{code,message,details}` + Toasters + `x-request-id`

# Status: Draft

## Objective

Provide a **consistent, debuggable error experience** across the stack:
- **Backend (FastAPI):** return errors in the canonical JSON shape  
  `{ "code": string, "message": string, "details": object }`, include **`x-request-id`** on every response, and map common error cases (401/403/404/422/5xx).
- **Frontend (React):** install **sonner** to show concise, non-blocking toasts, add an Axios **response interceptor** to normalize various error payloads into the canonical shape, and (in dev) display **`x-request-id`** to help debugging.

## Definition of Done

- FastAPI has a **global exception handler** (plus handlers for common errors) that outputs `{code,message,details}` and sets/propagates `x-request-id`.
- Axios has a **response interceptor** that maps any backend error to `{code,message,details}` and triggers a toast (using **sonner**).  
- 401/403 show helpful messages and route users to re-auth when appropriate; no sensitive data is logged.
- Manual tests confirm clean behavior for happy path and key failure modes (401/403/422/5xx).  
- No secrets or tokens exposed in logs or toasts.

## Important

- **Prereqs:**  
  - D1 added a request-id/timing middleware; ensure `x-request-id` is present on all responses.  
  - S2U9 Axios request interceptor is already attaching bearer tokens for protected routes.  
  - S2U11/12 items endpoints are live.
- **Privacy & safety:** keep messages short and actionable; do not expose stack traces or tokens.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Backend — establish a canonical error model (AI-first)

- [ ] Create `backend/app/core/errors.py` with:
  - [ ] `class ApiError(BaseModel): code: str; message: str; details: dict | None = None`
  - [ ] utility: `def error_response(code: str, message: str, details: dict | None = None, status: int = 400) -> JSONResponse`
- [ ] In `backend/app/main.py` (or `app/core/handlers.py`), register handlers for:
  - [ ] `HTTPException` → map to `{code,message,details}` (`code` from exception or derive from status)
  - [ ] `RequestValidationError` (422) → `code="validation_error"`, `details` include simplified field errors
  - [ ] generic `Exception` → `code="internal_error"`; `message="Something went wrong"`; no internals leaked
- [ ] Ensure every error response sets/forwards **`x-request-id`** (get from your middleware; add header on error responses)

### 2) Backend — normalize common statuses

- [ ] 401 Unauthorized → `{code:"unauthorized", message:"Please sign in", details:{}}`
- [ ] 403 Forbidden → `{code:"forbidden", message:"You don’t have access to this resource", details:{}}`
- [ ] 404 Not Found → `{code:"not_found", message:"Resource not found", details:{}}`
- [ ] 422 Validation → `{code:"validation_error", message:"Validation failed", details:{ fields:[...] }}`
- [ ] 500 Internal → `{code:"internal_error", message:"Something went wrong", details:{} }`
- [ ] Return consistent **Content-Type: application/json** and **x-request-id** header.

### 3) Frontend — install and set up toasts (sonner)

- [ ] **FE terminal** at `/my-ideas/frontend`: `npm i sonner`
- [ ] Add the `<Toaster />` root component (e.g., in `App.tsx` or your top-level layout)
- [ ] Create `src/lib/toast.ts` with helpers:
  - [ ] `toastError({ message, code, requestId })` — concise text, show `requestId` only in dev
  - [ ] `toastSuccess(message)` — short success message

### 4) Frontend — Axios response interceptor (error mapping)

- [ ] In `src/api/apiClient.ts` (or similar), add a **response error** interceptor that:
  - [ ] Extracts backend error shape if already `{code,message,details}`
  - [ ] If not, map from other shapes (e.g., `{detail:"..."}`, arrays, plain text) to `{code:"unknown_error", message:"...", details:{ raw: ... }}`
  - [ ] Read **`x-request-id`** from the response headers and pass it to `toastError(...)`
  - [ ] For **401**: clear in-memory session and route to `/auth` (or prompt sign-in)
  - [ ] Reject the normalized error so calling code can handle edge cases

### 5) Manual tests — provoke canonical failures

- [ ] Stop the backend and trigger a protected call → FE should show a “cannot reach server” style error (mapped), network error safe-handled
- [ ] Call `/items` without a token → FE toast shows **unauthorized** with a short instruction; user redirected/prompted to sign in
- [ ] Send invalid body (e.g., title too long) → shows **validation_error** with a compact message
- [ ] Request a non-existing resource → shows **not_found**
- [ ] Confirm DevTools → **`x-request-id`** present and visible in the toast **in dev**

### 6) Logging & hygiene

- [ ] Backend: ensure no tokens or secrets in logs; include `x-request-id` with severity and route on errors
- [ ] Frontend: ensure no token values or stack traces leak to toasts/console
- [ ] Optional: add a debug panel or link that copies `{code,message,requestId}` for support

### 7) Commit

- [ ] `git status` → only safe changes (`src/lib/toast.ts`, `src/api/apiClient.ts`, backend `core/errors.py`/handlers)
- [ ] `git add backend/app/core/** src/lib/** src/api/**`
- [ ] `git commit -m "feat(s2): normalize errors {code,message,details}; add sonner toasts and x-request-id surfacing"`
- [ ] Proceed to **S2U14 — Optional KPI (`view_items_by_day`)** or **S2U15 — Troubleshooting & Commit**
