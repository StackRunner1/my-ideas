# AGENTS

This repository uses an AI-assisted, file-editing workflow. The file below
summarizes the intended AI-first collaboration guidelines, prompt
conventions, and safety rules for working with agents.

AI Agent or AI Assistant refers to Github Copilot Chat (Agent mode).
GH CP or gh cp refers to Github Copilot (Chat) - the AI coding assistant.

Information about the app/project can be found in the README.md at the root of the project.


## AI-First Workflow

- Edit files via the AI agent when asking for scaffolding, refactors, or
  templates. The agent will create minimal, focused diffs and avoid
  unrelated changes.
- The user reviews all changes produced by the agent before staging,
  committing, or pushing to remote. The AI should never push on behalf of
  the user.
- The user is responsible for running and testing the app locally after
  requested changes. The agent may run automated tests or local checks if
  given permission.

## Prompt Conventions

- Ask for minimal diffs: provide a short description of intent, list files to
  change, and acceptance criteria.
- When requesting new files, include the desired path and a short example of
  the expected behavior or API surface.
- For behavior verification include commands the agent can run (for example:
  `python -m uvicorn backend.app.main:app --port 8000` or `python -m pytest`).
- Prefer small incremental changes. Large cross-cutting changes should be
  broken into multiple steps with explicit review points.

## Safety Rules

- Do not create, store, or print secrets in repository files. Use `.env` for
  local secrets and provide sanitized `.env.example` files for sharing.
- The agent must not stage, commit, or push secrets to remote repositories.
- The agent should avoid making unattended network requests that could leak
  project information, unless explicitly authorized.

## Acceptance Criteria

- Changes should be limited to the files requested and meet the stated
  acceptance criteria in the prompt or checklist.
- The repository should remain free of secrets in committed files (`.env`,
  keys, tokens). Example env files (`.env.example`) are allowed.

If you'd like different wording or additional sections (coding standards,
testing policy, release steps), tell me what to add and I will update this
document.
