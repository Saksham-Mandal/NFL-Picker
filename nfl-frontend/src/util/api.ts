export const API_URL = "http://127.0.0.1:5000";

export async function login(username: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function savePick(username: string, selection: string, week = 1, gameId = 1) {
  const res = await fetch(
    `${API_URL}/pick/${encodeURIComponent(username)}?week=${week}&game_id=${gameId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selection }),
    }
  );
  if (!res.ok) throw new Error("Save failed");
  return res.json();
}

export async function getPick(username: string, week = 1, gameId = 1) {
    const res = await fetch(`${API_URL}/pick/${encodeURIComponent(username)}?week=${week}&game_id=${gameId}`);
    if (!res.ok) throw new Error("Fetch pick failed");
    return res.json() as Promise<{ selection: string | null }>;
  }

export async function listAllUsersWithPicks(week = 1, gameId = 1) {
const res = await fetch(`${API_URL}/picks/all?week=${week}&game_id=${gameId}`);
if (!res.ok) throw new Error("Fetch picks failed");
return res.json() as Promise<Array<{ username: string; selection: string | null }>>;
}  