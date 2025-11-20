---
slug: s2u12-frontend-items-list-and-create
title: S2U12 — Frontend Items List & Create (React Query Hooks)
description:
  Render the signed-in user's items and allow creation from the UI using React Query
  hooks (useGetItems, useCreateItem). Add a minimal "New Item" dialog, loading/error UX,
  and toasts. Handle unauthorized errors gracefully.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit12, frontend, react-query, axios, items, toasts]
orderIndex: 12
updated_at: 2025-11-20T00:00:00Z
---

# Frontend Items List & Create (React Query Hooks)

# Status: Draft

## Objective

Display the current user’s **Items** and allow creating new ones from the UI using
**React Query** hooks (`useGetItems`, `useCreateItem`). Provide a minimal “New Item”
dialog, clear loading/error states, and success/error toasts. Unauthorized cases
should redirect or display a gentle prompt.

## Definition of Done

- `useGetItems` and `useCreateItem` hooks exist and are used by the Items page.
- Items page shows list (empty state if none), loading, and error states.
- Minimal “New Item” dialog creates an item and updates the list.
- Toasts inform success/errors; 401/403 handled gracefully (redirect to `/auth`
  or surface a prompt).
- Axios client is used for API requests; bearer header comes from S2U9 interceptor.

## Important

- **Prereqs**:  
  - S2U11 backend `/items` endpoints (GET/POST) exist and use `user_scoped_client`.  
  - S2U9 Axios interceptor attaches `Authorization: Bearer <accessToken>`.  
  - S2U8 auth UI present; you can sign in to obtain a session.
- Install **sonner** in S2U13 (Error Normalization TL); for now you may use either
  sonner or a simple inline alert for basic UX.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Verify environment & paths

- [ ] FE terminal at **`/my-ideas/frontend`**; `npm run dev` running
- [ ] S2U11 backend is running on `:8000`
- [ ] Signed in via `/auth` so interceptor can attach the bearer token

### 2) Create data hooks (AI-first)

- [ ] `src/features/items/api.ts` (or similar) with two hooks:
  - [ ] `useGetItems(params?)` → `GET /items` (React Query `useQuery`)
  - [ ] `useCreateItem()` → `POST /items` (React Query `useMutation`)
- [ ] Query keys are **stable** (e.g., `['items']` and `['items', params]`)
- [ ] On create success, **invalidate** `['items']` (or update cache directly)
- [ ] Normalize errors (basic; full pattern in S2U13)

### 3) Build the Items page

- [ ] Create/update `src/pages/app/Items.tsx` (or your route component)
- [ ] Render list states:
  - [ ] **Loading** → skeleton/spinner
  - [ ] **Error** → message (and back link to `/app`)
  - [ ] **Empty** → friendly “No items yet” with a CTA to create
- [ ] Render non-empty list with minimal styling (title + created date)

### 4) “New Item” dialog

- [ ] Add a **New Item** button that opens a dialog/modal
- [ ] Dialog form includes a single **Title** field (validate 1–256 chars)
- [ ] On submit, call `useCreateItem().mutate({ title })`
- [ ] On success:
  - [ ] Close dialog
  - [ ] Show a success toast/alert (brief)
  - [ ] Ensure list refreshes (cache invalidation)
- [ ] On error:
  - [ ] Show an error toast/alert (short)
  - [ ] If 401/403 → redirect to `/auth` or show “Please sign in”

### 5) Minimal UX polish

- [ ] Add keyboard focus rings and aria-labels where relevant
- [ ] Provide inline validation for Title (empty/too long)
- [ ] Keep styles minimal; prioritize readability

### 6) Manual tests

- [ ] **Signed-out** user visits Items → sees redirect/prompt to sign in
- [ ] **Signed-in** user sees:
  - [ ] Empty state if no items
  - [ ] **New Item** dialog can create an item successfully
  - [ ] List refreshes; new item appears at top (or in order)
  - [ ] Loading and error states render correctly
- [ ] DevTools → Network shows `Authorization: Bearer …` on `/items` calls

### 7) Commit

- [ ] `git status` shows safe FE changes only (no `.env` files)
- [ ] `git add src/**` (pages, features, hooks, dialog)
- [ ] `git commit -m "feat(s2): frontend items list and create with React Query hooks"`

### 8) Next steps

- [ ] Proceed to **S2U13 — Error Normalization E2E** (sonner toasts; `{code,message,details}`; show `x-request-id`)