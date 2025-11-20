---
slug: s1u6-checklist
title: Unit 6 — Loop A: Intent → Plan → Code (AI-Guided Micro-Loop)
description: Practise an AI-first micro-loop to make a small, reversible UI change and verify results in the browser and Network tab.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session1, unit6, loop]
orderIndex: 6
updated_at: 2025-11-20T10:55:00Z
---

# Unit 6 — Loop A: Intent → Plan → Code (AI-Guided Micro-Loop)

# Status: Draft

## Objective

Practise the AI-first micro-loop to make a **small, reversible UI change** on
the `my-ideas` app (e.g., add a “Ping API” button on the Items page that calls
`/health`) and verify results in the browser and Network tab.

## Definition of Done

A minimal feature is implemented via a **3-step AI plan**, applied step-by-step
with **minimal diffs**, verified in the browser (UI change visible) and DevTools
(network request observed). No commit/push yet.

## Legend

- [ ] = pending
- [~] = in progress
- [x] = completed

## Task Checklist

### 1) Frame the Intent

- [ ] Write a one-sentence intent (what/why) for the small change (e.g., “Create
      a basic landing page (Home.tsx) for my application that welcomes the
      user”)
- [ ] Create and open the target file/folder in VS Code (e.g.,
      `frontend/src/pages/Home*.tsx`)

### 2) Ask AI for a 3-Step Plan

- [ ] In VS Code Chat, provide the intent and constraints
      (React+Vite+TS+Tailwind; minimal diffs; show file tree; wait for approval
      per step)
- [ ] Review the 3 steps; request smaller steps if needed
- [ ] Approve Step 1 only (do not allow steps 2–3 yet)

### 3) Apply Step 1 & Verify

- [ ] AI applies Step 1 (returns minimal diff + file list)
  - [ ] Open the app in the browser; verify UI change appears
  - [ ] Open DevTools → Network; confirm no unexpected errors
- [ ] If wrong, ask for diff-only revert to last good state

### 4) Apply Step 2 & Verify

- [ ] Approve and apply Step 2 (minimal diff + file list)
  - [ ] Reload the page; verify behaviour matches intent
  - [ ] Check DevTools → Network for the expected request

### 5) Apply Step 3 & Verify

- [ ] Approve and apply Step 3 (finalise UI/logic; minimal diff)
  - [ ] Reload page; confirm:
    - [ ] Button renders and is keyboard-reachable
    - [ ] Click triggers `GET /health` (visible in Network)
    - [ ] Simple loading hint shows while awaiting response
    - [ ] Result text (“ok”/“failed”) displays and clears appropriately

### 6) Record Outcome (no commit yet)

- [ ] Add a short note to `docs/journal/D1.md`: what changed, what to refine
      later
- [ ] Ensure no unintended files were modified (VS Code Source Control diff)
- [ ] Leave commit/push for Unit 7
