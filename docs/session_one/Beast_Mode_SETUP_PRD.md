# Application Bootstrap & Development Environment Setup - Product Requirements Document v1.0

## Overview

Comprehensive documentation for **Session 1: Application Bootstrap & Development Environment Setup** in the code45 platform. This session establishes the foundation by creating a clean project structure, bootstrapping React/Vite frontend and FastAPI backend, and verifying end-to-end communication through a health check endpoint.

**Key Outcome**: A working full-stack application skeleton with dual development servers, proper folder structure, and verified HTTP communication between frontend and backend - ready for Session 2 authentication implementation.

## Business Context

- **Problem**: Starting a full-stack project requires coordinating multiple technologies, tools, and configurations. Manual setup is error-prone and inconsistent across developers.
- **Solution**: AI-guided bootstrap workflow that provisions frontend (React+Vite+TypeScript+Tailwind), backend (Python+FastAPI+Uvicorn), and essential project infrastructure in a standardized, repeatable manner.
- **Value**: Reduces setup time from hours to minutes, ensures best practices from day one, creates consistent development environment across learners, and establishes clean foundation for authentication, testing, and production features.

## Implementation Scope

This PRD documents the complete bootstrap architecture including:

1. **Project Structure**: Root folders (frontend/, backend/, docs/), repository hygiene files
2. **Frontend Stack**: React 18+ with Vite, TypeScript, Tailwind CSS, React Router, React Query, Axios
3. **Backend Stack**: Python 3.12+, FastAPI, Uvicorn, isolated virtual environment (Conda/venv)
4. **Development Workflow**: Dual terminals, hot reload, CORS configuration, environment variables
5. **Verification**: Health check endpoint, frontend-backend ping test, browser DevTools validation

## AI Coding Agent (GitHub Copilot or similar) Instructions

**IMPORTANT**: In this PRD document, prompts aimed at the AI coding assistant to start or continue the implementation of this PRD end-to-end (in conjunction with the learner and via the GitHub Copilot Chat) will be marked with `## AI PROMPT` headings.

- **The learner** pastes the prompt into the chat to initiate the start or the continuation of the code implementation led by the AI coding assistant.
- **AI Coding Assistant** reads and executes on the prompt. The AI Coding Assistant should execute the tasks specified under each unit and - upon completion - mark off each task with [x] = completed or [~] = in progress depending on status. Sections (---) marked with "PAUSE" are milestone points where the AI Coding Assistant should check in with the learner, ensure all checklists in this PRD reflect the latest progress, and await the next learner instructions OR - after approval - move to reading the next `## AI PROMPT` and start execution.

## Prerequisites: Pre-Session Setup (Learner Completes Manually)

**⚠️ CRITICAL**: These steps MUST be completed by the learner BEFORE starting Unit 1 with the AI assistant. The AI will verify these prerequisites before proceeding.

### Environment & Tools Verification

- [ ] **Node.js 18+** installed: `node --version` prints 18.x or higher
- [ ] **Python 3.12+** installed: `python --version` prints 3.12.x
- [ ] **Git** installed and configured: `git --version` and `git config --global user.name`
- [ ] **Visual Studio Code** installed with latest version
- [ ] **GitHub Account** created and accessible
- [ ] **Conda** (recommended) OR **venv** available for Python environment isolation

### GitHub Repository Setup

- [ ] Create new **private** GitHub repository named `my-ideas`
- [ ] Clone repository locally: `git clone https://github.com/<your-username>/my-ideas.git`
- [ ] Open cloned repository in VS Code: `code my-ideas`
- [ ] **Trust the workspace** in VS Code (dismiss Restricted Mode banner)

### VS Code Extensions Installed (User Scope/Global)

Required extensions (install via Extensions Marketplace):

- [ ] **Tailwind CSS IntelliSense** (by Tailwind Labs)
- [ ] **ESLint** (by Microsoft)
- [ ] **Prettier – Code formatter** (by Prettier)
- [ ] **Python** (by Microsoft)
- [ ] **Pylance** (by Microsoft)
- [ ] **GitHub Copilot** (by GitHub)
- [ ] **GitHub Copilot Chat** (by GitHub)

### GitHub Copilot Setup

- [ ] Sign in to GitHub via VS Code Accounts menu
- [ ] Verify **GitHub Copilot** shows "Enabled" in status bar
- [ ] Open **GitHub Copilot Chat** panel (View → Appearance → Panel → Chat)
- [ ] Test Copilot: type a comment in any file and verify suggestions appear

### Workspace Setup

