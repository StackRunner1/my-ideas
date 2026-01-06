# Production Deployment & CI/CD - Product Requirements Document v1.0

## Overview

Comprehensive documentation of **production deployment to Vercel (frontend) and
Fly.io (backend)** with automated CI/CD pipelines via GitHub Actions for the
code45 platform.

**Key Architecture**: This implementation provides end-to-end deployment
automation:

1. **Frontend on Vercel**: React/Vite app with monorepo configuration,
   environment scoping, Git integration
2. **Backend on Fly.io**: FastAPI containerized deployment with secrets
   management, health monitoring
3. **CI/CD via GitHub Actions**: Automated quality gates, branch protection,
   deployment automation
4. **Production Integration**: CORS configuration, environment wiring,
   end-to-end validation

## Business Context

- **Problem**: Applications need production deployment with automated quality
  gates, secure configuration management, and reliable release processes
- **Solution**: Platform-as-a-Service deployments (Vercel + Fly.io) with GitHub
  Actions CI/CD, branch protection, and comprehensive monitoring
- **Value**: Professional deployment workflow, automated testing, secure secrets
  management, production-ready operations

## Implementation Scope

This PRD documents complete deployment infrastructure including:

1. **Repository Preparation**: Monorepo structure validation, environment
   variable inventory, deployment readiness checks
2. **Vercel Deployment**: Account setup, project configuration, environment
   variables, Git integration, automated deployments
3. **Fly.io Deployment**: Account setup, CLI configuration, fly.toml setup,
   secrets management, container deployment
4. **CI/CD Pipelines**: Frontend checks, backend checks, TypeScript validation,
   automated deployments, branch protection
5. **Production Integration**: CORS configuration, API URL wiring, end-to-end
   testing, monitoring setup
6. **Operational Readiness**: Troubleshooting playbooks, rollback procedures,
   documentation, performance optimization

## AI Coding Agent Instructions

**IMPORTANT**: In this PRD document, prompts aimed at the AI coding assistant
are marked with `## AI PROMPT` (Phase level) and `#### AI PROMPT` (Unit level if
applicable).

- **The learner** pastes the prompt into the chat to initiate implementation
- **AI Coding Assistant** executes tasks and marks completion: `[x]` =
  completed, `[~]` = in progress, `[ ]` = pending
- Sections marked **"PAUSE"** are milestones requiring learner approval before
  proceeding

## Prerequisites: Environment Setup (Before Unit 1)

### Repository Setup

- [ ] Sessions 1-4 complete (app fully functional locally)
- [ ] Git repository on GitHub with remote configured
- [ ] Default branch: `main` (verify with `git branch --show-current`)
- [ ] No uncommitted changes: `git status` shows clean working tree
- [ ] Frontend runs locally: `npm run dev` from frontend/
- [ ] Backend runs locally: `python -m uvicorn app.main:app --reload` from
      backend/

### Account Requirements

- [ ] GitHub account with repository access
- [ ] Credit card available (required for Vercel Pro features and Fly.io)
- [ ] Email access for account verification

### Local Development Tools

- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Git CLI configured with user name and email
- [ ] Terminal/PowerShell with admin privileges (for CLI installations)

### Environment Files

- [ ] frontend/.env.example exists with all required variables
- [ ] backend/.env exists with Supabase credentials and OpenAI key
- [ ] .gitignore excludes .env files (verify: `git check-ignore .env`)

## Architecture Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                        │
│                         (Source of Truth)                       │
└────────────┬─────────────────────────────────┬──────────────────┘
             │                                 │
             │ PR opened                       │ Push to main
             ▼                                 ▼
    ┌────────────────┐                ┌────────────────┐
    │  GitHub Actions│                │ GitHub Actions │
    │   CI Workflows │                │  CD Workflows  │
    │                │                │                │
    │ • Frontend CI  │                │ • Vercel Deploy│
    │ • Backend CI   │                │ • Fly Deploy   │
    │ • TypeScript   │                │                │
    └────────────────┘                └───────┬────────┘
             │                                │
             │ Status checks                  │ Trigger deploy
             ▼                                ▼
    ┌────────────────┐                ┌────────────────┐
    │ Branch         │                │  Deployment    │
    │ Protection     │◄───────────────│  Platforms     │
    │ (Enforce CI)   │   Report status│                │
    └────────────────┘                └───────┬────────┘
                                              │
                          ┌───────────────────┴──────────────┐
                          ▼                                  ▼
                  ┌───────────────┐                  ┌──────────────┐
                  │    Vercel     │                  │   Fly.io     │
                  │   (Frontend)  │                  │  (Backend)   │
                  │               │                  │              │
                  │ • Git Trigger │                  │ • Dockerfile │
                  │ • Env Vars    │                  │ • Secrets    │
                  │ • CDN         │                  │ • Machines   │
                  └───────┬───────┘                  └──────┬───────┘
                          │                                 │
                          │ HTTPS                           │ HTTPS
                          ▼                                 ▼
                  ┌───────────────┐                  ┌──────────────┐
                  │   Production  │◄─────CORS────────│  Production  │
                  │   Frontend    │                  │   Backend    │
                  │   vite build  │    API Calls     │   FastAPI    │
                  └───────────────┘─────────────────►└──────────────┘
```

### CI/CD Pipeline Flow

```
Developer → Feature Branch → Open PR → CI Checks Run
                                           │
                               ┌───────────┴──────────┐
                               ▼                      ▼
                        Frontend CI             Backend CI
                        • lint                  • ruff check
                        • typecheck             • mypy
                        • build                 • pytest
                               │                      │
                               └───────────┬──────────┘
                                           ▼
                                    All Checks Pass?
                                           │
                                   ┌───────┴───────┐
                                   NO              YES
                                   │               │
                            Block Merge      Allow Merge
                                               │
                                               ▼
                                        Merge to main
                                               │
                               ┌───────────────┴──────────────┐
                               ▼                              ▼
                        Vercel Deploy                   Fly Deploy
                        (Git trigger)                (GitHub Action)
                               │                              │
                               └──────────┬───────────────────┘
                                          ▼
                                  Production Updated
