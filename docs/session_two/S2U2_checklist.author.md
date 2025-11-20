---
slug: s2u2-sdks-install
title: S2U2 — Install SDKs (Frontend & Backend)
description:
  Install Supabase SDKs in the correct project folders, ensuring the right working
  directory is used (/frontend vs /backend) and that no secrets are committed.
  No Supabase CLI in S2; we use Studio + SDKs only.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session2, unit2, supabase, sdk, install, setup]
orderIndex: 2
updated_at: 2025-11-20T00:00:00Z
---

# Install SDKs (Frontend & Backend)

# Status: Draft

## Objective

Install the Supabase SDKs in the **correct folders** so both the React frontend
and FastAPI backend can talk to your Supabase project. We will **not** use the
Supabase CLI in S2—schema is applied via Studio and versioned SQL migrations.

## Definition of Done

- `@supabase/supabase-js` installed **in `/my-ideas/frontend`** (and imports OK).
- `supabase` Python package installed in the **active backend env** (and imports OK).
- No secrets committed; keys will be added in a later TL.
- Optional: `requirements.txt` updated under `/my-ideas/backend/`.

## Important

- Run FE commands from the **FE terminal** in `my-ideas/frontent` (your “FE” tab).
- Run BE commands from the **BE terminal** with your Python env active
  (e.g., `(vibe)` or `(.venv)`), typically from `my-ideas/` and writing
  `requirements.txt` into `my-ideas/backend/`.
- Do **not** install Supabase CLI in S2.

## Legend

- [ ] = pending  
- [~] = in progress  
- [x] = completed

## Task Checklist

### 1) Frontend SDK (path: `/my-ideas/frontend`)

- [ ] In the **FE** terminal, `cd my-ideas/frontend`
- [ ] Install Supabase SDK for the browser:
  - `npm i @supabase/supabase-js`
- [ ] Sanity import test (optional):
  - `node -e "require('@supabase/supabase-js'); console.log('supabase-js ok')"`
- [ ] Confirm `package.json` now lists `@supabase/supabase-js`
- [ ] **Do not** add any keys yet (they’ll go into `/frontend/.env.local` in a later TL)

### 2) Backend SDK (path: project root, env active; write lockfile to `/backend`)

- [ ] In the **BE** terminal, ensure Python env is active (`(vibe)` or `(.venv)`)
- [ ] From `my-ideas/`, install Supabase Python client:
  - `pip install supabase`
- [ ] Create/refresh backend lockfile:
  - `mkdir -p backend && pip freeze > backend/requirements.txt`
- [ ] Sanity import test (optional):
  - `python -c "import supabase; print('supabase-py ok')"`

### 3) Verification

- [ ] FE: `npm ls @supabase/supabase-js` shows installed version
- [ ] BE: `python -c "import supabase; print('ok')"` prints `ok`
- [ ] No `.env` files committed (verify `.env*` ignored in `.gitignore`)
- [ ] (Optional) Commit non-secret changes:
  - `git add frontend/package.json frontend/package-lock.json backend/requirements.txt`
  - `git commit -m "chore(s2): install supabase SDKs (fe/be)"`