- [ ] Open **two terminals** in VS Code:
  - [ ] Terminal 1: Rename to **FE** (for frontend)
  - [ ] Terminal 2: Rename to **BE** (for backend)
- [ ] Verify both terminals are at repo root (my-ideas/)

---

## AI PROMPT:

**Prerequisites Verification Prompt** - The learner should paste this into GitHub Copilot Chat to begin:

```
I am starting Session 1 of the code45 course (Application Bootstrap). Before we begin implementation, please verify I have completed all prerequisites by asking me to confirm each item in the "Prerequisites: Pre-Session Setup" section of the Beast_Mode_SETUP_PRD.md file.

For each prerequisite category (Environment & Tools, GitHub Repository, VS Code Extensions, GitHub Copilot, Workspace Setup), ask me to confirm completion. If any items are not complete, pause and guide me through completing them before proceeding to Unit 1.

Once all prerequisites are confirmed, provide a summary and ask for approval to proceed to Unit 1: Project Structure & Repository Hygiene.
```

---

PAUSE

## Architecture Overview

### Technology Stack

**Frontend:**

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast HMR, modern ES modules)
- **Styling**: Tailwind CSS v3+ with PostCSS
- **Routing**: React Router v6
- **State Management**: Redux Toolkit (Session 2+), React Query for server state
- **HTTP Client**: Axios with configured instance
- **UI Components**: shadcn/ui (Session 3+), Lucide icons (Session 3+)

**Backend:**

- **Framework**: FastAPI (modern Python async framework)
- **Server**: Uvicorn with auto-reload
- **Environment**: Python 3.12+ in isolated Conda/venv
- **Database**: Supabase (Session 2+)
- **AI SDK**: OpenAI Agent SDK (Session 4+)
- **Validation**: Pydantic v2

**Development:**

- **Version Control**: Git + GitHub
- **Editor**: VS Code with Copilot
- **Terminals**: Dual terminal setup (FE + BE)
- **Hot Reload**: Both frontend (Vite) and backend (Uvicorn --reload)

### Project Structure (Final State After Session 1)

```
my-ideas/
├── .gitignore                 # Ignore patterns for Node, Python, OS artifacts
├── .editorconfig              # UTF-8, LF, consistent formatting (optional)
├── .gitattributes             # Git line ending config (optional)
├── README.md                  # Project overview and quickstart
├── AGENTS.md                  # AI collaboration guidelines
│
├── frontend/                  # React + Vite + TypeScript + Tailwind
│   ├── .env.local             # Local env vars (not committed)
│   ├── .env.example           # Env var template (committed)
│   ├── package.json           # Dependencies: react, vite, tailwind, router, query, axios
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vite.config.ts         # Vite config with @ alias
│   ├── tailwind.config.ts     # Tailwind with content paths
│   ├── postcss.config.cjs     # PostCSS for Tailwind
│   ├── index.html             # Entry HTML
│   └── src/
│       ├── main.tsx           # App entry with providers
│       ├── App.tsx            # Root component
│       ├── index.css          # Tailwind directives
│       ├── vite-env.d.ts      # Vite type definitions
│       ├── api/               # API client and service modules
│       │   └── apiClient.ts   # Axios instance (baseURL, timeout, headers)
│       ├── pages/             # Route components
│       │   └── Home.tsx       # Landing page (Session 1)
│       └── routes/            # Routing configuration (Session 2+)
│
├── backend/                   # FastAPI + Python
│   ├── .env                   # Local env vars (not committed)
│   ├── .env.example           # Env var template (committed)
│   ├── requirements.txt       # Python dependencies
│   └── app/
│       ├── __init__.py        # Package marker
│       └── main.py            # FastAPI app with CORS, middleware, /health endpoint
│
└── docs/                      # Documentation and session artifacts
    ├── journal/               # Daily reflections (optional)
    │   └── D1.md
    └── session_one/           # Session 1 unit checklists
        ├── S1U1_checklist.author.md
        ├── S1.._checklist.author.md
        └── Beast_Mode_SETUP_PRD.md
```

### Communication Flow (Session 1)

```
┌─────────────────┐         ┌─────────────────┐
│   Browser       │         │   Backend       │
│   localhost:5173│         │   localhost:8000│
└────────┬────────┘         └────────┬────────┘
         │                           │
         │  1. User loads page       │
         │                           │
         │  2. Click "Ping API"      │
         │                           │
         │  3. GET /health           │
         │──────────────────────────>│
         │     (axios request)       │
         │                           │
         │                           │  4. Process request
         │                           │  5. Add x-request-id
         │                           │  6. Add x-duration-ms
         │                           │
         │  7. Response              │
         │     { status: "ok" }      │
         │<──────────────────────────│
         │                           │
         │  8. Display result        │
         │                           │
         ▼                           ▼

CORS: Backend allows http://localhost:5173 and http://127.0.0.1:5173
Middleware: Adds request ID and timing to all responses
```

