---
slug: s2u3-author-migrations
title: S2U3 — Author SQL Migrations (items, tags, item_tags, user_profile)
description:
  Author versioned SQL files under /supabase/migrations/ using the YYYYMMDDHHMMSS_name.sql
  convention. Define core tables (items, tags, item_tags, user_profile) and indexes/constraints.
  Do not run anything yet; we will apply migrations later in Supabase Studio.
type: markdown
importHint: "Run all authoring in VS Code at repo root: /my-ideas. You will execute these migrations later in S2U6."
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit3, supabase, migrations, sql, schema]
orderIndex: 3
updated_at: 2025-11-20T00:00:00Z
---

# Author SQL Migrations (root `/supabase/migrations/`)

# Status: Draft

## Objective

Create versioned SQL migration files for your core database schema **without
touching the Supabase web UI**. All table DDL lives in `/supabase/migrations/`
and is reviewed/committed like application code.

## Definition of Done

- The folder **`/my-ideas/supabase/migrations/`** exists in the repo.
- At least two SQL files exist, named with the convention
  **`YYYYMMDDHHMMSS_*`.sql** and containing:
  - `*_01_schema_init.sql` — tables: `items`, `tags`, `item_tags`, `user_profile`
  - `*_02_indexes.sql` — indexes & constraints for FKs/uniques
- Files are **committed**; **not executed** yet (execution happens in S2U6).
- SQL follows Postgres standards and your naming conventions (`snake_case`,
  `uuid` PKs via `gen_random_uuid()`, `timestamptz` timestamps).

## Important

- **Do not run these SQL files yet.** You will execute them manually in
  **Supabase Studio → SQL** during **S2U6**.
- Ensure your filenames are globally unique and monotonic:
  `YYYYMMDDHHMMSS_migration_name.sql` (UTC timestamp recommended).
- We use **`gen_random_uuid()`** for UUIDs. Supabase projects typically have
  `pgcrypto` enabled; if not, include  
  `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` at the top of your first migration.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Prepare the migrations directory

- [ ] In VS Code, ensure you are at repo root: `/my-ideas`
- [ ] Create folder: **`/supabase/migrations/`**
- [ ] Confirm `.gitignore` does **not** ignore `/supabase/migrations/`

### 2) Create the schema init migration (tables)

- [ ] Create file: **`/supabase/migrations/2025XXXXXXXXXX_01_schema_init.sql`**
- [ ] In this file, author DDL (AI-first, but include as comments what it should contain):
  - [ ] (Optional) `-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";`
  - [ ] **`items`**  
        - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`  
        - `owner_id uuid NOT NULL` *(FK to auth.users via RLS, no explicit FK)*  
        - `title text NOT NULL CHECK (length(title) BETWEEN 1 AND 256)`  
        - `created_at timestamptz NOT NULL DEFAULT now()`
  - [ ] **`tags`**  
        - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`  
        - `name text NOT NULL UNIQUE`  
        - `created_at timestamptz NOT NULL DEFAULT now()`
  - [ ] **`item_tags`** (join table)  
        - `item_id uuid NOT NULL`  
        - `tag_id uuid NOT NULL`  
        - `PRIMARY KEY (item_id, tag_id)`  
        - `FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE`  
        - `FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE`
  - [ ] **`user_profile`**  
        - `id uuid PRIMARY KEY DEFAULT auth.uid()` *(links profile to auth user)*  
        - `display_name text`  
        - `avatar_url text`  
        - `created_at timestamptz NOT NULL DEFAULT now()`

> **AI-first authoring:** Ask your IDE assistant to generate valid Postgres SQL
> for the above spec, using `gen_random_uuid()` and explicit constraints. Keep
> the file idempotent where possible (e.g., `CREATE TABLE IF NOT EXISTS` is
> acceptable for learning; in real migrations prefer pure `CREATE TABLE`).

### 3) Create the indexes & constraints migration

- [ ] Create file: **`/supabase/migrations/2025XXXXXXXXXX_02_indexes.sql`**
- [ ] Author indexes/constraints:  
  - [ ] `CREATE INDEX IF NOT EXISTS idx_items_owner_id ON public.items(owner_id);`  
  - [ ] `CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at);`  
  - [ ] `CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON public.item_tags(item_id);`  
  - [ ] `CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON public.item_tags(tag_id);`

> Add any needed `CHECK` constraints (e.g., `length(name) > 0`) and comments to
> explain intent. We’ll add **RLS policies** in a later migration (S2U7).

### 4) Sanity checks & commit

- [ ] Lint quickly (open each SQL file; visually confirm no obvious syntax errors)
- [ ] `git status` shows the new files under `/supabase/migrations/`
- [ ] Commit the migrations:
  - `git add supabase/migrations/*.sql`
  - `git commit -m "chore(db): add core schema migrations (items, tags, item_tags, user_profile)"`
- [ ] **Do not run** the migrations yet (execution is S2U6)

### 5) (Optional) Prepare a down-migration note

- [ ] Add a comment block at end of each file with the inverse DDL (DROP TABLE …)
- [ ] Explain in comments that we use **up-only** for this course; down is for reference