```

## Core Goals and Objectives

### Goal 1: Vercel Frontend Deployment

Deploy React/Vite frontend with environment management, Git integration,
automated deployments

### Goal 2: Fly.io Backend Deployment

Deploy FastAPI backend with container orchestration, secrets management, health
monitoring

### Goal 3: CI/CD Automation

Implement quality gates, automated deployments, branch protection, rollback
capabilities

### Goal 4: Production Integration

Connect frontend to backend with CORS, environment configuration, end-to-end
validation

---

## Implementation Plan & Sequence

### Legend

- `[ ]` = Pending
- `[~]` = In Progress
- `[x]` = Completed

---

## AI PROMPT: Initial Engagement

```
I need you to implement the Production Deployment & CI/CD PRD (Beast_Mode_Deployment_PRD1.md) end-to-end.

EXECUTION REQUIREMENTS:
- Follow unit sequence exactly (Units 0-21)
- Mark deliverables as [x] in PRD as completed
- Ask for approval at PAUSE points before proceeding
- Run validation tests after each phase
- Flag missing dependencies or unclear requirements immediately

TECHNICAL CONSTRAINTS:
- Frontend: React 18.2, TypeScript, Vite 5.x, Vercel deployment
- Backend: Python 3.11+, FastAPI, Fly.io containerized deployment
- CI/CD: GitHub Actions with status checks and branch protection
- Platforms: Vercel (frontend), Fly.io (backend)

PREREQUISITES:
- Sessions 1-4 complete (app works locally)
- GitHub repository with remote configured
- Clean git status (no uncommitted changes)
- Accounts ready: GitHub, Vercel, Fly.io

START WITH:
- Phase 1: Foundation & Planning (Units 0-2)
- Verify repository structure before platform setup
- Document all URLs and configuration in deployment plan

Begin with Phase 1 Unit 0.
```

---

# PHASE 1: FOUNDATION & PLANNING (Units 0-2)

**Goal**: Validate repository structure, inventory environment variables,
understand deployment architecture

**Outcome**: Deployment plan document, environment variable matrix, repository
confirmed ready

---

## AI PROMPT: Phase 1 Implementation (Units 0-2)

```
Help me implement Phase 1 - Foundation & Planning (Units 0-2):

**Pre-Brief (Unit 0)**
1. Review S5_ENHANCED_OVERVIEW.md for deployment goals
2. Ask learner for repository URL, default branch name, app naming preferences
3. Create docs/deployment-plan.md with deployment targets, trigger rules, URL placeholders
4. Add CI/CD flow diagram (Mermaid format)
5. Add section explaining CI (quality gates) vs CD (deployment automation)
6. Document three failure classes: build failures, runtime failures, missing config

**Repository Structure (Unit 1)**
7. Verify frontend/package.json exists with build/dev scripts
8. Verify backend/requirements.txt exists
9. Check for monorepo dependencies (shared packages outside frontend/)
10. Identify Node version requirements (.nvmrc or package.json engines)
11. Identify Python version requirements (pyproject.toml or README)
12. Document build commands, dev commands, ports in deployment plan
13. Add "How to run locally" section to main README.md
14. Verify .gitignore excludes .env files and secrets

**Environment Variable Inventory (Unit 2)**
15. Scan frontend for env var usage (import.meta.env, VITE_*)
16. Scan backend for env var usage (os.environ, settings)
17. Create docs/env-var-matrix.md with table columns: Variable, Service, Secret?, Build/Runtime, Platforms
18. Review or create frontend/.env.example with all required variables (no values)
19. Review or create backend/.env.example with all required variables (no values)
20. Document which vars are secrets vs public
21. Add notes on Vercel environment scopes (Production/Preview)
22. Add notes on Fly secrets behavior (runtime only)

After implementation:
- Show me deployment-plan.md for review
- Show me env-var-matrix.md for review
- Confirm all prerequisites met

Mark completed tasks with [x]. Wait for approval before Phase 2.
```

### Unit 0: Pre-Brief & Deployment Planning

- [ ] Review S5_ENHANCED_OVERVIEW.md for deployment architecture and success
      criteria
- [ ] Ask learner for: repository URL, default branch name (main/master), app
      naming convention
- [ ] Create `docs/deployment-plan.md` with:
  - [ ] Deployment targets: Vercel (frontend), Fly.io (backend)
  - [ ] Production branch trigger: push to `main` → deployments
  - [ ] Placeholders: `<FRONTEND_URL>`, `<BACKEND_URL>`, `<VERCEL_PROJECT>`,
        `<FLY_APP>`
  - [ ] Repo deploy map: Vercel root=frontend/, Fly root=backend/
- [ ] Add CI/CD flow diagram in Mermaid format showing PR→checks→merge→deploy
- [ ] Add section explaining CI (checks before merge) vs CD (deploy after merge)
- [ ] Document three failure classes: build failures, runtime crashes, missing
      config/secrets
- [ ] Ask learner to confirm plan matches intent before proceeding

### Unit 1: Repository Structure Validation

- [ ] Verify `frontend/package.json` exists
  - [ ] Extract build script (npm run build)
  - [ ] Extract dev script (npm run dev)
  - [ ] Check for engines field specifying Node version
- [ ] Verify `backend/requirements.txt` exists with FastAPI dependencies
- [ ] Check for monorepo shared packages imported by frontend (note for Vercel
      config if found)
- [ ] Identify ports: frontend dev server (default 5173), backend (default 8000)
- [ ] Document in deployment-plan.md: install commands, build commands, dev
      commands, ports
- [ ] Update main `README.md` with "How to run locally" section if missing
- [ ] Verify `.gitignore` includes: `.env`, `.env.*` (except .env.example),
      `dist/`, `__pycache__/`

### Unit 2: Environment Variable Inventory

- [ ] Scan `frontend/src/**/*` for environment variable usage patterns:
      `import.meta.env.VITE_*`
- [ ] Scan `backend/app/**/*` for environment variable usage: `os.environ`,
      `settings.*`
- [ ] Create `docs/env-var-matrix.md` with table:
  - [ ] Columns: Variable Name, Used By (Frontend/Backend), Secret? (Yes/No),
        Build/Runtime, Local .env, GitHub Secrets, Vercel, Fly
  - [ ] Example row:
        `VITE_API_BASE_URL | Frontend | No | Build | .env | - | ✓ | -`
  - [ ] Example row:
        `SUPABASE_SERVICE_ROLE_KEY | Backend | Yes | Runtime | .env | - | - | ✓`
- [ ] Create `frontend/.env.example` listing all VITE\_\* variables (no values,
      just keys with description comments)
- [ ] Create `backend/.env.example` listing all backend variables (no values,
      descriptions only)
- [ ] Document Vercel behavior: env vars scoped by environment
      (Production/Preview), changes require redeploy
- [ ] Document Fly behavior: secrets are runtime env vars, accessible as
      os.environ

---

**PAUSE - Phase 1 Complete**

**Validation**: Review deployment-plan.md and env-var-matrix.md with learner,
confirm repository structure validated

---

# PHASE 2: VERCEL FRONTEND DEPLOYMENT (Units 3-9)

**Goal**: Deploy frontend to Vercel with environment configuration and automated
deployments

**Outcome**: Production frontend URL, Git-triggered deployments, CI workflows
validating PRs

---

## AI PROMPT: Phase 2 Implementation (Units 3-9)

```
Help me implement Phase 2 - Vercel Frontend Deployment (Units 3-9):