---

## Phase 1: Project Structure & Repository Hygiene

### Unit 1: Project Structure & Essential Files

**Goal**: Create baseline folder structure, initialize Git hygiene files, and prepare workspace for development.

**Prerequisites**:

- Pre-session setup completed (verified by AI)
- Repository cloned and opened in VS Code
- Two terminals ready (FE and BE)

**Deliverables**:

**Folder Structure**:

- [ ] Create `frontend/` folder at repo root
- [ ] Create `backend/` folder at repo root
- [ ] Create `docs/` folder at repo root
- [ ] Create `docs/session_one/` subfolder
- [ ] Create `docs/journal/` subfolder (optional)

**Repository Hygiene Files**:

- [ ] Create `.gitignore` at repo root with patterns for Node, Python, environment files, and OS artifacts
- [ ] Create `README.md` at repo root with project description, tech stack summary, and basic quick start instructions
- [ ] (Optional) Create `.editorconfig` for consistent code formatting (UTF-8, LF, indentation)
- [ ] (Optional) Create `.gitattributes` for Git line ending configuration

**AGENTS.md - AI Collaboration Guidelines**:

- [ ] Create `AGENTS.md` at repo root documenting AI-first workflow, prompt conventions, safety rules, and acceptance criteria

**Verification**:

- [ ] Run `git status` to verify only intended files appear
- [ ] Verify no `.env` files or secrets are staged
- [ ] Confirm all folders (frontend/, backend/, docs/) exist
- [ ] Review README.md and AGENTS.md content

---

## AI PROMPT:

**Start Unit 1** - Paste this into GitHub Copilot Chat:

```
I'm ready to start Unit 1 from Beast_Mode_SETUP_PRD.md. Please implement:

1. Create folder structure: frontend/, backend/, docs/ with subfolders (docs/session_one/, docs/journal/)
2. Create .gitignore with Node, Python, environment, and OS patterns
3. Create README.md with project description, tech stack, and quick start
4. Create AGENTS.md with AI collaboration guidelines
5. Optionally create .editorconfig and .gitattributes

After creation:
- Show me a tree view of the created structure
- Show me .gitignore and AGENTS.md contents for review
- Run git status and confirm what's ready to stage

Mark all completed tasks with [x] in Beast_Mode_SETUP_PRD.md. Wait for my approval before proceeding.
```

---

PAUSE

## Phase 2: Frontend Bootstrap

### Unit 2: React + Vite + TypeScript + Tailwind

**Goal**: Scaffold a modern React application with Vite, TypeScript, Tailwind CSS, and essential libraries.

**Prerequisites**:

- Unit 1 completed (folder structure exists)
- FE terminal open at repo root

**Deliverables**:

**Scaffold React + Vite + TypeScript**:

- [ ] Create Vite project in `frontend/` using React + TypeScript template
- [ ] Install base dependencies

**Tailwind CSS Setup**:

- [ ] Install Tailwind CSS, PostCSS, and Autoprefixer as dev dependencies
- [ ] Generate Tailwind configuration with content paths for HTML and src files
- [ ] Configure `src/index.css` with Tailwind directives (@tailwind base/components/utilities)

**Core Libraries**:

- [ ] Install React Router v6 for routing
- [ ] Install React Query (@tanstack/react-query) for server state management
- [ ] Install Axios for HTTP client

**Configure Path Alias**:

- [ ] Update `vite.config.ts` to add `@` alias resolving to `./src`
- [ ] Update `tsconfig.json` to recognize `@/*` path mapping

**Setup Application Structure**:

- [ ] Update `src/main.tsx` to wrap App with QueryClientProvider
- [ ] Create `src/api/` folder
- [ ] Create `src/api/apiClient.ts` with Axios instance (baseURL from env, timeout, headers)
- [ ] Create `src/pages/` folder
- [ ] Create `src/pages/Home.tsx` with centered landing page (title, description, CTA buttons using Tailwind)
- [ ] Update `src/App.tsx` to render Home component

**Environment Variables**:

- [ ] Create `frontend/.env.local` with VITE_API_BASE_URL pointing to backend
- [ ] Create `frontend/.env.example` template with VITE_API_BASE_URL and Supabase placeholders

**Verification**:

