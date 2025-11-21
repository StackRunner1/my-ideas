---
slug: s1u4-checklist
title: Essential Files & Config (gitignore, envs, docs, agents)
description:
  Add foundational config and docs to keep the repo clean, secrets safe, and AI
  collaboration clear (ignore patterns, env placeholders, docs, agent notes).
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session1, unit4, hygiene]
orderIndex: 4
updated_at: 2025-11-20T10:55:00Z
---

# Essential Files & Config (gitignore, envs, docs, agents)

# Status: Draft

## Objective

Add foundational configuration files to keep the repo clean, secrets safe, and
AI collaboration clear (ignore patterns, env placeholders, docs, agent notes).

## Definition of Done

`.gitignore`, env placeholders, and basic docs exist; no secrets tracked; Git
status is clean.

## Legend

- [ ] = pending
- [~] = in progress
- [x] = completed

## Task Checklist

### 1) Ignore & Formatting

- [ ] Create file **.gitignore** at repo root
- [ ] Ask AI assistant to write **.gitignore** with:
  - [ ] Node: `node_modules/`, `dist/`
  - [ ] Python: `.venv/`, `__pycache__/`, `*.pyc`
  - [ ] OS/Editor: `.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/*` (allow
        `.vscode/settings.json` if desired)
  - [ ] Env files: `.env*`
- [ ] (Optional) At the root, create **.editorconfig** (UTF-8, LF, final
      newline, trim trailing whitespace, 2-space indent)
- [ ] (Optional) At the root, create **.gitattributes** (`* text=auto eol=lf`)

### 2) Environment Placeholders (no secrets)

- [ ] Create **frontend/.env.local** and write placeholders:
  - [ ] `VITE_API_BASE_URL=http://127.0.0.1:8000`
  - [ ] `VITE_SUPABASE_URL=`
  - [ ] `VITE_SUPABASE_ANON_KEY=`
- [ ] Create **backend/.env** and write placeholders:
  - [ ] `SUPABASE_URL=`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=`
- [ ] Copy `.env` in `backend/` and rename to `.env.example`
- [ ] Copy `.env.local` in `frontend/` and rename to `.env.example`
- [ ] Confirm `.env*` are ignored by Git
      (`git check-ignore -v frontend/.env.local backend/.env`)
- [ ] Ask AI assistant to explain `backend/.env`, `.env.example`, and
      `frontend/.env.local`

### 3) Docs & Agents

- [ ] Ask AI Assistant to extend **README.md** with a one-paragraph description
      and local run quickstart
- [ ] **docs/** exists with a **session_1/** subfolder
- [ ] **docs/session_1/** contains the unit checklists for Unit 1-4
- [ ] Create **AGENTS.md** at project root and ask AI Assistant to write core instructons:
  - [ ] AI-first workflow summary (file edits via agent; user runs CLI; user reviews before user commits)
  - [ ] Prompt conventions (ask for minimal diffs, file trees, acceptance criteria)
  - [ ] Safety rules (no secrets; do not stage/commit/push without confirmation)

### 4) Verify & Commit (performed by user)

- [ ] In terminal, run `git status` shows only intended files
- [ ] Run the commit flow:
  - [ ] Open 'Source Control' in primary side panel
  - [ ] Review files in 'Changes'
  - [ ] Select 'Stage All Changes' ('+' button next to Changes)
  - [ ] Click the sparkle button in the commit Message field to ask Copilot to write a commit message
  - [ ] Review the message, then select 'Commit & Push' in blue split button
- [ ] Go to your GitHub account / project and verify the commit
