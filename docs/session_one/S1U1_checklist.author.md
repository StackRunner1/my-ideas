---
slug: s1u1-checklist
title: S1U1 — Project Setup Checklist
description:
  Initialize a clean, trusted VS Code workspace with FE/BE terminals, baseline
  folders, and repo hygiene for Day 1 development.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, setup, session1, unit1]
orderIndex: 1
updated_at: 2025-11-20T00:00:00Z
---

# Project Setup (after cloning the empty repo)

# Status: Completed (initial scaffold)

## Objective

Initialize a clean, trusted VS Code workspace with dual terminals (FE/BE),
baseline folders, and repo hygiene so the project is immediately ready for Day 1
development.

## Definition of Done

Workspace is trusted; two terminals (FE/BE) are ready; baseline folders exist;
repo hygiene files are present (README, LICENSE optional); Git status is clean
on the default branch.

## Important

Ensure you named your project 'my-ideas' when you created your repository in
github and later cloned it locally and opened it in VS-Code. We will refer
'my-ideas' folder as the the root of your project. 'root' and 'my-ideas' will be
used interchangeably and frequently throughout the course.

## Legend

- [ ] = pending
- [~] = in progress
- [x] = completed

## Task Checklist

### 1) Workspace Trust & Terminals

- [x] Open the cloned repo in VS Code and **Trust** the workspace (Restricted
      Mode banner is gone)
- [x] Terminal → **New Terminal** (renamed tab to **FE**)
- [x] Terminal → **New Terminal** (renamed tab to **BE**)

### 2) Baseline Folders & Docs

- [x] Create **/docs** at repo root
- [x] Create **/session_one** in folder /docs
- [x] Create **/S1U1_checklist.author.md** in `/docs/session_one/`
- [x] Create **/frontend** at repo root
- [x] Create **/backend** at repo root
- [x] Create **/README.md** with a one-paragraph project summary

### 3) Repo Hygiene (root files)

- [x] Add **.gitignore** (Node, Python, OS artifacts; ignore `.env*`, `dist/`,
      `node_modules/`, `__pycache__/`)
- [x] (Optional) Add **.editorconfig** (UTF-8, LF, final newline, trim trailing
      whitespace, 2-space indent)
- [x] (Optional) Add **.gitattributes** (e.g., `* text=auto eol=lf`)

### 4) Verification & Clean Slate

- [x] **FE** terminal: run `git status` → no unintended changes (after commit)
- [x] (Optional) Create a branch for D1 work: `git switch -c feat/d1-setup` (skipped; committed on main for cleanliness)
- [x] Save a two-sentence reflection under **/docs/journal/D1.md** (what’s set
      up; what to improve tomorrow)