- [ ] Start dev server and confirm runs on http://localhost:5173
- [ ] Verify Home page renders with Tailwind styling
- [ ] Run TypeScript build check (npm run build)
- [ ] Confirm git status shows only intended frontend files

---

## AI PROMPT:

**Start Unit 2** - Paste this into GitHub Copilot Chat:

```
I'm ready for Unit 2 from Beast_Mode_SETUP_PRD.md. Please implement:

1. Scaffold React app with Vite using react-ts template in frontend/
2. Install and configure Tailwind CSS with proper content paths
3. Install core libraries: React Router, React Query, Axios
4. Configure @ path alias in vite.config.ts and tsconfig.json
5. Set up QueryClientProvider in main.tsx
6. Create src/api/apiClient.ts with Axios instance
7. Create src/pages/Home.tsx with Tailwind-styled landing page
8. Update App.tsx to render Home
9. Create .env.local and .env.example with API base URL

After implementation:
- Show me vite.config.ts, tailwind.config.ts, and apiClient.ts
- Guide me to start dev server
- Ask me to confirm Home page loads with styling

Mark completed tasks with [x] in Beast_Mode_SETUP_PRD.md. Wait for approval.
```

---

PAUSE

## Phase 3: Backend Bootstrap

### Unit 3: Python + FastAPI + Uvicorn

**Goal**: Provision an isolated Python 3.12 environment, install FastAPI + Uvicorn, and scaffold a minimal backend with /health endpoint, CORS, and middleware.

**Prerequisites**:

- Unit 2 completed (frontend running)
- BE terminal open at repo root
- Python 3.12+ and Conda (or venv) available

**Deliverables**:

**Python Environment Setup**:

- [ ] Create isolated Python 3.12 environment using Conda (recommended) or venv
- [ ] Activate environment and verify Python version is 3.12.x
- [ ] Configure VS Code to use the correct Python interpreter

**Install Backend Dependencies**:

- [ ] Upgrade pip to latest version
- [ ] Install FastAPI and Uvicorn with standard extras
- [ ] Install code quality tools: Black and isort

**Create Backend Application**:

- [ ] Create `backend/app/__init__.py` as Python package marker
- [ ] Create `backend/app/main.py` with:
  - FastAPI app instance (title, version, description)
  - CORS middleware allowing frontend origins (localhost:5173, 127.0.0.1:5173, alternative ports)
  - HTTP middleware to add request ID (UUID) and duration tracking (milliseconds) to response headers
  - GET /health endpoint returning status, service name, and version
  - GET / root endpoint providing welcome message and links to /docs and /health

**Environment Variables**:

- [ ] Create `backend/.env` (not committed) with ENV=development
- [ ] Create `backend/.env.example` (committed) with ENV placeholder and future Supabase/OpenAI placeholders

**Generate Requirements**:

- [ ] Run pip freeze to generate `requirements.txt` with installed dependencies

**Code Formatting** (Optional):

- [ ] Run Black formatter on backend code
- [ ] Run isort on backend imports

**Verification**:

- [ ] Start backend server from repo root
- [ ] Verify root endpoint (/) shows welcome message
- [ ] Verify /health endpoint returns status "ok"
- [ ] Verify /docs loads FastAPI auto-generated documentation
- [ ] Check response headers include x-request-id and x-duration-ms
- [ ] Confirm git status shows only intended backend files

---

## AI PROMPT:

**Start Unit 3** - Paste this into GitHub Copilot Chat:

```
I'm ready for Unit 3 from Beast_Mode_SETUP_PRD.md. Please implement:

1. Guide me to create Python 3.12 environment (Conda preferred, venv fallback)
2. Install FastAPI, Uvicorn with standard extras, Black, and isort
3. Create backend/app/__init__.py
4. Create backend/app/main.py with:
   - FastAPI app with title, version, description
   - CORS middleware for frontend origins
   - HTTP middleware adding x-request-id and x-duration-ms headers
   - GET /health endpoint (status, service, version)
   - GET / root endpoint (welcome, links)
5. Create backend/.env and backend/.env.example
6. Generate requirements.txt

After implementation:
- Show me backend/app/main.py
- Guide me to activate environment and start server
- Ask me to verify /health and /docs endpoints
- Ask me to check response headers in DevTools

Mark completed tasks with [x] in Beast_Mode_SETUP_PRD.md. Wait for approval.
```

---

PAUSE

## Phase 4: End-to-End Verification

### Unit 4: Frontend-Backend Integration Test

**Goal**: Verify end-to-end communication between frontend and backend through a simple "Ping API" button that calls /health.

**Prerequisites**:

