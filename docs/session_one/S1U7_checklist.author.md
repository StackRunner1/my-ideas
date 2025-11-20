---
slug: s1u7-checklist
title: Unit 7 — Loop A: Intent → Plan → Code (AI-Guided Micro-Loop)
description: Create a clean feature branch, make a focused commit of only intended changes, and open a PR to main with a concise description — do not merge yet.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session1, unit7, loop]
orderIndex: 7
updated_at: 2025-11-20T10:55:00Z
---


# AI Development Loop: Intent → Plan → Code (AI-Guided Micro-Loop)

# Status: Draft

## Objective

Create a clean **feature branch**, make a focused commit of only the intended
changes from Unit 6, and open a **Pull Request to `main`** with a concise
description (What/Why/How to test/Rollback). Do **not** merge yet.

## Definition of Done

A single, focused PR exists against `main` with a clear title and description;
diff contains only intended changes; no merge performed.

## Legend

- [ ] = pending
- [~] = in progress
- [x] = completed

## Task Checklist

### 1) Prepare to Branch

- [ ] Open **Source Control** and review diffs → only intended files changed
- [ ] 'Changes' dropdown shows no files

### 2) Create Feature Branch

- [ ] `git status` (ensure clean or known changes only)
- [ ] `git fetch origin` (fetch latest branches)
- [ ] `git pull origin main` (update local main)
- [ ] `git checkout -b loop` (create and switch to new branch locally)
- [ ] Make one intentional change (add text to `Home.tsx` via AI Assistant)

### 3) Stage Intentionally

- [ ] Stage only intended files (avoid lockfiles unless necessary)
  - [ ] `git add <changed-file-1>`
  - [ ] `git add <changed-file-2>`
- [ ] `git status` shows only the intended set

### 4) Commit (Focused, Present-Tense)

- [ ] Choose one commit message:
  - [ ] `feat(items): add "Ping API" button and loading/result hint`
  - [ ] `feat(items): wire /health ping with minimal UI`
  - [ ] `feat(items): introduce small AI-guided ping action`
- [ ] `git commit -m "<chosen message>"`

### 5) Push & Open PR

- [ ] `git push -u origin feat/loop-a-ping-api`
- [ ] Open PR to `main` in GitHub

### 6) Write a Crisp PR Description

- [ ] What: brief summary of the change
- [ ] Why: user value / learning objective
- [ ] How to test: (Open Items → click button → see `ok` → verify Network)
- [ ] Rollback: revert commit or remove new button changes
- [ ] (Optional) Reviewer checklist: UI renders, keyboard focus, Network call,
      error path

### 7) Hold Merge

- [ ] Do not merge (CI-gated merges in later units)
- [ ] Capture any reviewer feedback for next iteration
