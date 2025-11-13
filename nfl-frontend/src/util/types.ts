export type Team = { id: string; name: string; abbr: string };
export type Matchup = {
  id: string;            // unique per game (string is easier for storage keys)
  home: Team;
  away: Team;
  kickoff?: string;      // optional ISO string
  venue?: string;
};