- Unit 2 completed (frontend running)
- Unit 3 completed (backend running)
- Both dev servers running in separate terminals

**Deliverables**:

**Update Home Page with API Test**:

- [ ] Import useState from React and apiClient from @/api/apiClient in Home.tsx
- [ ] Add state for API status message and loading indicator
- [ ] Create pingAPI async function that:
  - Sets loading state
  - Calls GET /health via apiClient
  - Updates status with success or error message
  - Handles exceptions gracefully
- [ ] Add "System Status" section to Home page with:
  - "Ping API" button with loading/disabled states
  - Conditional status message with success (green) or error (red) styling
- [ ] Keep existing CTA buttons (Get Started, Learn More)

**Verification Steps**:

- [ ] Ensure both dev servers running (frontend on 5173, backend on 8000)
- [ ] Click "Ping API" button and verify success message appears
- [ ] Open Browser DevTools Network tab
- [ ] Click "Ping API" again and verify:
  - Request to /health appears
  - Response status is 200
  - Response body contains status "ok"
  - Response headers include x-request-id (UUID) and x-duration-ms (number)
  - CORS headers present (access-control-allow-origin)

**Error Handling Test**:

- [ ] Stop backend server
- [ ] Click "Ping API" and verify error message displays
- [ ] Check browser console shows error details
- [ ] Restart backend server
- [ ] Click "Ping API" and verify success message returns

**Final Checklist**:

- [ ] Frontend and backend servers running concurrently
- [ ] Frontend successfully calls backend /health endpoint
- [ ] CORS configuration working (no browser errors)
- [ ] Request ID and timing middleware functional
- [ ] Error handling displays appropriate user feedback
- [ ] No console errors in browser or terminal

---

## AI PROMPT:

**Start Unit 4** - Paste this into GitHub Copilot Chat:

```
I'm ready for Unit 4 from Beast_Mode_SETUP_PRD.md. Please implement:

1. Update src/pages/Home.tsx to add:
   - State for apiStatus and loading
   - pingAPI async function calling GET /health via apiClient
   - "System Status" section with Ping API button
   - Conditional status message (green for success, red for error)
   - Loading states and error handling

After implementation:
- Show me updated Home.tsx
- Guide me through verification in browser
- Ask me to confirm:
  * Ping API button works and shows success
  * Network tab shows /health request with proper headers
  * Error handling works when backend is stopped

Mark completed tasks with [x] in Beast_Mode_SETUP_PRD.md. Wait for approval.
```

---

PAUSE

## Phase 5: Documentation & Completion

### Unit 5: Documentation Update & Initial Commit

**Goal**: Update project documentation to reflect current setup and make the first meaningful commit.

**Prerequisites**:

- Units 1-4 completed
- Both servers verified working
- All files created and tested

**Deliverables**:

**Update README.md**:

- [ ] Expand README.md with:
  - Comprehensive project description
  - Detailed tech stack (Frontend, Backend, Development sections)
  - Prerequisites list
  - Complete quick start instructions (clone, frontend setup, backend setup with Conda and venv options)
  - Verification steps
  - Project structure tree
  - API documentation links (/docs, /redoc)
  - Development workflow overview
  - Session progress tracker (Session 1 checked, Sessions 2-5 unchecked)
  - Contributing guidelines reference
  - License

**Create Journal Entry** (Optional):

- [ ] Create `docs/journal/D1.md` documenting:
  - Date
  - Completed tasks summary
  - Key learnings
  - Challenges encountered
  - Next steps for Session 2

**Git Workflow**:

- [ ] Run git status to review all changes
- [ ] Verify only intended files are modified/created
- [ ] Stage all files with git add
- [ ] Verify .env files are NOT staged (check .gitignore working)
- [ ] Commit with comprehensive multi-line message describing:
  - Project structure setup
  - Frontend bootstrap (React, Vite, TypeScript, Tailwind)
  - Backend bootstrap (Python, FastAPI, Uvicorn)
  - Health check endpoint and middleware
  - End-to-end verification
  - Documentation updates
- [ ] Push to GitHub
- [ ] Verify commit appears correctly on GitHub web interface

**Final Verification**:

- [ ] All files committed successfully
- [ ] No secrets in committed files
- [ ] README.md displays correctly on GitHub
- [ ] AGENTS.md accessible in repository
- [ ] Only .env.example files committed (not .env or .env.local)

---

## AI PROMPT:

**Start Unit 5** - Paste this into GitHub Copilot Chat:

