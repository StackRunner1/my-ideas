---
slug: s2u6-run-migrations-and-review
title: S2U6 — Run Migrations & Practice Studio (Tables Review)
description:
  Apply your versioned SQL under /supabase/migrations in Supabase Studio (SQL editor),
  then review tables/columns/indexes. Do not hand-edit schema in Table Editor; if changes
  are needed, create a new migration file and re-run.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit6, supabase, migrations, sql, studio]
orderIndex: 6
updated_at: 2025-11-20T00:00:00Z
---

# Run Migrations & Practice Studio (Tables Review)

# Status: Draft

## Objective

Execute your **versioned SQL migrations** (created in S2U3) **in Supabase Studio → SQL**,
then **verify** the schema (tables, columns, indexes). Keep the schema **source-of-truth in Git**:
if you need adjustments, **author a new migration**—don’t hand-edit tables.

## Definition of Done

- The SQL files from `/my-ideas/supabase/migrations/` are applied in order.  
- Tables exist with expected columns/defaults: `items`, `tags`, `item_tags`, `user_profile`.  
- Indexes/constraints from the indexes migration are present.  
- Any fixes are captured in **a new timestamped migration file** and applied.  
- No manual/schema drift: Table Editor used only to **review**, not to change schema.

## Important

- Apply migrations in **timestamp order** (lowest → highest).  
- If Studio shows an error, **fix the SQL locally** and create a **new** migration file (e.g., `YYYYMMDDHHMMSS_fix_indexes.sql`).  
- You’ll return later to configure **RLS** via a separate migration (S2U7).

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Open the project in Supabase Studio

- [ ] Navigate to your **Supabase project** (created in S2U1)
- [ ] Confirm you’re in the **correct project/organization**

### 2) Apply migrations (SQL editor)

- [ ] Open **SQL** → **New query**
- [ ] From VS Code, open `/my-ideas/supabase/migrations/`
- [ ] Copy the **earliest** migration (e.g., `YYYYMMDDHHMMSS_01_schema_init.sql`) into Studio
- [ ] Click **Run** and wait for success
- [ ] Create a **new query tab**; copy the **next** migration (e.g., `YYYYMMDDHHMMSS_02_indexes.sql`)
- [ ] Click **Run** and wait for success
- [ ] Repeat for any additional migration files, in timestamp order

### 3) Verify tables & columns (Table Editor)

- [ ] Go to **Table Editor**
- [ ] Confirm **`public.items`** exists with:  
      [ ] `id uuid pk default gen_random_uuid()`  
      [ ] `owner_id uuid`  
      [ ] `title text` (with length/NOT NULL as per your DDL)  
      [ ] `created_at timestamptz default now()`  
- [ ] Confirm **`public.tags`** exists with:  
      [ ] `id uuid pk default gen_random_uuid()`  
      [ ] `name text UNIQUE`  
      [ ] `created_at timestamptz default now()`  
- [ ] Confirm **`public.item_tags`** exists with:  
      [ ] Composite PK `(item_id, tag_id)`  
      [ ] FKs to `items(id)` and `tags(id)` (CASCADE deletes if set)  
- [ ] Confirm **`public.user_profile`** exists with:  
      [ ] `id uuid pk default auth.uid()` (or your chosen pk default)  
      [ ] `display_name text`  
      [ ] `avatar_url text`  
      [ ] `created_at timestamptz default now()`

### 4) Verify indexes & constraints

- [ ] Check indexes exist (e.g., `idx_items_owner_id`, `idx_items_created_at`, `idx_item_tags_item_id`, `idx_item_tags_tag_id`)
- [ ] Confirm any `UNIQUE` or `CHECK` constraints (e.g., `tags.name` unique) are present

### 5) If changes are needed (fix via new migration)

- [ ] **Do not** edit tables directly in Table Editor  
- [ ] In VS Code, create a new migration file under `/supabase/migrations/` using the naming convention `YYYYMMDDHHMMSS_fix_<name>.sql`  
- [ ] Commit the file to Git  
- [ ] Back in Studio → **SQL**, paste and **Run** this new migration  
- [ ] Re-verify tables/indexes as above

### 6) Commit confirmation (local repo)

- [ ] In VS Code, open terminal and run `git status`  
- [ ] Ensure your migration files are **committed** (no untracked SQL files)  
- [ ] (Optional) `git commit -m "chore(db): apply core schema migrations in Studio; verify tables/indexes"`

### 7) Ready for RLS (next TL)

- [ ] Proceed to **S2U7 — RLS (Authenticated-Only) — Policies & Smoke Test**  
  (You’ll write and apply an additional migration for RLS policies.)
