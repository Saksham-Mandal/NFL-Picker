import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Matchup from "../components/Matchup";
import { getWeekSchedule } from "../util/espn";
import { getUserWeekPicks, saveUserPick, type PicksMap } from "../util/picks";

function fmtKickoff(
  iso: string,
  tz = Intl.DateTimeFormat().resolvedOptions().timeZone
) {
  try {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: tz,
    }).format(d);
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
    }).format(d);
    return `${date} • ${time}`;
  } catch {
    return iso;
  }
}

export default function MakePicks() {
  const nav = useNavigate();
  const username = localStorage.getItem("username") ?? "";
  const week = 1; // keep your current week for now
  const [games, setGames] = useState<any[]>([]);
  const [picks, setPicks] = useState<PicksMap>({});
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!username) nav("/login", { replace: true, state: { from: "/picks" } });
  }, [username, nav]);

  // 1) fetch ESPN schedule
  useEffect(() => {
    (async () => {
      try {
        const g = await getWeekSchedule(week, 2);
        setGames(g);
      } catch (e: any) {
        setErr(e.message || "Failed to load schedule");
      }
    })();
  }, [week]);

  // 2) fetch user picks AFTER we know the game ids
  useEffect(() => {
    if (!username || games.length === 0) return;
    (async () => {
      try {
        // your current util expects gameIds array; pass ESPN ids
        const map = await getUserWeekPicks(
          username,
          week,
          games.map((g) => g.id)
        );
        setPicks(map);
      } catch (e: any) {
        setErr(`GET picks failed: ${e.message}`);
      }
    })();
  }, [username, week, games]);

  async function onPick(gameId: string, teamId: string) {
    setPicks((p) => ({ ...p, [gameId]: teamId })); // optimistic
    try {
      await saveUserPick(username, week, gameId, teamId);
    } catch (e: any) {
      setErr(`Save failed: ${e.message}`);
    }
  }

  return (
    <div>
      <header className="heading">
        <h2 style={{ margin: 0 }}>Make Your Picks</h2>
        <div className="meta">
          {Object.keys(picks).length}/{games.length} picked
        </div>
      </header>

      {err && <div style={{ opacity: 0.8, marginBottom: 12 }}>⚠️ {err}</div>}

      <ul className="matchup-grid">
        {games.map((game) => (
          <Matchup
            key={game.id}
            game={{
              id: game.id,
              venue: game.venue,
              kickoff: game.kickoff,
              home: game.home,
              away: game.away,
            }}
            pick={picks[game.id] || null}
            onPick={onPick}
          />
        ))}
      </ul>

      {/* optional: simple legend */}
      <p style={{ opacity: 0.7, marginTop: 12 }}>
        Times are local:{" "}
        {games[0]?.kickoff ? fmtKickoff(games[0].kickoff).split("•")[0] : ""}
      </p>
    </div>
  );
}
