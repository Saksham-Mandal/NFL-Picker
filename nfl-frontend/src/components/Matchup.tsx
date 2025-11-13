import React from "react";
import type { Matchup as MatchupType } from "../util/types";

interface MatchupProps {
  game: MatchupType;
  pick?: string | null; // teamId you picked (e.g., "NYJ")
  onPick?: (gameId: string, teamId: string) => void;
}

const Matchup: React.FC<MatchupProps> = ({ game, pick, onPick }) => {
  const { id, home, away, venue } = game;

  return (
    <li className="matchup-card">
      <div className="matchup-top">
        <div className="teams">
          <strong>{away.abbr}</strong> <span>@</span>{" "}
          <strong>{home.abbr}</strong>
        </div>
        {venue ? <span className="venue">{venue}</span> : null}
      </div>

      {onPick ? (
        <div className="matchup-actions">
          <button
            className={`btn ${pick === away.id ? "picked" : ""}`}
            onClick={() => onPick(id, away.id)}
          >
            Pick {away.name}
          </button>
          <button
            className={`btn ${pick === home.id ? "picked" : ""}`}
            onClick={() => onPick(id, home.id)}
          >
            Pick {home.name}
          </button>
          <div className="pick-text">
            {pick ? `You picked: ${pick}` : "No pick"}
          </div>
        </div>
      ) : null}
    </li>
  );
};

export default Matchup;