**GitHub Actions Fundamentals (Unit 3)**
1. Ensure .github/workflows/ directory exists
2. Create docs/github-actions-notes.md documenting workflow structure, triggers, secrets
3. Explain pull_request vs push triggers with branch targeting
4. Document how to view runs: GitHub → Actions tab → select workflow → view logs
5. Add debugging section: expand failing step, copy logs, check working-directory

**Vercel Account & Import (Units 4-5)**
6. Guide learner: create Vercel account, connect GitHub, authorize repository access
7. Guide learner: start "Import Project" in Vercel, select repository
8. Configure Root Directory: frontend (for monorepo)
9. Verify framework detection (Vite) and build settings
10. Record Vercel project name in deployment-plan.md
11. DO NOT deploy yet (env vars needed first)

**Vercel Environment Variables (Unit 6)**
12. From env-var-matrix.md, filter frontend variables
13. Guide learner: Vercel Project → Settings → Environment Variables
14. Set each VITE_* variable for Production and Preview environments
15. For VITE_API_BASE_URL: set placeholder (update after backend deploy)
16. Document placeholder in deployment-plan.md with TODO
17. Trigger first deployment from Vercel UI
18. Capture production URL, update deployment-plan.md with <FRONTEND_URL>
19. Smoke test: page loads, no blank screen, console errors acceptable if backend not deployed

**Frontend CI Workflows (Unit 7)**
20. Create .github/workflows/frontend-ci-deploy.yml
21. Triggers: push (main/dev), pull_request (main/dev), workflow_dispatch
22. Add path filtering: only run when frontend/ or workflow file changes
23. Add permissions: contents read, pull-requests read
24. Working directory: frontend (no ./ prefix)
25. Steps: checkout, setup-node (v22), lockfile-aware install, type check (tsc --noEmit), lint, build
26. All steps have descriptive names for better debugging
27. Commit workflow on feature branch
28. Open PR to main, verify checks appear and run
29. Fix any failures until checks pass

