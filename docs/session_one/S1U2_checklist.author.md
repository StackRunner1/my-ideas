---
slug: s1u2-checklist
title: Bootstrap the Frontend (React + Vite + TypeScript + Tailwind)
description:
  Create a minimal React/Vite/TS frontend with Tailwind, Router, React Query,
  and a single Axios apiClient ready for HTTP calls.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session1, unit2, frontend]
orderIndex: 2
updated_at: 2025-11-20T10:55:00Z
---

# Bootstrap the Frontend (React + Vite + TypeScript + Tailwind) — Essential First Phase

# Status: Completed (frontend bootstrap done)

## Objective

Create a minimal, fast React/Vite/TS frontend with Tailwind wired, Router and
React Query providers ready, and a single Axios apiClient for HTTP calls.

## Definition of Done

`frontend/` exists; dependencies are installed; Tailwind config and
`src/index.css` are in place; `npm run dev` starts; base routes render;
`apiClient.ts` exists.

## Legend

- [ ] = pending
- [~] = in progress
- [x] = completed

## Task Checklist

### 1) Scaffold & Install

- [ ] In **FE** terminal at repo root scaffold: `npm create vite@latest frontend -- --template react-ts`
  - [ ] Choose React and Typescript + React Compiler
- [ ] Navigate to /frontend: `cd frontend`
- [ ] Install base dependencies: `npm install`

### 2) Tailwind Essentials (in FE temrinal and from /frontend folder)

- [ ] Install toolchain: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Generate config: `npx tailwindcss init -p`
- [ ] Update **tailwind.config.(js|ts)** `content` globs: `./index.html`,
      `./src/**/*.{ts,tsx,jsx,js}`
- [ ] Create/replace **src/index.css** with Tailwind base/components/utilities

### 3) Core Libraries (First Phase Only)

- [ ] Install: `npm install react-router-dom @tanstack/react-query axios`
- [ ] Ensure React Query and Router providers are added in `src/main.tsx` (migrated from JSX to TSX)

### 4) Axios apiClient

- [ ] Create folder **src/api/**
- [ ] Create file **src/api/apiClient.ts**
- [ ] Implement Axios instance with:
  - [ ] `baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"`
  - [ ] `timeout: 5000`
  - [ ] JSON headers
- [ ] Do not create an api request in App.tsx at this point - we do that later

### 5) Run & Verify

- [ ] Start dev server: `npm run dev`
- [ ] Browser opens Vite URL (e.g., http://127.0.0.1:5173)
- [ ] Tailwind utilities render (e.g., `text-xl` looks larger)
- [ ] TypeScript typecheck passes: `npm run typecheck`
  - Notes: Added `vite-env.d.ts` and removed explicit `.tsx` import extensions to fix type errors.

### 6) Clean Up

- [ ] Remove any leftover `.jsx` or unused `.js` artifacts (completed)
- [ ] In the FE terminal run `git status` - shows only intended files
