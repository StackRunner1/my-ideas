---
slug: s1u5-checklist
title: S1U5 — Install Global VS Code Extensions (Manual via Marketplace)
description:
  Install the required user-scope (global) VS Code extensions manually via the
  Extensions Marketplace so the editor is ready before creating or opening the
  `my-ideas` app. Includes Tailwind, ESLint, Prettier, Python, Pylance, and
  GitHub Copilot + Copilot Chat.
type: markdown
courseId: 335b36d5-94e5-46df-b015-cfb9995cbeb7
tags: [checklist, session1, unit5, vscode, copilot]
orderIndex: 5
updated_at: 2025-11-20T10:55:00Z
---

# Install Global VS Code Extensions (Manual via Marketplace)

# Status: Draft

## Objective

Install the required **user-scope (global)** Visual Studio Code extensions
**manually via the Extensions Marketplace** (not per-project, not via CLI) so
your editor is ready for the course _before_ you create or open the `my-ideas`
app.

Required global extensions:

- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier – Code formatter**
- **Python**
- **Pylance**
- **GitHub Copilot**
- **GitHub Copilot Chat**

## Definition of Done

All seven extensions are installed **globally** (user scope), enabled, and
visible under the Extensions view. GitHub sign-in is completed and
Copilot/Copilot Chat show as enabled. No project-specific configuration has been
changed yet.

## Legend

- [ ] = pending
- [~] = in progress
- [x] = completed

## Task Checklist

### 1) Open the Extensions Marketplace

- [ ] Launch **Visual Studio Code** (no folder required)
- [ ] Open **Extensions** panel (left sidebar icon or `Ctrl+Shift+X` / `Cmd+Shift+X`)
- [ ] Confirm you are viewing the **Marketplace** (not “Installed” tab)

### 2) Install Required Extensions (User Scope)

> For each item below: type the name in the **Extensions** search bar → open the listing → click **Install**. Ensure it installs at the **global (user)** level, not “Workspace Recommended”.

- [ ] **Tailwind CSS IntelliSense** (by _Tailwind Labs_)
- [ ] **ESLint** (by _Microsoft_)
- [ ] **Prettier – Code formatter** (by _Prettier_)
- [ ] **Python** (by _Microsoft_)
- [ ] **Pylance** (by _Microsoft_)
- [ ] **GitHub Copilot** (by _GitHub_)
- [ ] **GitHub Copilot Chat** (by _GitHub_)

### 3) Verify & Enable Globally

- [ ] In **Extensions → Installed**, confirm each of the seven is listed and **Enabled**
- [ ] If any extension shows “Enable (Workspace)” only, switch to a **No Folder** window and enable it globally
- [ ] (Optional) For already-installed duplicates, ensure the global instance is enabled and no workspace-only copy is shadowing it

### 4) Sign In for Copilot & Chat

- [ ] Click the **Accounts** icon (lower-left) → Sign in with GitHub
- [ ] Complete the GitHub auth flow; accept any Copilot terms/subscription prompts
- [ ] Confirm **Copilot** status shows **Enabled** (check status bar / Accounts menu)
- [ ] Open **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) → run “Copilot: Sign in” if prompted
- [ ] Open **View → Appearance → Panel → Chat** (or “GitHub Copilot Chat”) and verify it loads

### 5) Sanity Checks (No Project Yet)

- [ ] Open **Settings** (`Ctrl+,` / `Cmd+,`) and search “format on save” → note current value (configure per project later)
- [ ] Open **Extensions → Tailwind CSS IntelliSense** and confirm it is enabled (no error banners)
- [ ] Open **Output** panel → check **GitHub Copilot** / **Python** / **Pylance** logs for obvious errors (none expected)

### 6) Ready for Next Unit

- [ ] Record a one-line note in your personal checklist: “Global extensions installed & Copilot active”
- [ ] Proceed to the **frontend bootstrap** unit (no extension conflicts reported)
