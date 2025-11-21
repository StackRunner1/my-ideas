# my-ideas

An interactive full-stack web application for capturing, organizing, voting on, and refining ideas. The goal is to provide a lightweight, real-time collaborative board where users can submit new ideas, upvote promising ones, and iterate quickly.

## Stack

- Frontend: React + Vite
- Backend: FastAPI (Python) + SQLite (initially) with a simple REST API

## Quick Start

Backend (Python FastAPI):

```
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Frontend (React + Vite):

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and ensure backend runs at http://localhost:8000.

## High-Level Features (Initial)

- Create idea with title & optional description
- List all ideas with vote counts

# my-ideas

my-ideas is an interactive full-stack application for capturing, organizing,
voting on, and iterating ideas. The repository contains a React + Vite frontend
and a Python FastAPI backend; the development workflow supports AI-assisted
edits but requires human review before committing or pushing changes.

## Stack

- Frontend: React + Vite
- Backend: FastAPI (Python) + SQLite (initially) with a simple REST API

## Quick Start

Backend (Python FastAPI):

```powershell
cd backend
conda activate ideas
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

Frontend (React + Vite):

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The frontend expects the API
at `http://127.0.0.1:8000` by default (see `frontend/.env.local`).

## High-Level Features (Initial)

- Create idea with title & optional description
- List all ideas with vote counts
- Upvote an idea
- Delete ideas (maintainers only in future)

## Next Steps

- Add user accounts & auth
- Real-time updates via WebSockets
- Tagging & filtering
- Idea comment threads
