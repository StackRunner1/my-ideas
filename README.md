# my-ideas

my-ideas is an interactive full-stack application for capturing, organizing,
voting on, and iterating ideas. The repository contains a React + Vite frontend
and a Python FastAPI backend with Supabase authentication.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Redux Toolkit + shadcn/ui + Recharts
- **Backend**: FastAPI (Python) + Supabase Auth + Supabase Database
- **Authentication**: Supabase Auth with httpOnly cookies, automatic token refresh
- **State Management**: Redux Toolkit with persistent auth state
- **UI Components**: shadcn/ui (Radix UI primitives) with Tailwind CSS
- **Charts**: Recharts with responsive design
- **Testing**: Backend (pytest + httpx), Frontend (Vitest + Testing Library)

## Authentication

This project implements production-ready authentication using Supabase Auth with the following features:

- **Secure token storage**: httpOnly cookies (XSS-protected)
- **Automatic token refresh**: Proactive refresh 5 minutes before expiry + tab visibility detection
- **Session restoration**: Users stay logged in across page refreshes
- **Protected routes**: Route guards for authenticated-only pages
- **Agent-user pattern**: Dual auth accounts for AI operations

📚 **[Full Authentication Developer Guide](docs/session_two/AUTH_DEVELOPER_GUIDE.md)**

### Environment Setup

**Backend** (`backend/.env`):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Keep secret!
SUPABASE_ANON_KEY=eyJhbGc...
ENV=local  # or 'production'
```

**Frontend** (`frontend/.env`):

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Supabase Configuration

1. Create project at [supabase.com](https://supabase.com)
2. Get API keys from Settings → API
3. **Important**: Dashboard → Auth → Providers → Email → **Disable "Confirm email"** (for dev/testing)
4. Copy keys to `backend/.env`

## Quick Start

**Prerequisites**:

- Python 3.12+
- Node.js 18+
- Conda (recommended) or venv
- Supabase account (for auth + database)

### Backend Setup

```powershell
cd backend
conda create -n ideas python=3.12
conda activate ideas
pip install -r requirements.txt
```

Create `backend/.env` with your Supabase credentials (see Authentication section above).

**Run backend**:

```powershell
conda activate ideas
python -m uvicorn app.main:app --reload --log-level info --port 8000
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

**Run backend tests**:

```powershell
cd backend
python -m pytest -v
# With coverage
python -m pytest --cov=app --cov-report=html
```

### Frontend Setup

```powershell
cd frontend
npm install
```

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Run frontend**:

```powershell
npm run dev
```

Frontend runs at `http://localhost:5173`

**Run frontend tests**:

```powershell
npm test                  # Interactive mode
npm test -- --run         # Run once
npm run test:coverage     # With coverage
npm run test:ui           # Visual UI
```

### Development Workflow

Run both servers in separate terminals:

**Terminal 1 (Backend)**:

```powershell
cd backend
conda activate ideas
python -m uvicorn app.main:app --reload --log-level info
```

**Terminal 2 (Frontend)**:

```powershell
cd frontend
npm run dev
```

## Features

### Session 3 Complete: Production Polish & Design Systems

- ✅ **Observability & Monitoring**

  - Request ID correlation (frontend → backend → logs → response headers)
  - Structured JSON logging with context propagation
  - Standardized error response schema with request IDs
  - Health check endpoint with database connectivity test
  - Timeout and retry configuration with exponential backoff

- ✅ **Design System**

  - Interactive Style Guide (`/style-guide`) with 5 sections
  - Extended design tokens (typography, spacing, shadows, z-index)
  - Native HTML elements showcase with state controls
  - shadcn/ui component gallery with code examples
  - Copy-to-clipboard for color values and code snippets

- ✅ **Analytics Dashboard**

  - Recharts integration with 3 chart types
  - Line chart: Items created over time (last 30 days)
  - Bar chart: Items by status distribution
  - Pie chart: Top 10 tag usage
  - Database views for aggregated analytics
  - Protected `/analytics` route for authenticated users

- ✅ **UX Enhancements**

  - Loading skeleton screens (reduced perceived latency)
  - Empty states with helpful CTAs
  - Error boundaries for graceful error handling
  - Keyboard shortcuts framework
  - Skip links for accessibility
  - Screen reader optimizations (ARIA labels, live regions)

