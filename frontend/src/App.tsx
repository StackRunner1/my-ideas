import React, { useEffect, useState } from "react";

interface Idea {
  id: number;
  title: string;
  description?: string | null;
  votes: number;
}

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No backend calls during initial scaffold — operate locally.
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const newIdea: Idea = {
      id: Date.now(),
      title: title.trim(),
      description: description ? description.trim() : undefined,
      votes: 0,
    };
    setIdeas([newIdea, ...ideas]);
    setTitle("");
    setDescription("");
  }

  function onVote(id: number) {
    setIdeas(
      ideas.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i))
    );
  }

  function onDelete(id: number) {
    if (!confirm("Delete idea?")) return;
    setIdeas(ideas.filter((i) => i.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto my-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">my-ideas Board</h1>
      <form onSubmit={onSubmit} className="grid gap-2 mb-4">
        <input
          className="border rounded px-2 py-1"
          placeholder="Idea title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border rounded px-2 py-1"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Add Idea
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading && <div className="mb-2">Loading ideas...</div>}
      <ul className="space-y-2">
        {ideas.map((idea) => (
          <li key={idea.id} className="border rounded p-3 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <strong>{idea.title}</strong>
              <div className="flex gap-2">
                <button
                  onClick={() => onVote(idea.id)}
                  className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
                >
                  ▲ {idea.votes}
                </button>
                <button
                  onClick={() => onDelete(idea.id)}
                  className="text-sm px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
            {idea.description && (
              <p className="mt-2 text-sm text-gray-700">{idea.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
