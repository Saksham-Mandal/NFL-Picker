// 1 = Preseason, 2 = Regular, 3 = Postseason
export type SeasonType = 1 | 2 | 3;

export type ESPNMatchup = {
  id: string;              // ESPN event id (use this as game_id in your DB)
  kickoff: string;         // ISO string
  venue: string | null;
  home: { id: string; name: string; abbr: string };
  away: { id: string; name: string; abbr: string };
};

function toTeam(t: any) {
  return {
    id: String(t?.abbreviation ?? ""),
    name: String(t?.displayName ?? ""),
    abbr: String(t?.abbreviation ?? ""),
  };
}

export async function getWeekSchedule(week: number, seasonType: SeasonType = 2): Promise<ESPNMatchup[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=${seasonType}&week=${week}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN failed: ${res.status}`);
  const j = await res.json();

  const events: any[] = Array.isArray(j?.events) ? j.events : [];
  return events.map((e) => {
    const comp = e?.competitions?.[0] ?? {};
    const comps = Array.isArray(comp?.competitors) ? comp.competitors : [];
    const homeTeam = comps.find((c: any) => c.homeAway === "home")?.team;
    const awayTeam = comps.find((c: any) => c.homeAway === "away")?.team;
    return {
      id: String(e.id),
      kickoff: String(e.date),
      venue: comp?.venue?.fullName ?? null,
      home: toTeam(homeTeam),
      away: toTeam(awayTeam),
    };
  });
}
