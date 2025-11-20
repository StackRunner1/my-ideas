---
slug: s2u8-frontend-auth-ui
title: S2U8 — Frontend Auth UI (/auth & /app) + Auto Refresh
description:
  Implement the public /auth layout (signup, signin, password reset) and a protected /app
  layout with redirect. Wire Supabase session listener and auto token refresh on the frontend.
  Keep tokens out of localStorage; no secrets committed. Verify full auth flow manually.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit8, frontend, auth, supabase, routing]
orderIndex: 8
updated_at: 2025-11-20T00:00:00Z
---

# Frontend Auth UI — `/auth` (public) & `/app` (protected) + Auto Refresh

# Status: Draft

## Objective

Add a public **`/auth`** layout with **signup**, **signin**, and **password reset**
screens, plus a protected **`/app`** layout that **redirects to `/auth`** when
no session is present. Wire the Supabase client and **`onAuthStateChange`**
listener for **auto token refresh** so a signed-in user stays authenticated on page
reload. Show a minimal “Signed in as …” and a **Sign out** action.

## Definition of Do ne

- Public **`/auth`** layout and pages exist (signup, signin, reset request/confirm).
- Protected **`/app`** layout exists; unauthenticated users are redirected to `/auth`.
- Supabase client is initialized on the FE; **session listener** handles auto refresh.
- After signup/signin, user lands in `/app` and remains authenticated after **hard refresh**.
- No secrets or tokens are committed; **no localStorage** for refresh tokens.

## Important

- **Prereqs**:  
  - S2U1 Studio setup done; S2U2 SDKs installed; S2U5 env files set (`/frontend/.env.local` contains `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`).  
  - Your Studio **Authentication → URL Configuration** includes dev URLs that match your routes (e.g., `http://localhost:5173/auth`, `/auth/callback`, `/auth/confirm`, `/auth/reset`).
- **Token practice**: keep **access token in memory** (context/state); **do not** store refresh tokens in localStorage.  
- This TL implements FE auth only. The **Axios interceptor** for attaching bearer tokens is in **S2U9**.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Verify environment & paths

- [ ] FE terminal is at **`/my-ideas/frontend`** and running `npm run dev`
- [ ] `/my-ideas/frontend/.env.local` contains `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase client package is installed (`@supabase/supabase-js`) (see S2U2)

### 2) Initialize Supabase client (frontend)

- [ ] Create a client module (e.g., `src/lib/supabaseClient.ts`) via AI assistant
- [ ] Use `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`
- [ ] Export the client and re-use it across auth pages and session provider

### 3) Add `/auth` layout (public) and routes

- [ ] Create `src/routes/auth/` (or `src/pages/auth/`) with a layout/shell
- [ ] Create pages:  
  - [ ] `/auth/signin` (email + password)  
  - [ ] `/auth/signup` (email + password)  
  - [ ] `/auth/reset` (request password reset by email)  
  - [ ] `/auth/confirm` (handles magic-link/OTP confirmations if enabled)
- [ ] In your router, mount `/auth/*` without guard (public)

### 4) Implement auth actions (using Supabase client)

- [ ] **Sign up**: `auth.signUp({ email, password })` → handle error/success  
- [ ] **Sign in**: `auth.signInWithPassword({ email, password })` → handle error/success  
- [ ] **Reset**: `auth.resetPasswordForEmail(email, { redirectTo: <your reset URL> })`  
- [ ] **Sign out**: `auth.signOut()` → redirect to `/auth`

### 5) Session store & auto refresh

- [ ] Create a lightweight **AuthProvider** (React context or Zustand/Redux slice) to hold **current user/session** in memory
- [ ] On mount, call `supabase.auth.getSession()` and set initial state
- [ ] Register `supabase.auth.onAuthStateChange((event, session) => { ... })` to update state on `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`
- [ ] Confirm that **hard refresh** (F5) keeps the user authenticated (auto refresh working)

### 6) Protected `/app` layout & redirect

- [ ] Create `/app` layout/shell (e.g., `src/routes/app/_layout.tsx` or `src/pages/app/Layout.tsx`)
- [ ] Implement a **route guard**: if no session in memory, **redirect to `/auth`**
- [ ] If session exists, render child routes (e.g., `/app` home, later `/app/items`)

### 7) Minimal UX polish

- [ ] Show **“Signed in as {email}”** somewhere in `/app` header
- [ ] Add a **Sign out** button that calls `auth.signOut()` and returns to `/auth`
- [ ] Provide basic error messages (can use existing toast system or a simple inline alert for now)
- [ ] Add a loading spinner/skeleton while session state is being resolved

### 8) Manual smoke tests

- [ ] **Sign up**: register a new user via `/auth/signup` → confirm success path
- [ ] **Sign in**: log in with that user → should land on `/app`
- [ ] **Refresh** the browser on `/app` → user remains authenticated (auto refresh)
- [ ] **Sign out** → user is redirected to `/auth`
- [ ] **Password reset**: trigger reset request → confirm email dispatch in Studio (if available) and flow reaches `/auth/confirm`

### 9) Security & cleanliness

- [ ] Confirm **no secrets** in code or Git history; keys only in `.env.local`
- [ ] Ensure **no tokens** are persisted to localStorage; access token is in memory
- [ ] Confirm Studio dev URLs match your actual FE routes (adjust if needed)

### 10) Commit (no secrets)

- [ ] `git status` shows only safe files (`src/**`, `package.json`, route files)
- [ ] `git add` updated FE files; **do not** add `.env.local`
- [ ] `git commit -m "feat(s2): add /auth public routes and /app protected layout with Supabase session refresh"`
- [ ] Proceed to **S2U9 — Axios Interceptor: Attach Access Token (Header)**
