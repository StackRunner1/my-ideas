---
slug: s1u3-checklist
title: Bootstrap the Backend (Python 3.12 + FastAPI + Uvicorn)
description:
  Provision a Python 3.12 environment, install FastAPI + Uvicorn, and scaffold a
  minimal backend exposing /health with CORS and request-id/timing middleware.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session1, unit3, backend]
orderIndex: 3
updated_at: 2025-11-20T10:55:00Z
---

# Bootstrap the Backend (Python 3.12 + FastAPI + Uvicorn) — Essential First Phase

# Status: In Progress (env + scaffold)

## Objective

Provision an isolated Python 3.12 environment, install FastAPI + Uvicorn, and
scaffold a minimal backend exposing `/health` with CORS and a request-id/timing
middleware (AI will author files).

## Definition of Done

Python env active (Conda `my-ideas` or `.venv`); packages installed; backend
folder and files created by AI;
`uvicorn backend.app.main:app --reload --port 8000` serves `/health` OK.

## Legend

- [ ] = pending
- [~] = in progress
- [x] = completed

## Task Checklist

### 1) Environment

In your **BE terminal** => navigate to /backend with `cd backend`

CHOOSE (preferred)

- [ ] **Conda** available: `conda --version`
- [ ] If needed: `conda init <your shell>` then restart VS Code window
- [ ] Create env: `conda create -n ideas python=3.12 -y`
- [ ] Activate env: `conda activate ideas`
- [ ] Verify: `python --version` prints 3.12.x

OR

- [ ] **venv** fallback: `python -m venv .venv`
- [ ] Activate: `. .venv/Scripts/Activate.ps1` (Windows) or
      `source .venv/bin/activate` (macOS/Linux)
- [ ] Verify: `python --version` prints 3.12.x

### 2) Install Runtime

- [ ] `python -m pip install --upgrade pip`
- [ ] Install FastAPI + Uvicorn: `pip install fastapi "uvicorn[standard]"`
- [ ] Install formatter (Black): `pip install black`
- [ ] Install import sorter (isort): `pip install isort`
- [ ] (Optional) First format run: `black .` (from /backend)
- [ ] (Optional) Sort imports: `isort .` (from /backend)

### 3) AI-Scaffold Backend Files (no manual edits)

- [ ] Create `backend/app/__init__.py`
- [ ] Create `backend/app/main.py` with:
  - [ ] `FastAPI(title="my-ideas-api", version="0.1.0")`
  - [ ] CORS allow `http://localhost:5173` and `http://127.0.0.1:5173`
  - [ ] Middleware: `x-request-id` and `x-duration-ms`
  - [ ] `GET /health` → `{ "status": "ok" }`

### 4) Run & Verify

- [ ] Open new terminal and from your project root, start server with:
      `python -m uvicorn backend.app.main:app --reload --log-level debug --port 8000`
- [ ] In your browser, open http://127.0.0.1:8000/health → shows
      `{ "status": "ok" }`

### 5) Hygiene

- [ ] (Recommended) In BE terminal from `/backend` run:
      `pip freeze > requirements.txt`
- [ ] Then, run `git status` shows only intended files
