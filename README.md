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
- Upvote an idea
- Delete ideas (maintainers only in future)

## Next Steps

- Add user accounts & auth
- Real-time updates via WebSockets
- Tagging & filtering
- Idea comment threads