```
I'm ready for Unit 5 from Beast_Mode_SETUP_PRD.md. Please implement:

1. Expand README.md with:
   - Full tech stack details
   - Prerequisites and quick start (Conda and venv options)
   - Project structure tree
   - API docs links
   - Session progress tracker
2. Optionally create docs/journal/D1.md with session summary
3. Guide me through git workflow:
   - Check status
   - Verify no secrets staged
   - Stage files
   - Craft comprehensive commit message
   - Push to GitHub

After implementation:
- Show me expanded README.md for review
- Guide me through git verification steps
- Help me write the commit message
- Ask me to confirm push to GitHub

This completes Session 1. Mark all tasks [x] and ask if I'd like to review or proceed to Session 2.
```

---

PAUSE

````markdown
# my-ideas

A full-stack application for capturing, developing, and sharing ideas. Built with modern web technologies and designed for AI-assisted development.

## Tech Stack

### Frontend

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast HMR, ESM-based)
- **Styling**: Tailwind CSS v3+
- **Routing**: React Router v6
- **State**: React Query for server state
- **HTTP**: Axios with configured instance

### Backend

- **Framework**: FastAPI (Python async framework)
- **Server**: Uvicorn with auto-reload
- **Language**: Python 3.12+
- **Database**: Supabase (PostgreSQL) - Session 2+
- **AI**: OpenAI Agent SDK - Session 4+

### Development

- **Version Control**: Git + GitHub
- **Editor**: VS Code with GitHub Copilot
- **Environment**: Conda (recommended) or venv

## Prerequisites

- Node.js 18+
- Python 3.12+
- Conda (recommended) or venv for Python isolation
- Git and GitHub account
- VS Code with Copilot extension

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/<your-username>/my-ideas.git
cd my-ideas
```
````

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if needed (default: http://127.0.0.1:8000)
npm run dev
```

Frontend runs on http://localhost:5173

### 3. Backend Setup

**With Conda (Recommended):**

```bash
conda create -n ideas python=3.12 -y
conda activate ideas
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env if needed
cd ..
python -m uvicorn backend.app.main:app --reload --log-level debug
```

**With venv:**

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
cd ..
python -m uvicorn backend.app.main:app --reload --log-level debug
```

Backend runs on http://127.0.0.1:8000

### 4. Verify Setup

- Open http://localhost:5173 in browser
- Click "Ping API" button
- Verify success message: "✓ API Connected: ok"
- Open DevTools → Network tab to see /health request

## Project Structure

```
my-ideas/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/      # Axios client
│   │   ├── pages/    # Route components
│   │   └── ...
│   └── package.json
│
├── backend/          # FastAPI + Python
│   ├── app/
│   │   └── main.py  # FastAPI app
│   └── requirements.txt
│
└── docs/            # Documentation
    └── session_one/ # Session 1 materials
```

## API Documentation

FastAPI provides auto-generated API docs:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Development Workflow

1. Open project in VS Code
2. Open two terminals (FE and BE)
3. Start both dev servers
4. Frontend auto-reloads on file changes (Vite HMR)
5. Backend auto-reloads on file changes (Uvicorn --reload)

## Session Progress

- [x] **Session 1**: Application Bootstrap ✓
  - Project structure and Git hygiene
  - Frontend: React + Vite + TypeScript + Tailwind
  - Backend: Python + FastAPI + Uvicorn
  - End-to-end health check verified
- [ ] **Session 2**: Supabase Authentication
- [ ] **Session 3**: Testing & Production Polish
- [ ] **Session 4**: AI Agent Integration
- [ ] **Session 5**: Deployment (Vercel + Fly.io)

## Contributing

This is a learning project following the code45 curriculum. For collaboration guidelines, see [AGENTS.md](./AGENTS.md).

## License

MIT (or your chosen license)

```

