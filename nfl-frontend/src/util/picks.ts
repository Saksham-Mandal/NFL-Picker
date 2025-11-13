const BASE = "http://127.0.0.1:5001";

// Map of gameId -> teamId (e.g., "w1-g1" -> "NYJ")
export type PicksMap = Record<string, string>;

/** Load one user's picks for a week by querying your existing GET /pick/<user>?week=&game_id=... */
export async function getUserWeekPicks(user: string, week: number, games: {id:string}[]) {
  const out: Record<string,string> = {};
  const u = encodeURIComponent(user);
  await Promise.all(games.map(async g => {
    const r = await fetch(`${BASE}/pick/${u}?week=${week}&game_id=${encodeURIComponent(g.id)}`);
    if (!r.ok) return;
    const j = await r.json();
    if (j.selection) out[g.id] = j.selection;
  }));
  return out;
}

/** Save a pick using your existing POST /pick/<user>?week=&game_id=... */

export async function saveUserPick(user: string, week: number, gameId: string, teamId: string) {
  const u = encodeURIComponent(user);
  const r = await fetch(`${BASE}/pick/${u}?week=${week}&game_id=${encodeURIComponent(gameId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selection: teamId }),
  });
  if (!r.ok) throw new Error(`Save failed: ${r.status}`);
}
