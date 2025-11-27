# my-ideas

my-ideas is an interactive full-stack application for capturing, organizing,
voting on, and iterating ideas. The repository contains a React + Vite frontend
and a Python FastAPI backend with Supabase authentication.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Redux Toolkit + shadcn/ui
- **Backend**: FastAPI (Python) + Supabase Auth + SQLite (initial storage)
- **Authentication**: Supabase Auth with httpOnly cookies, automatic token refresh
- **State Management**: Redux Toolkit with persistent auth state
- **UI Components**: shadcn/ui (Radix UI primitives) with Tailwind CSS

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
- Supabase account (for auth)

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
python -m uvicorn app.main:app --reload --log-level info
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

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

### Current (Session 2 Complete)

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
│   │   ├── core/          # Configuration (Supabase settings)
│   │   ├── db/            # Database clients (admin/user-scoped)
│   │   ├── api/
│   │   │   ├── routes/    # API endpoints (/auth/*)
│   │   │   └── auth_utils.py  # Auth dependencies
│   │   └── services/      # Agent service for AI operations
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/    # UI components (AuthModal, Navigation)
│   │   ├── hooks/         # React hooks (useInitAuth, useTokenRefresh)
│   │   ├── layouts/       # Page layouts (PublicLayout, UserLayout)
│   │   ├── lib/           # Utilities (apiClient with auto-refresh)
│   │   ├── pages/         # Route pages
│   │   ├── routes/        # Routing configuration
│   │   ├── services/      # API service layer (authService)
│   │   └── store/         # Redux store (auth slice)
│   └── package.json
│
└── docs/
    └── session_two/
        ├── SupabaseAuth_Implementation_PRD_v1.0.md  # Full PRD
        └── AUTH_DEVELOPER_GUIDE.md  # Developer guide
```

## Documentation

- **[Authentication Developer Guide](docs/session_two/AUTH_DEVELOPER_GUIDE.md)** - How to use auth system, protect routes, make authenticated API calls
- **[Supabase Auth PRD](docs/session_two/SupabaseAuth_Implementation_PRD_v1.0.md)** - Complete implementation reference (17 units)
- **[Session Checklists](docs/session_two/)** - Step-by-step implementation guides

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
