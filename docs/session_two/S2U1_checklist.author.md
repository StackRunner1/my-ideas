---
slug: s2u1-supabase-studio-setup
title: S2U1 — Supabase Studio Setup (One-Time Web UI)
description:
  Create a Supabase project, capture API keys, enable Email auth, and set dev
  redirect URLs in the Supabase web console. Do not create tables here; you will
  manage schema via /supabase/migrations in VS Code and return later only to run
  migrations and enable RLS.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit1, supabase, studio, setup]
orderIndex: 1
updated_at: 2025-11-20T00:00:00Z
---

# Supabase Studio Setup (one-time web UI actions)

# Status: Draft

## Objective

Create the Supabase project in the **web console**, collect all required keys,
enable **Email/OTP** auth, and configure **dev redirect URLs**. You will **not**
create tables here—schema lives in versioned SQL under
`/supabase/migrations/` and will be applied later from the Studio SQL editor.

## Definition of Done

- Supabase project exists and is reachable in Studio.
- API URL, `anon` key, and `service_role` key are copied (to be placed in VS-Code env files later).
- Email/OTP auth is enabled and dev redirect URLs are set.
- No tables created yet (we will use migrations).
- You understand that you will return to Studio later **only** to run migrations and enable RLS.

## Important

- This TL is **entirely in Supabase Studio**. You will switch back to VS-Code
  in the next TLs to manage files and run installs.
- **Do not commit secrets.** We will place keys into `.env` files in a later TL.
- If your GitHub repo name is **`my-ideas`**, consider naming the Supabase
  project similarly for clarity (optional).

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Create the Supabase project

- [ ] Open **Supabase Studio** and click **New project**  
- [ ] **Project name**: (e.g., `my-ideas-dev`)  
- [ ] **Organization**: select / create as needed  
- [ ] **Region**: choose the closest region to you  
- [ ] **Database password**: set a strong password (store securely outside Git)  
- [ ] Wait for provisioning to complete (status: **Ready**)

### 2) Collect API URL and keys (do not paste into code yet)

- [ ] Go to **Project Settings → API**  
- [ ] Copy **Project URL** (a.k.a. `SUPABASE_URL`)  
- [ ] Copy **anon** (public) key (for frontend `VITE_SUPABASE_ANON_KEY`)  
- [ ] Copy **service_role** key (for backend `SUPABASE_SERVICE_ROLE_KEY`)  
- [ ] (Optional) Note the **project ref** for reference

### 3) Enable Email/OTP Auth

- [ ] Go to **Authentication → Providers**  
- [ ] Enable **Email** provider (OTP / magic link as per defaults)  
- [ ] Leave other providers disabled for now (Google/GitHub later)

### 4) Configure Auth URLs (dev)

- [ ] Go to **Authentication → URL Configuration**  
- [ ] **Site URL (dev)**: `http://localhost:5173`  
- [ ] **Redirect URLs (dev)**: add the frontend auth routes you will use, e.g.:  
  - `http://localhost:5173/auth`  
  - `http://localhost:5173/auth/callback`  
  - `http://localhost:5173/auth/confirm`  
  - `http://localhost:5173/auth/reset`  
  *(You can refine these to match your actual routes in S2 TL-8.)*

### 5) (Optional) Email settings

- [ ] **Authentication → Email templates**: leave defaults for D2  
- [ ] Confirm from-address and branding are acceptable for dev

### 6) Security posture reminder

- [ ] Do **not** create tables in **Table Editor** here—D2 uses **migrations**  
- [ ] RLS is configured later, after migrations are applied (S2 TL-7)  
- [ ] Keep copied keys secure; you will paste them into VS-Code `.env` files in the next TL

### 7) Exit Studio — return to VS-Code

- [ ] Close the Studio tab (or leave it open)  
- [ ] Proceed to **S2 TL-2: Install SDKs (FE & BE)**  
