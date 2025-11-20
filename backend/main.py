from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import List

DB_PATH = "sqlite.db"

app = FastAPI(title="my-ideas API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"]
    ,allow_headers=["*"]
)

class IdeaCreate(BaseModel):
    title: str
    description: str | None = None

class Idea(IdeaCreate):
    id: int
    votes: int

# --- DB helpers ---

def get_conn():
    return sqlite3.connect(DB_PATH)

def init_db():
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS ideas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                votes INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

@app.on_event("startup")
def startup():
    init_db()

# --- Endpoints ---

@app.get("/ideas", response_model=List[Idea])
def list_ideas():
    with get_conn() as conn:
        rows = conn.execute("SELECT id, title, description, votes FROM ideas ORDER BY votes DESC, id DESC").fetchall()
    return [Idea(id=r[0], title=r[1], description=r[2], votes=r[3]) for r in rows]

@app.post("/ideas", response_model=Idea, status_code=201)
def create_idea(payload: IdeaCreate):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Title required")
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO ideas (title, description) VALUES (?, ?)",
            (payload.title.strip(), payload.description)
        )
        idea_id = cur.lastrowid
        row = conn.execute("SELECT id, title, description, votes FROM ideas WHERE id = ?", (idea_id,)).fetchone()
    return Idea(id=row[0], title=row[1], description=row[2], votes=row[3])

@app.post("/ideas/{idea_id}/vote", response_model=Idea)
def vote_idea(idea_id: int):
    with get_conn() as conn:
        cur = conn.execute("SELECT id FROM ideas WHERE id = ?", (idea_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Idea not found")
        conn.execute("UPDATE ideas SET votes = votes + 1 WHERE id = ?", (idea_id,))
        row = conn.execute("SELECT id, title, description, votes FROM ideas WHERE id = ?", (idea_id,)).fetchone()
    return Idea(id=row[0], title=row[1], description=row[2], votes=row[3])

@app.delete("/ideas/{idea_id}", status_code=204)
def delete_idea(idea_id: int):
    with get_conn() as conn:
        cur = conn.execute("SELECT id FROM ideas WHERE id = ?", (idea_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Idea not found")
        conn.execute("DELETE FROM ideas WHERE id = ?", (idea_id,))
    return None

@app.get("/")
def root():
    return {"message": "my-ideas API running"}
