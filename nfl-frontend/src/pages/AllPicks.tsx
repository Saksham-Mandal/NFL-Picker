import { useEffect, useState } from "react";
import { listAllUsersWithPicks } from "../util/api";
import { WEEK, GAME_ID } from "../util/constants";

type Row = { username: string; selection: string | null };

export default function AllPicks() {
  const [board, setBoard] = useState<Row[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setStatus("Loading board...");
        const data = await listAllUsersWithPicks(WEEK, GAME_ID);
        setBoard(data);
        setStatus("");
      } catch (e: any) {
        setStatus(e.message || "Failed to load board.");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h3>Week {WEEK} Picks</h3>
      {status && <div style={{ marginBottom: 8 }}>{status}</div>}
      {board.length === 0 ? (
        <div>No picks yet.</div>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {board.map((row) => (
            <li key={row.username}>
              <b>{row.username}</b>: {row.selection ?? "—"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
