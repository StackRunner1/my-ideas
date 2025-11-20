---
slug: s2u7-rls-policies-and-smoke-test
title: S2U7 — RLS (Authenticated-Only) — Policies & Smoke Test
description:
  Author and apply an RLS migration that enables row-level security and grants authenticated-only
  CRUD on items, tags, item_tags, and user_profile. Apply via Studio → SQL, then verify behavior.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit7, supabase, rls, security, policies]
orderIndex: 7
updated_at: 2025-11-20T00:00:00Z
---

# RLS (Authenticated-Only) — Policies & Smoke Test

# Status: Draft

## Objective

Protect your new tables with **row-level security** (RLS) by default and grant
**authenticated-only** CRUD access via explicit policies. Author the RLS policy
as a **versioned SQL migration** (in Git), apply it in **Supabase Studio → SQL**,
and then verify that unauthenticated access is blocked while authenticated access
succeeds. Owner-scoped policies (e.g., `owner_id = auth.uid()`) will be added in S3.

## Definition of Done

- A new migration file exists under `/my-ideas/supabase/migrations/` named
  `YYYYMMDDHHMMSS_03_rls_policies.sql` (use a fresh UTC timestamp).
- RLS is **enabled** on: `public.items`, `public.tags`, `public.item_tags`, `public.user_profile`.
- Policies created to allow **authenticated** users to **SELECT/INSERT/UPDATE/DELETE**
  on these tables (authenticated-only, not owner-scoped yet).
- Migration applied in Studio; RLS shows as **Enabled** for each table.
- Basic smoke test confirms:
  - **anon** role cannot read/write (permission denied),
  - **authenticated** role can read/write (or at least SELECT/INSERT).

## Important

- **Author in VS Code, apply in Studio**: schema & policies live in Git as SQL.
- **Keep RLS policies minimal now** (authenticated-only). We’ll refine to `owner_id = auth.uid()` in S3.
- Studio’s Table Editor is for **review/verification**; do not hand-edit schema/policies there—always use migrations.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Author the RLS migration (in VS Code)

- [ ] Ensure you are at repo root: `/my-ideas`
- [ ] Create a new migration file under `/supabase/migrations/` named like:
      **`2025YYYYMMDDHHMMSS_03_rls_policies.sql`**
- [ ] In the new file, author SQL to:
  - [ ] `ALTER TABLE public.items      ENABLE ROW LEVEL SECURITY;`
  - [ ] `ALTER TABLE public.tags       ENABLE ROW LEVEL SECURITY;`
  - [ ] `ALTER TABLE public.item_tags  ENABLE ROW LEVEL SECURITY;`
  - [ ] `ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;`
  - [ ] For each table, create **authenticated-only** policies (CRUD). Example intent:
        - `SELECT`: `USING (auth.role() = 'authenticated')`
        - `INSERT`: `WITH CHECK (auth.role() = 'authenticated')`
        - `UPDATE`: `USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated')`
        - `DELETE`: `USING (auth.role() = 'authenticated')`
  - [ ] Add brief comments noting that future sessions will tighten policies to `owner_id = auth.uid()` for `items`/`item_tags` and restrict `user_profile` to `id = auth.uid()`.

> **AI-first authoring**: Ask your IDE assistant to generate the full SQL for
> enabling RLS and creating the four CRUD policies per table (authenticated-only).
> Keep statements idempotent where appropriate (e.g., `create policy if not exists`).

### 2) Commit the migration (Git)

- [ ] `git add supabase/migrations/*_03_rls_policies.sql`
- [ ] `git commit -m "chore(db): add RLS authenticated-only policies for core tables"`

### 3) Apply the migration in Supabase Studio

- [ ] Open **Supabase Studio → SQL → New query**
- [ ] Paste the contents of your `*_03_rls_policies.sql`
- [ ] Click **Run**; wait for success (resolve any errors and re-run)
- [ ] Verify under **Table Editor** → each table → **RLS: Enabled**

### 4) Smoke test RLS in Studio

- [ ] In **SQL** editor, use the **“Run as”** dropdown (if available):
  - [ ] Set role to **`anon`** → run `select * from public.items limit 1;`
        - Expect **permission denied** (RLS blocks anonymous)
  - [ ] Set role to **`authenticated`** → run `select * from public.items limit 1;`
        - Expect success (even if empty set)
- [ ] (Optional) Insert test rows while **authenticated** to confirm `INSERT` works
- [ ] Document results in a quick note under `/docs/session_2/rls_smoke_test.md`

> If your SQL editor doesn’t let you switch roles, you can defer runtime testing
> until S2U8–S2U11 where FE requests carry an `Authorization: Bearer …` header.

### 5) Prepare for future owner-scoped policies (note only)

- [ ] Add a comment at the bottom of the migration explaining that in S3 you will:
  - For `items`/`item_tags`: tighten to `USING (owner_id = auth.uid())`
  - For `user_profile`: restrict `USING (id = auth.uid())`
  - Keep `tags` policy decisions for later (either global list vs. per-user)

### 6) Done

- [ ] All RLS is enabled and applied via migration  
- [ ] You’ve verified **anon** vs **authenticated** behavior or noted to verify in S2U8–S2U11  
- [ ] Proceed to **S2U8 — Frontend Auth UI: `/auth` & `/app` + Auto Refresh**