```

**Create Journal Entry (Optional)**:

- [ ] Create `docs/journal/D1.md`:

  ```markdown
  # Day 1 - Application Bootstrap

  **Date**: [Current Date]

  **Completed**:

  - ✓ Project structure created (frontend/, backend/, docs/)
  - ✓ Git hygiene files (.gitignore, README, AGENTS.md)
  - ✓ Frontend: React + Vite + TypeScript + Tailwind
  - ✓ Backend: Python + FastAPI + Uvicorn
  - ✓ Health check endpoint working
  - ✓ CORS configured for local development
  - ✓ Request ID and timing middleware added
  - ✓ End-to-end ping test successful

  **Key Learnings**:

  - Vite's HMR is significantly faster than Create React App
  - FastAPI auto-generates excellent API documentation
  - Middleware in FastAPI is straightforward for cross-cutting concerns
  - CORS configuration critical for local frontend-backend communication

  **Challenges**:

  - [Note any issues you encountered]

  **Next Steps**:

  - Session 2: Implement Supabase authentication
  - Add protected routes and user management
  - Set up database schema and RLS policies
  ```

**Git Workflow**:

- [ ] Check status: `git status`
- [ ] Review all changes (should only include intended files)
- [ ] Stage all files:
  ```bash
  git add .
  ```
- [ ] Verify staging: `git status` (all files should be green)
- [ ] Check that .env files are NOT staged:
  ```bash
  git status | grep ".env"
  # Should return nothing (files ignored)
  ```
- [ ] Commit with descriptive message:

  ```bash
  git commit -m "feat: bootstrap full-stack application with React, FastAPI, and health check endpoint

  - Setup project structure with frontend/, backend/, docs/
  - Add Git hygiene files (.gitignore, README.md, AGENTS.md)
  - Bootstrap React app with Vite, TypeScript, Tailwind CSS
  - Install core libraries: React Router, React Query, Axios
  - Setup Python backend with FastAPI and Uvicorn
  - Implement /health endpoint with CORS and middleware
  - Add request ID and timing middleware
  - Create environment variable templates
  - Verify end-to-end communication with ping test
  - Update documentation with setup instructions"
  ```

- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```
- [ ] Verify commit on GitHub web interface

**Verification**:

- [ ] All files committed successfully
- [ ] No secrets in committed files (check .gitignore working)
- [ ] README.md visible and formatted correctly on GitHub
- [ ] AGENTS.md accessible in repository
- [ ] .env files not in repository (only .env.example files)

**Success Criteria**:

- README.md comprehensive and up-to-date
- Journal entry created (optional)
- All work committed to main branch
- No secrets committed
- GitHub repository reflects local state
- Documentation clear for future sessions

**Estimated Effort**: 15-20 minutes

---

## AI PROMPT:

Start Unit 5 implementation:

```
Please implement Unit 5: Documentation Update & Initial Commit from the Beast_Mode_SETUP_PRD.md.

Help me:
1. Expand README.md with complete setup instructions, tech stack, and project structure
2. Create an optional journal entry in docs/journal/D1.md
3. Guide me through the git commit process with verification steps

After README is ready:
1. Show me the updated README.md content for review
2. Guide me to check git status and verify no secrets are staged
3. Help me craft a comprehensive commit message
4. Ask me to confirm the commit and push to GitHub

This completes Session 1. Ask if I'd like to proceed to Session 2 or review anything from Session 1.
```

---

PAUSE

## Session 1 Completion Checklist

**Phase 1: Project Structure** ✓

- [x] Folder structure created (frontend/, backend/, docs/)
- [x] .gitignore with Node, Python, OS patterns
- [x] README.md with project description
- [x] AGENTS.md with collaboration guidelines
- [x] Optional: .editorconfig and .gitattributes

**Phase 2: Frontend** ✓

- [x] React + Vite + TypeScript scaffolded
- [x] Tailwind CSS configured
- [x] React Router, React Query, Axios installed
- [x] Path alias (@) configured in Vite and TypeScript
- [x] Axios apiClient created
- [x] Home page with Tailwind styling
- [x] Environment variables (.env.local and .env.example)
- [x] Dev server runs on http://localhost:5173

**Phase 3: Backend** ✓

- [x] Python 3.12 environment (Conda or venv)
- [x] FastAPI and Uvicorn installed
- [x] Black and isort installed
- [x] backend/app/main.py with FastAPI app
- [x] /health endpoint implemented
- [x] CORS middleware configured
- [x] Request ID and timing middleware
- [x] Environment variables (.env and .env.example)
- [x] requirements.txt generated
- [x] Dev server runs on http://127.0.0.1:8000

**Phase 4: Integration** ✓

- [x] Frontend calls backend /health endpoint
- [x] "Ping API" button working
- [x] Success/error handling implemented
- [x] CORS working (no browser errors)
- [x] Request headers verified in DevTools
- [x] Both servers running concurrently

**Phase 5: Documentation** ✓

- [x] README.md updated with full setup
- [x] Optional journal entry created
- [x] Git commit with descriptive message
- [x] Pushed to GitHub
- [x] No secrets committed

**Ready for Session 2**: ✓

Session 1 establishes the foundation. Session 2 will add:

- Supabase database and authentication
- User signup/login/logout flows
- Protected routes and RLS policies
- Redux state management for auth
- Token refresh and session management

---

## Troubleshooting

### Frontend Issues

**"Port 5173 already in use"**