- ✅ **Testing Infrastructure**
  - Backend: pytest with async support, 13+ tests, 36% baseline coverage
  - Frontend: Vitest + Testing Library, 8+ component tests
  - Test fixtures and utilities for consistent testing
  - Coverage reporting (backend >70%, frontend >60% targets)

### Session 2 Complete: Authentication

- ✅ **User Authentication**

  - Sign up with email/password
  - Login with session management
  - Logout with token revocation
  - Automatic session restoration on page refresh
  - Proactive token refresh before expiry
  - Protected routes with route guards

- ✅ **UI Components**

  - Responsive navigation (adaptive to auth state)
  - Auth modal (sign in/sign up tabs)
  - Protected pages (Dashboard, Ideas, Profile)
  - Public pages (Home, About)

- ✅ **Developer Experience**
  - Type-safe routing with path constants
  - Redux DevTools for state debugging
  - Comprehensive error handling
  - Console logging for auth events

### Planned (Future Sessions)

- Real-time idea board with CRUD operations
- Voting system with optimistic UI updates
- Beta feature gating (using agent-user pattern)
- AI-powered idea suggestions
- WebSocket real-time updates
- Comment threads on ideas
- Tagging and filtering
- User profiles and avatars

## Project Structure

```
my-ideas/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration, logging, errors
│   │   ├── db/            # Database clients (admin/user-scoped)
│   │   ├── api/
│   │   │   ├── routes/    # API endpoints (/auth/*, /analytics/*)
│   │   │   ├── error_handlers.py  # Global exception handlers
│   │   │   └── auth_utils.py      # Auth dependencies
│   │   ├── middleware/    # Request ID & timing middleware
│   │   └── services/      # Agent service for AI operations
│   ├── tests/             # pytest tests (conftest, test_*)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/    # UI components + shadcn/ui
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── hooks/         # React hooks (auth, keyboard shortcuts)
│   │   ├── layouts/       # Page layouts (PublicLayout, UserLayout)
│   │   ├── lib/           # Utilities (apiClient, errorHandler, logger)
│   │   ├── pages/         # Route pages (Home, Dashboard, Analytics, StyleGuide)
│   │   ├── routes/        # Routing configuration
│   │   ├── services/      # API service layer (auth, analytics)
│   │   ├── store/         # Redux store (auth slice)
│   │   ├── styles/        # design-system.css with extended tokens
│   │   └── test/          # Test setup and utilities
│   └── package.json
│
├── supabase/
│   └── migrations/        # Database migrations (RLS, tables, analytics views)
│
└── docs/
    ├── session_two/       # Session 2: Auth implementation
    └── session_three/     # Session 3: Production polish
        ├── Beast_Mode_Polish_PRD.md     # Full PRD (SOURCE OF TRUTH)
        └── QA_CHECKLIST.md              # Comprehensive QA checklist
```

## Documentation

- **[Session 3: Production Polish PRD](docs/session_three/Beast_Mode_Polish_PRD.md)** - Complete Session 3 reference (13 units)
- **[Session 3: QA Checklist](docs/session_three/QA_CHECKLIST.md)** - Comprehensive testing and deployment checklist
- **[Authentication Developer Guide](docs/session_two/AUTH_DEVELOPER_GUIDE.md)** - How to use auth system, protect routes, make authenticated API calls
- **[Supabase Auth PRD](docs/session_two/SupabaseAuth_Implementation_PRD_v1.0.md)** - Complete auth implementation reference (17 units)
- **[AGENTS.md](AGENTS.md)** - AI-assisted development workflow guidelines

## Troubleshooting

### "401 Unauthorized" errors

- Check cookies in DevTools → Application → Cookies (should see `access_token`, `refresh_token`)
- Check Redux state in Redux DevTools (should see `isAuthenticated: true`)
- Check backend CORS settings allow `credentials` and exact frontend origin

### Session not restoring on page refresh

- Verify `useInitAuth` hook is called in `AppRoutes.tsx`
- Check browser console for `[Token Refresh]` logs
- Verify Supabase credentials in `backend/.env`

### More help

See **[Troubleshooting section in AUTH_DEVELOPER_GUIDE.md](docs/session_two/AUTH_DEVELOPER_GUIDE.md#troubleshooting)**

## Contributing

This project uses an AI-assisted development workflow. See [AGENTS.md](AGENTS.md) for guidelines on:

- AI-first collaboration
- Prompt conventions
- Safety rules (secrets, commits, testing)

## License

MIT