**Early TypeScript Checks (Unit 8 - Optional Advanced)**
30. Optional enhancement for teams using feature branches
31. Create .github/workflows/typescript-types.yml for early feedback
32. Triggers on feature branches (codex/*, feature/*, chore/*) before PR
33. Provides faster type+build validation loop
34. Does NOT replace frontend-ci-deploy.yml (both coexist)

**Vercel CD: Git Integration (Unit 9)**
35. Verify Vercel Git integration enabled: Project Settings → Git
36. Confirm production branch set to main
37. Merge small doc-only PR to main
38. Verify production deployment triggered automatically in Vercel
39. Confirm <FRONTEND_URL> updated with new deployment

After implementation:
- Show me GitHub Actions workflows for review
- Test PR checks working (open test PR, verify CI runs)
- Confirm Vercel auto-deploy working

Mark completed tasks with [x]. Wait for approval before Phase 3.
```

### Unit 3: GitHub Actions Fundamentals

- [ ] Create `.github/workflows/` directory if not exists
- [ ] Create `docs/github-actions-notes.md` documenting:
  - [ ] Workflow file location: `.github/workflows/*.yml`
  - [ ] Where to view runs: GitHub repository → Actions tab
  - [ ] Core triggers: `pull_request` (CI checks), `push` (CD deploys)
  - [ ] Secrets location: Repository Settings → Secrets and variables → Actions
- [ ] Add debugging guide: open failed run → click job → expand failing step →
      copy logs
- [ ] Explain working-directory for monorepos (frontend/ or backend/)
- [ ] Note: Actions may be disabled in org settings (guide learner to enable if
      needed)

### Unit 4: Vercel Account Setup

- [ ] Guide learner to create Vercel account at vercel.com (use GitHub SSO)
- [ ] Guide learner to connect GitHub account in Vercel dashboard
- [ ] Guide learner to authorize Vercel GitHub app access to repository
- [ ] Verify learner can see repository in "Import Project" list
- [ ] Document Vercel dashboard sections: Projects, Deployments, Settings

### Unit 5: Vercel Project Import

- [ ] Guide learner: click "Import Project" → select repository
- [ ] Configure Root Directory: set to `frontend` (critical for monorepo)
- [ ] Verify Framework Preset: should auto-detect "Vite"
- [ ] Verify Build Command: `npm run build` (or detected default)
- [ ] Verify Output Directory: `dist` (Vite default)
- [ ] Verify Install Command: `npm ci` (recommended) or `npm install`
- [ ] Set Production Branch: `main`
- [ ] Record project name chosen in `deployment-plan.md` as `<VERCEL_PROJECT>`
- [ ] DO NOT click "Deploy" yet (environment variables needed first)

### Unit 6: Vercel Environment Variables & First Deploy

- [ ] From `env-var-matrix.md`, list all frontend variables (VITE\_\* prefix)
- [ ] Guide learner: Vercel Project → Settings → Environment Variables
- [ ] For each frontend variable:
  - [ ] Add variable name (e.g., VITE_SUPABASE_URL)
  - [ ] Add value (from learner's local .env)
  - [ ] Select environments: Production, Preview (or Production only if
        different values needed)
- [ ] For `VITE_API_BASE_URL`: set placeholder value like
      `https://placeholder.fly.dev`
  - [ ] Add prominent TODO in deployment-plan.md to update after backend
        deployment
- [ ] Trigger first deployment: click "Deploy" or push to main branch
- [ ] Monitor deployment logs for errors
- [ ] If build fails: diagnose (missing env var, TypeScript error, dependency
      issue), fix, redeploy
- [ ] If deployment succeeds: capture production URL (format:
      `https://<project>.vercel.app`)
- [ ] Update `deployment-plan.md` with `<FRONTEND_URL>`
- [ ] Smoke test checklist:
  - [ ] Page loads without blank screen
  - [ ] No obvious console errors (API errors acceptable if backend not
        deployed)
  - [ ] Static assets load correctly (images, fonts)

### Unit 7: Frontend CI Workflows

- [ ] Create `.github/workflows/frontend-ci-deploy.yml`:

  ```yaml
  name: CI - Frontend

  on:
    push:
      branches: [main, dev]
      paths:
        - 'frontend/**'
        - '.github/workflows/frontend-ci-deploy.yml'
    pull_request:
      branches: [main, dev]
      paths:
        - 'frontend/**'
        - '.github/workflows/frontend-ci-deploy.yml'
    workflow_dispatch: {}

  permissions:
    contents: read
    pull-requests: read

  jobs:
    checks:
      name: Frontend Checks
      runs-on: ubuntu-latest
      defaults:
        run:
          working-directory: frontend
      steps:
        - name: Checkout
          uses: actions/checkout@v4

        - name: Setup Node
          uses: actions/setup-node@v4
          with:
            node-version: '22'
            cache: 'npm'
            cache-dependency-path: frontend/package-lock.json

        - name: Install deps (lockfile aware)
          run: |
            if [ -f package-lock.json ]; then
              npm ci --no-audit --fund=false;
            else
              echo "No package-lock.json found; running npm install.";
              npm install --no-audit --fund=false;
            fi

        - name: Type check
          run: npx tsc --noEmit

        - name: Lint
          run: npm run lint

        - name: Build
          run: npm run build
  ```

- [ ] Note: Workflow includes path filtering (runs only when frontend/ changes),
      supports both main and dev branches, and allows manual dispatch
- [ ] Commit workflow on a feature branch (not directly to main)
- [ ] Open PR to main branch
- [ ] Verify checks appear in PR status section
- [ ] If checks fail: read logs, fix issues (linting errors, type errors, build
      failures), push fixes
- [ ] Ensure all checks pass before merging

### Unit 8: (Optional - Advanced) Early TypeScript Checks on Feature Branches

- [ ] **Optional Enhancement**: For teams wanting earlier feedback before opening PRs
- [ ] Create `.github/workflows/typescript-types.yml`:
  ```yaml
  name: TypeScript Types & Build
  
  on:
    push:
      branches: [main, dev, "codex/*", "feature/*", "chore/*"]
      paths:
        - "frontend/**"
        - ".github/workflows/typescript-types.yml"
    pull_request:
      branches: [main, dev]
      paths:
        - "frontend/**"
        - ".github/workflows/typescript-types.yml"
    workflow_dispatch:
  
  jobs:
    ts-build:
      runs-on: ubuntu-latest
      defaults:
        run:
          working-directory: frontend
  
      steps:
        - uses: actions/checkout@v4
  
        - name: Set up Node.js
          uses: actions/setup-node@v4
          with:
            node-version: "22"
            cache: npm
            cache-dependency-path: frontend/package-lock.json
  
        - name: Install deps
          run: npm ci
  
        # Run a typecheck if TypeScript is present (no hard fail if project is JS-only)
        - name: Type check (tsc if present)
          run: |
            if [ -x node_modules/.bin/tsc ]; then
              ./node_modules/.bin/tsc --noEmit --pretty false
            else
              echo "No local TypeScript found; skipping explicit tsc check"
            fi
  
        # Ensure the app compiles
        - name: Build (Vite)
          run: npm run build
  ```
- [ ] Note: This workflow runs on feature branches (codex/\*, feature/\*, chore/\*) BEFORE opening PR
- [ ] Provides faster feedback loop than waiting for PR checks
- [ ] Gracefully handles JS-only projects (conditional tsc check)
- [ ] Uses `--pretty false` for clean CI output (no ANSI color codes)
- [ ] Does NOT replace `frontend-ci-deploy.yml` - both workflows can coexist
- [ ] **Pedagogical value**: Teaches multi-tier CI strategy (early checks vs gate checks)
- [ ] **Skip if**: Learner is beginner or not using feature branch workflow

### Unit 9: Vercel CD via Git Integration

- [ ] Verify Vercel Git integration: Project Settings → Git → Connected
      repository shows correct repo
- [ ] Verify Production Branch: should be set to `main`
- [ ] Understand Vercel behavior:
  - [ ] Push to main → triggers Production deployment
  - [ ] Push to other branches → triggers Preview deployment
- [ ] Test automated deployment:
  - [ ] Merge CI workflows PR to main (or push small documentation change)
  - [ ] Open Vercel dashboard → Deployments tab
  - [ ] Verify new deployment triggered automatically
  - [ ] Wait for deployment to complete
  - [ ] Verify `<FRONTEND_URL>` reflects latest changes
- [ ] Document in deployment-plan.md: "Frontend CD handled by Vercel Git
      integration"

---

**PAUSE - Phase 2 Complete**

**Validation**: Frontend deployed to Vercel, CI workflows enforcing quality, Git
integration triggering deployments

---

# PHASE 3: FLY.IO BACKEND DEPLOYMENT (Units 10-15)

**Goal**: Deploy backend to Fly.io with secrets management and automated
deployments

**Outcome**: Production backend URL, health checks passing, CD workflow
deploying on merge

---

## AI PROMPT: Phase 3 Implementation (Units 10-15)

```
Help me implement Phase 3 - Fly.io Backend Deployment (Units 10-15):

**Fly Account & CLI (Units 10-11)**
1. Guide learner: create Fly.io account, complete billing setup
2. Guide learner: install flyctl CLI (OS-specific instructions)
3. Verify installation: fly version
4. Authenticate: fly auth login
5. Verify: fly apps list (should succeed even if empty)

**Fly Configuration (Unit 11)**
6. From backend/, run: fly launch --no-deploy
7. Choose app name, region, decline database (using Supabase)
8. Review generated fly.toml: app name, region, internal_port
9. Ensure backend listens on 0.0.0.0 (not localhost) - critical for Fly
10. Ensure backend port configurable via PORT env var
11. Update backend code if needed to bind correctly
12. Set internal_port in fly.toml to match backend port (8000)
13. Commit fly.toml to repository
14. Record <FLY_APP> name in deployment-plan.md

**Fly Secrets (Unit 12)**
15. From env-var-matrix.md, list all backend secrets
16. Set secrets via CLI: fly secrets set KEY=value
17. Set: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, OPENAI_API_KEY
18. Verify: fly secrets list (shows names only, not values)
19. Update env-var-matrix.md marking backend vars as "Configured on Fly"

**First Fly Deployment (Unit 13)**
20. Deploy: fly deploy --remote-only from backend/
21. Monitor deployment logs
22. Capture backend URL: https://<FLY_APP>.fly.dev
23. Update deployment-plan.md with <BACKEND_URL>
24. Test health check: curl https://<FLY_APP>.fly.dev/health
25. If unreachable: check fly logs, verify 0.0.0.0 binding, verify internal_port
26. Fix issues, redeploy until health check passes

**Backend CI (Unit 14)**
27. Create .github/workflows/ci-backend.yml
28. Trigger: pull_request targeting main
29. Working directory: ./backend
30. Steps: checkout, setup-python, pip install, ruff check, mypy, pytest
31. Commit workflow on feature branch, open PR, verify checks run

**Backend CD (Unit 15)**
32. Generate Fly deploy token: fly tokens create deploy -x 999999h
33. Add token to GitHub Secrets as FLY_API_TOKEN
34. Create .github/workflows/deploy-backend-fly.yml
35. Trigger: push to main branch
36. Use superfly/flyctl-actions/setup-flyctl action
37. Run: flyctl deploy --remote-only from backend/
38. Add concurrency group to prevent simultaneous deploys
39. Merge workflow to main, verify deployment triggered

After implementation:
- Test backend health check endpoint
- Verify fly logs show application running
- Test backend CD by pushing change to main

Mark completed tasks with [x]. Wait for approval before Phase 4.
```

### Unit 9: Fly.io Account & CLI Installation

- [ ] Guide learner to create Fly.io account at fly.io
- [ ] Guide learner to complete billing setup (credit card required)
- [ ] Guide learner to install flyctl CLI:
  - [ ] Windows: `iwr https://fly.io/install.ps1 -useb | iex`
  - [ ] macOS: `brew install flyctl`
  - [ ] Linux: `curl -L https://fly.io/install.sh | sh`
- [ ] Verify installation: `fly version` (should show version number)
- [ ] Authenticate: `fly auth login` (opens browser for login)
- [ ] Verify authentication: `fly apps list` (should succeed, may be empty)
- [ ] Document Fly concepts in deployment-plan.md: Apps (deployable units),
      Machines (VMs), Regions (geographic locations)

### Unit 11: Backend Fly Configuration

- [ ] Navigate to `backend/` directory in terminal
- [ ] Run `fly launch --no-deploy` (interactive setup)
  - [ ] Choose app name (e.g., `demo-course-api`), record as `<FLY_APP>`
  - [ ] Choose region (e.g., `iad` for US East, `lhr` for London)
  - [ ] Decline adding Postgres database (using Supabase instead)
  - [ ] Decline adding Redis
- [ ] Review generated `fly.toml` file:
  - [ ] Verify `app` name matches chosen name
  - [ ] Verify `primary_region` set correctly
  - [ ] Check `internal_port` under `[http_service]` (should match backend port,
        default 8000)
- [ ] Ensure backend listens on correct host/port:
  - [ ] Check `app/main.py` for uvicorn host configuration
  - [ ] MUST be `0.0.0.0` (not `localhost` or `127.0.0.1`) for Fly networking
  - [ ] Port should be configurable via `PORT` env var:
        `port = int(os.environ.get("PORT", 8000))`
- [ ] Update backend code if needed:
  ```python
  # app/main.py
  if __name__ == "__main__":
      import uvicorn
      port = int(os.environ.get("PORT", 8000))
      uvicorn.run("app.main:app", host="0.0.0.0", port=port)
  ```
- [ ] Commit `fly.toml` to git repository
- [ ] Update `deployment-plan.md` with `<FLY_APP>` name and `internal_port`

### Unit 12: Backend Secrets Configuration

- [ ] From `env-var-matrix.md`, list all backend runtime secrets
- [ ] Set secrets using Fly CLI (from backend/ directory):
  ```bash
  fly secrets set SUPABASE_URL="https://xxx.supabase.co"
  fly secrets set SUPABASE_SERVICE_ROLE_KEY="eyJ..."
  fly secrets set JWT_SECRET="your-jwt-secret"
  fly secrets set OPENAI_API_KEY="sk-..."
  ```
- [ ] Verify secrets set: `fly secrets list` (shows names only, values hidden)
- [ ] Optional non-secret config in `fly.toml` under `[env]` section:
  ```toml
  [env]
    LOG_LEVEL = "info"
    ENVIRONMENT = "production"
  ```
- [ ] Update `env-var-matrix.md` marking each backend variable as "Configured on
      Fly (runtime)"
- [ ] Document security note: secrets accessible as env vars, never log secret
      values

### Unit 13: First Fly Deployment & Health Validation

- [ ] Deploy backend: `fly deploy --remote-only` from `backend/` directory
  - [ ] `--remote-only` builds on Fly servers (faster, consistent environment)
- [ ] Monitor deployment progress in terminal output
- [ ] If deployment succeeds:
  - [ ] Capture backend URL: `https://<FLY_APP>.fly.dev`
  - [ ] Update `deployment-plan.md` with `<BACKEND_URL>`
- [ ] Test health check: `curl https://<FLY_APP>.fly.dev/health`
  - [ ] Expected response: `{"status": "ok"}` (or similar JSON)
- [ ] If health check fails, diagnose using:
  - [ ] `fly status` - check app and machine status
  - [ ] `fly logs` - view application logs for errors
  - [ ] Common issues:
    - [ ] App listening on `127.0.0.1` instead of `0.0.0.0` → update host
          binding
    - [ ] `internal_port` mismatch → align fly.toml with app port
    - [ ] Missing secrets → app crashes at boot → check logs, set missing
          secrets
    - [ ] Build failures → check Dockerfile or build configuration
- [ ] Fix issues, redeploy: `fly deploy --remote-only`
- [ ] Repeat until health check passes consistently

### Unit 14: Backend CI Workflows

- [ ] Create `.github/workflows/ci-backend.yml`:

  ```yaml
  name: CI - Backend

  on:
    push:
      branches: [main, dev]
      paths:
        - 'backend/**'
        - '.github/workflows/ci-backend.yml'
    pull_request:
      branches: [main, dev]
      paths:
        - 'backend/**'
        - '.github/workflows/ci-backend.yml'
    workflow_dispatch: {}

  permissions:
    contents: read
    pull-requests: read

  jobs:
    backend-checks:
      name: Backend Checks
      runs-on: ubuntu-latest
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      defaults:
        run:
          working-directory: backend
      steps:
        - name: Checkout
          uses: actions/checkout@v4

        - name: Setup Python
          uses: actions/setup-python@v5
          with:
            python-version: '3.12'
            cache: 'pip'
            cache-dependency-path: backend/requirements.txt

        - name: Upgrade pip
          run: python -m pip install --upgrade pip

        - name: Install dependencies
          run: pip install -r requirements.txt

        - name: Install ruff
          run: pip install ruff

        - name: Lint with ruff
          run: ruff check app/

        - name: Type check with mypy
          run: mypy app/

        - name: Run tests
          run: pytest -q
  ```

- [ ] Note: Workflow includes path filtering (runs only when backend/ changes),
      supports both main and dev branches, and allows manual dispatch
- [ ] Note: Environment variables required for tests are provided via GitHub
      Secrets (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY)
- [ ] Commit workflow on feature branch
- [ ] Open PR to main branch
- [ ] Verify backend CI check appears in PR and runs
- [ ] Fix any failures (linting errors, type errors, test failures)
- [ ] Ensure checks pass before merging

### Unit 15: Backend CD Workflow

- [ ] Generate Fly deploy token from `backend/` directory:
  ```bash
  fly tokens create deploy -x 999999h
  ```
  - [ ] Copy full token output (starts with `FlyV1`)
- [ ] Add token to GitHub repository secrets:
  - [ ] GitHub → Settings → Secrets and variables → Actions → New repository
        secret
  - [ ] Name: `FLY_API_TOKEN`
  - [ ] Value: paste deploy token
- [ ] Create `.github/workflows/deploy-backend-fly.yml`:
  ```yaml
  name: Deploy Backend to Fly.io
  on:
    push:
      branches: [main]
  concurrency:
    group: deploy-backend
    cancel-in-progress: false
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: superfly/flyctl-actions/setup-flyctl@master
        - run: flyctl deploy --remote-only
          working-directory: ./backend
          env:
            FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
  ```
- [ ] Commit deploy workflow to feature branch
- [ ] Merge to main branch
- [ ] Verify workflow runs in GitHub Actions tab
- [ ] Check Fly dashboard for new deployment
- [ ] Test backend health check still works after automated deployment

---

**PAUSE - Phase 3 Complete**

**Validation**: Backend deployed to Fly.io, health checks passing, CI/CD
workflows operational

---

# PHASE 4: INTEGRATION & OPERATIONS (Units 16-22)

**Goal**: Connect frontend to backend, implement branch protection, create
operational runbooks

**Outcome**: End-to-end production system with monitoring, troubleshooting
guides, performance optimization

---

## AI PROMPT: Phase 4 Implementation (Units 16-22)

```
Help me implement Phase 4 - Integration & Operations (Units 16-22):

**Frontend-Backend Integration (Unit 16)**
1. Update VITE_API_BASE_URL in Vercel to real <BACKEND_URL>
2. Trigger Vercel redeploy (env var changes require new build)
3. Update backend CORS to allow <FRONTEND_URL> origin
4. Set CORS_ORIGIN via Fly secret, update backend code to use it
5. Redeploy backend to Fly
6. Test end-to-end: open frontend, trigger API call, verify success
7. Check browser Network tab: verify API calls go to correct backend
8. Check fly logs: verify requests arriving from frontend

**Branch Protection (Unit 17)**
9. Enable branch protection on main: Settings → Branches → Add rule
10. Require status checks: ci-frontend, ci-backend, ci-typescript
11. Require branches be up to date before merging
12. Create .github/pull_request_template.md with checklist

**Troubleshooting Playbook (Unit 18)**
13. Create docs/deployment-troubleshooting.md
14. Document GitHub Actions failures: where to find logs, common causes, fixes
15. Document Vercel failures: build errors, env var issues, CORS problems
16. Document Fly failures: port mismatches, secret issues, crash loops
17. Document rollback procedures for Vercel and Fly

**Monitoring Setup (Unit 19)**
18. Document fly logs usage for backend monitoring
19. Document Vercel deployment logs access
20. Implement structured logging in backend if not present
21. Optional: Set up external uptime monitoring (UptimeRobot, etc.)

**Performance Optimization (Unit 20)**
22. Optimize frontend bundle: configure code splitting in vite.config.ts
23. Optimize Fly config: set min_machines_running to avoid cold starts
24. Add caching headers to static backend responses
25. Test performance: measure page load times, API response times

**Documentation (Unit 21)**
26. Update main README.md with deployment section
27. Create docs/architecture.md with system diagram
28. Create docs/runbook.md with operational procedures
29. Document environment variables completely

**Final Validation (Unit 22)**
30. Run production readiness checklist (all items from S5U22)
31. Test end-to-end user flows in production
32. Verify all CI/CD workflows functioning
33. Test rollback procedures
34. Performance validation: < 3s page load, API < 500ms
35. Security validation: no secrets in git, CORS working, RLS enforced

After implementation:
- Walk me through complete end-to-end test
- Review all documentation for completeness
- Confirm production readiness checklist 100% complete

Mark completed tasks with [x]. PHASE 4 and SESSION 5 complete!
```

### Unit 16: Frontend-Backend Integration

- [ ] Update frontend environment variable in Vercel:
  - [ ] Vercel Project → Settings → Environment Variables
  - [ ] Find `VITE_API_BASE_URL`
  - [ ] Update value from placeholder to `<BACKEND_URL>` (e.g.,
        `https://demo-course-api.fly.dev`)
  - [ ] Save changes
- [ ] Trigger Vercel redeploy (environment variable changes require new build)
- [ ] Update backend CORS configuration:
  - [ ] Identify CORS middleware in `app/main.py`
  - [ ] Update `allow_origins` to include `<FRONTEND_URL>`
  - [ ] Or set via environment variable for flexibility:
    ```python
    allowed_origins = os.environ.get("CORS_ORIGIN", "http://localhost:5173").split(",")
    app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, ...)
    ```
- [ ] Set CORS origin via Fly secret:
  ```bash
  fly secrets set CORS_ORIGIN="https://demo-course-frontend.vercel.app"
  ```
- [ ] Redeploy backend: `fly deploy --remote-only`
- [ ] End-to-end smoke test:
  - [ ] Open `<FRONTEND_URL>` in browser
  - [ ] Open DevTools → Network tab
  - [ ] Trigger action that calls backend API (login, load data, etc.)
  - [ ] Verify: Request sent to correct `<BACKEND_URL>`
  - [ ] Verify: Response status 200 (or expected code)
  - [ ] Verify: No CORS errors in console
  - [ ] Verify: Data displays correctly in UI
- [ ] Check backend logs: `fly logs` → verify requests from frontend origin

### Unit 17: Branch Protection & Merge Requirements

- [ ] Enable branch protection on `main`:
  - [ ] GitHub → Settings → Branches → Add branch protection rule
  - [ ] Branch name pattern: `main`
  - [ ] Enable: "Require status checks to pass before merging"
  - [ ] Select required checks: `CI - Frontend`, `CI - Backend`,
        `CI - TypeScript`
  - [ ] Enable: "Require branches to be up to date before merging"
  - [ ] Optional: "Require pull request reviews before merging" (if team-based)
  - [ ] Enable: "Include administrators" (enforce rules for everyone)
- [ ] Create `.github/pull_request_template.md`:

  ```markdown
  ## What does this PR do?

  Brief description of changes.

  ## Checklist

  - [ ] CI checks are green
  - [ ] Tested locally
  - [ ] Environment variable changes documented (if any)
  - [ ] Breaking changes documented in PR description

  ## Testing

  Describe how you tested these changes.
  ```

- [ ] Test branch protection: open PR with failing check, verify merge blocked

### Unit 18: Troubleshooting Playbook

- [ ] Create `docs/deployment-troubleshooting.md` with sections:
  - [ ] **GitHub Actions Failures**:
    - [ ] Where to find logs: Actions tab → select run → click job → expand step
    - [ ] Common causes: missing secrets, wrong working directory, dependency
          conflicts, Node/Python version mismatch
    - [ ] How to rerun: Click "Re-run jobs" button
  - [ ] **Vercel Failures**:
    - [ ] Where to find logs: Deployments → select deployment → Build Logs
    - [ ] Common causes: missing env vars, wrong root directory, build command
          error, TypeScript errors
    - [ ] Reminder: env var changes require redeploy
  - [ ] **Fly Failures**:
    - [ ] Commands: `fly status`, `fly logs`, `fly deploy`
    - [ ] Common causes: port mismatch (localhost vs 0.0.0.0), internal_port
          misalignment, missing secrets, Dockerfile errors
    - [ ] Health check debugging: `curl <BACKEND_URL>/health`
  - [ ] **Rollback Procedures**:
    - [ ] Vercel: Deployments → find last good deployment → "..." → Promote to
          Production
    - [ ] Fly: `fly releases` → `fly releases rollback <version>`

### Unit 19: Monitoring & Observability

- [ ] Document log access in `docs/deployment-troubleshooting.md`:
  - [ ] Fly logs: `fly logs` (live tail), `fly logs --app <app>` (specific app)
  - [ ] Vercel logs: Dashboard → Deployments → select deployment → Runtime Logs
- [ ] Verify backend has structured logging (JSON format with timestamps,
      request IDs)
- [ ] Optional: Set up external uptime monitoring:
  - [ ] Services: UptimeRobot, Pingdom, Better Uptime
  - [ ] Monitor: `<FRONTEND_URL>` and `<BACKEND_URL>/health`
  - [ ] Configure alerts: email/Slack on downtime
- [ ] Add monitoring links to `deployment-plan.md`

### Unit 20: Performance Optimization

- [ ] Frontend bundle optimization in `frontend/vite.config.ts`:
  ```typescript
  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          },
        },
      },
    },
  });
  ```
- [ ] Backend cold start mitigation in `fly.toml`:
  ```toml
  [http_service]
    auto_stop_machines = false
    min_machines_running = 1
  ```
- [ ] Add caching headers for static responses in backend
- [ ] Performance testing:
  - [ ] Measure page load time (target: < 3 seconds)
  - [ ] Measure API response times (target: < 500ms for queries)
  - [ ] Test with slow network throttling in DevTools

### Unit 21: Documentation & Knowledge Transfer

- [ ] Update main `README.md`:
  - [ ] Add "Deployment" section with platform links
  - [ ] Document: Frontend on Vercel, Backend on Fly.io
  - [ ] Document: Deployments trigger on merge to `main`
  - [ ] Link to `docs/deployment-plan.md` and `docs/env-var-matrix.md`
- [ ] Create `docs/architecture.md`:
  - [ ] System architecture diagram (Mermaid)
  - [ ] Data flow: User → Vercel → Fly → Supabase
  - [ ] External dependencies: Supabase, OpenAI
- [ ] Create `docs/runbook.md`:
  - [ ] Common operational tasks
  - [ ] Incident response procedures
  - [ ] Rollback instructions
  - [ ] Secret rotation procedures
- [ ] Verify all environment variables documented in `env-var-matrix.md`

### Unit 22: Final Validation & Production Readiness

- [ ] **Infrastructure Checklist**:
  - [ ] Frontend deployed to Vercel: ✅
  - [ ] Backend deployed to Fly.io: ✅
  - [ ] URLs documented and accessible: ✅
  - [ ] HTTPS enabled on both services: ✅
- [ ] **CI/CD Checklist**:
  - [ ] All CI workflows passing: ✅
  - [ ] CD workflows deploy successfully: ✅
  - [ ] Branch protection enabled: ✅
  - [ ] PR template in place: ✅
- [ ] **Security Checklist**:
  - [ ] No secrets in git: ✅
  - [ ] CORS configured correctly: ✅
  - [ ] Auth endpoints protected: ✅
  - [ ] RLS enabled in Supabase: ✅
- [ ] **Monitoring Checklist**:
  - [ ] Health checks responding: ✅
  - [ ] Logs accessible: ✅
  - [ ] Error tracking configured (optional): ✅
- [ ] **Documentation Checklist**:
  - [ ] README updated: ✅
  - [ ] Env var matrix complete: ✅
  - [ ] Troubleshooting guide created: ✅
  - [ ] Architecture documented: ✅
- [ ] **End-to-End Testing**:
  - [ ] Open production frontend URL
  - [ ] Sign up/login flow works
  - [ ] AI agent interaction works
  - [ ] Data persists correctly
  - [ ] Test on mobile device
  - [ ] No critical console errors
  - [ ] Backend logs show clean operation
- [ ] **Performance Validation**:
  - [ ] Page load < 3 seconds: ✅
  - [ ] API responses < 500ms: ✅
  - [ ] No significant console warnings: ✅
- [ ] **Rollback Testing**:
  - [ ] Test Vercel rollback procedure
  - [ ] Test Fly rollback procedure
  - [ ] Document rollback time (target: < 5 minutes)

---

**CONGRATULATIONS - SESSION 5 COMPLETE!**

**Deliverables Achieved**:

- ✅ Frontend deployed to Vercel with automated deployments
- ✅ Backend deployed to Fly.io with secrets management
- ✅ CI/CD pipelines enforcing quality gates
- ✅ Branch protection preventing broken code
- ✅ End-to-end integration working in production
- ✅ Comprehensive operational documentation
- ✅ Monitoring and troubleshooting procedures
- ✅ Performance optimized and validated

**Next Steps**:

- Monitor production metrics for first week
- Iterate on performance optimizations
- Expand monitoring coverage (alerts, dashboards)
- Consider custom domain setup for frontend
- Plan Session 6 features and enhancements

---

## Appendix: Quick Reference

### Common Commands

**Vercel:**

- View deployments: Vercel Dashboard → Deployments
- View logs: Select deployment → Logs tab
- Redeploy: Deployments → "..." → Redeploy

**Fly.io:**

- Deploy: `fly deploy --remote-only`
- View logs: `fly logs`
- Check status: `fly status`
- List secrets: `fly secrets list`
- Set secret: `fly secrets set KEY=value`
- Rollback: `fly releases rollback <version>`

**GitHub Actions:**

- View runs: Repository → Actions tab
- Rerun workflow: Select run → Re-run jobs
- View logs: Select run → click job → expand step

### Platform URLs

- Vercel Dashboard: https://vercel.com/dashboard
- Fly.io Dashboard: https://fly.io/dashboard
- GitHub Actions: https://github.com/<owner>/<repo>/actions

### Support Resources

- Vercel Docs: https://vercel.com/docs
- Fly.io Docs: https://fly.io/docs
- GitHub Actions Docs: https://docs.github.com/en/actions
- Vercel Status: https://www.vercel-status.com
- Fly Status: https://status.flyio.net

---

**End of Beast Mode Deployment PRD v1.0**