- Solution: Vite will auto-increment to 5174, 5175, etc.
- Or kill the process: `npx kill-port 5173`

**"Module not found: @/..."**

- Verify `vite.config.ts` has @ alias defined
- Verify `tsconfig.json` has paths configured
- Restart VS Code TypeScript server: Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"

**Tailwind styles not applying**

- Check `tailwind.config.ts` content paths include `./src/**/*.{js,ts,jsx,tsx}`
- Verify `src/index.css` has @tailwind directives
- Hard refresh browser: Ctrl+Shift+R / Cmd+Shift+R

**TypeScript errors after install**

- Run `npm run build` to check for real errors vs IDE cache
- Check `tsconfig.json` is properly configured
- Ensure `vite-env.d.ts` exists in src/

### Backend Issues

**"Module 'backend.app.main' not found"**

- Run from repo root, not from backend/ folder
- Ensure `backend/app/__init__.py` exists
- Command: `python -m uvicorn backend.app.main:app --reload`

**"ImportError: No module named 'fastapi'"**

- Verify Python environment is activated
- Check: `which python` (should show conda/venv path)
- Reinstall: `pip install fastapi uvicorn[standard]`

**CORS errors in browser console**

- Verify backend CORS middleware includes frontend origin
- Check frontend uses correct backend URL (127.0.0.1:8000, not localhost:8000)
- Restart backend server after CORS config changes

**Port 8000 already in use**

- Find process: `lsof -i :8000` (macOS/Linux) or `netstat -ano | findstr :8000` (Windows)
- Kill process or use different port: `--port 8001`

### Environment Issues

**Conda environment not activating**

- Initialize conda: `conda init <your-shell>`
- Restart terminal or VS Code
- Check conda info: `conda info --envs`

**Python version mismatch**

- Verify environment: `python --version`
- VS Code: Select correct interpreter (Cmd/Ctrl+Shift+P → "Python: Select Interpreter")
- Recreate environment if needed: `conda create -n ideas python=3.12 -y`

**.env file not loading**

- Frontend: Use `.env.local` (not `.env`) for local overrides
- Backend: Ensure `.env` is in backend/ folder
- Verify `.env` in .gitignore (should NOT be committed)
- Restart dev servers after changing .env files

### Git Issues

**Secrets accidentally staged**

- Unstage: `git reset HEAD <file>`
- Verify: `git status` (file should be unstaged)
- Check .gitignore includes pattern

**Large node_modules committed**

- Remove from Git: `git rm -r --cached node_modules`
- Add to .gitignore: `node_modules/`
- Commit: `git commit -m "Remove node_modules from tracking"`

**Merge conflicts on first commit**

- Likely README or LICENSE added via GitHub UI
- Pull first: `git pull origin main --rebase`
- Resolve conflicts, then commit

---

## Quick Reference

### Terminal Commands

**Frontend (from repo root):**

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

**Backend (from repo root):**

```bash
conda activate ideas                                        # Activate environment
cd backend
pip install -r requirements.txt                            # Install dependencies
cd ..
python -m uvicorn backend.app.main:app --reload --log-level debug  # Start server
black backend/                                             # Format code
isort backend/                                             # Sort imports
pip freeze > backend/requirements.txt                      # Update requirements
```

### File Locations

**Frontend:**

- Entry: `frontend/src/main.tsx`
- App root: `frontend/src/App.tsx`
- API client: `frontend/src/api/apiClient.ts`
- Pages: `frontend/src/pages/`
- Styles: `frontend/src/index.css`
- Config: `frontend/vite.config.ts`, `frontend/tailwind.config.ts`

**Backend:**

- App: `backend/app/main.py`
- Config: `backend/.env` (not committed)
- Requirements: `backend/requirements.txt`

**Documentation:**

- Project: `README.md`
- AI guidelines: `AGENTS.md`
- Session 1: `docs/session_one/`
- Journal: `docs/journal/` (optional)

### Environment Variables

**Frontend (.env.local):**

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**Backend (.env):**

```bash
ENV=development
# Session 2+ will add Supabase credentials
```

### Ports

- Frontend: http://localhost:5173 (Vite)
- Backend: http://127.0.0.1:8000 (Uvicorn)
- API Docs: http://127.0.0.1:8000/docs (Swagger UI)

---

## Additional Resources

- **Vite**: https://vitejs.dev/guide/
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **React Query**: https://tanstack.com/query/latest/docs/react/overview
- **Axios**: https://axios-http.com/docs/intro

---

**Session 1 Complete!** The application is bootstrapped and ready for Session 2 (Supabase Authentication).
