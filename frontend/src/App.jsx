import React, { useEffect, useState } from "react";
import { fetchIdeas, createIdea, voteIdea, deleteIdea } from "./api.js";

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIdeas();
      setIdeas(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const newIdea = await createIdea({ title, description });
      setIdeas([newIdea, ...ideas]);
      setTitle("");
      setDescription("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function onVote(id) {
    try {
      const updated = await voteIdea(id);
      setIdeas(ideas.map((i) => (i.id === id ? updated : i)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete idea?")) return;
    try {
      await deleteIdea(id);
      setIdeas(ideas.filter((i) => i.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div
      style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "system-ui" }}
    >
      <h1>my-ideas Board</h1>
      <form
        onSubmit={onSubmit}
        style={{ marginBottom: "1rem", display: "grid", gap: "0.5rem" }}
      >
        <input
          placeholder="Idea title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <button type="submit">Add Idea</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <div>Loading ideas...</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {ideas.map((idea) => (
          <li
            key={idea.id}
            style={{
              border: "1px solid #ccc",
              padding: "0.75rem",
              marginBottom: "0.5rem",
              borderRadius: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{idea.title}</strong>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => onVote(idea.id)}>▲ {idea.votes}</button>
                <button
                  onClick={() => onDelete(idea.id)}
                  style={{ color: "crimson" }}
                >
                  Delete
                </button>
              </div>
            </div>
            {idea.description && (
              <p style={{ margin: "0.5rem 0 0" }}>{idea.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
