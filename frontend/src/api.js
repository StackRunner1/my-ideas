const API_URL = "http://localhost:8000";

export async function fetchIdeas() {
  const res = await fetch(`${API_URL}/ideas`);
  if (!res.ok) throw new Error("Failed to load ideas");
  return res.json();
}

export async function createIdea(data) {
  const res = await fetch(`${API_URL}/ideas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create idea");
  return res.json();
}

export async function voteIdea(id) {
  const res = await fetch(`${API_URL}/ideas/${id}/vote`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to vote");
  return res.json();
}

export async function deleteIdea(id) {
  const res = await fetch(`${API_URL}/ideas/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}
