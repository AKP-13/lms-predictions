import { sql } from '@vercel/postgres';

// All times in UTC (BST − 1hr)
const TEAMS = [
  // Group A
  { name: 'Mexico',                  short_name: 'MEX', group_name: 'A' },
  { name: 'South Africa',            short_name: 'RSA', group_name: 'A' },
  { name: 'South Korea',             short_name: 'KOR', group_name: 'A' },
  { name: 'Czechia',                 short_name: 'CZE', group_name: 'A' },
  // Group B
  { name: 'Canada',                  short_name: 'CAN', group_name: 'B' },
  { name: 'Bosnia and Herzegovina',  short_name: 'BIH', group_name: 'B' },
  { name: 'Qatar',                   short_name: 'QAT', group_name: 'B' },
  { name: 'Switzerland',             short_name: 'SUI', group_name: 'B' },
  // Group C
  { name: 'Brazil',                  short_name: 'BRA', group_name: 'C' },
  { name: 'Morocco',                 short_name: 'MAR', group_name: 'C' },
  { name: 'Haiti',                   short_name: 'HAI', group_name: 'C' },
  { name: 'Scotland',                short_name: 'SCO', group_name: 'C' },
  // Group D
  { name: 'USA',                     short_name: 'USA', group_name: 'D' },
  { name: 'Paraguay',                short_name: 'PAR', group_name: 'D' },
  { name: 'Australia',               short_name: 'AUS', group_name: 'D' },
  { name: 'Türkiye',                 short_name: 'TUR', group_name: 'D' },
  // Group E
  { name: 'Germany',                 short_name: 'GER', group_name: 'E' },
  { name: 'Curaçao',                 short_name: 'CUW', group_name: 'E' },
  { name: 'Ivory Coast',             short_name: 'CIV', group_name: 'E' },
  { name: 'Ecuador',                 short_name: 'ECU', group_name: 'E' },
  // Group F
  { name: 'Netherlands',             short_name: 'NED', group_name: 'F' },
  { name: 'Japan',                   short_name: 'JPN', group_name: 'F' },
  { name: 'Sweden',                  short_name: 'SWE', group_name: 'F' },
  { name: 'Tunisia',                 short_name: 'TUN', group_name: 'F' },
  // Group G
  { name: 'Belgium',                 short_name: 'BEL', group_name: 'G' },
  { name: 'Egypt',                   short_name: 'EGY', group_name: 'G' },
  { name: 'Iran',                    short_name: 'IRN', group_name: 'G' },
  { name: 'New Zealand',             short_name: 'NZL', group_name: 'G' },
  // Group H
  { name: 'Spain',                   short_name: 'ESP', group_name: 'H' },
  { name: 'Cape Verde',              short_name: 'CPV', group_name: 'H' },
  { name: 'Saudi Arabia',            short_name: 'KSA', group_name: 'H' },
  { name: 'Uruguay',                 short_name: 'URU', group_name: 'H' },
  // Group I
  { name: 'France',                  short_name: 'FRA', group_name: 'I' },
  { name: 'Senegal',                 short_name: 'SEN', group_name: 'I' },
  { name: 'Iraq',                    short_name: 'IRQ', group_name: 'I' },
  { name: 'Norway',                  short_name: 'NOR', group_name: 'I' },
  // Group J
  { name: 'Argentina',               short_name: 'ARG', group_name: 'J' },
  { name: 'Algeria',                 short_name: 'ALG', group_name: 'J' },
  { name: 'Austria',                 short_name: 'AUT', group_name: 'J' },
  { name: 'Jordan',                  short_name: 'JOR', group_name: 'J' },
  // Group K
  { name: 'Portugal',                short_name: 'POR', group_name: 'K' },
  { name: 'DR Congo',                short_name: 'COD', group_name: 'K' },
  { name: 'Colombia',                short_name: 'COL', group_name: 'K' },
  { name: 'Uzbekistan',              short_name: 'UZB', group_name: 'K' },
  // Group L
  { name: 'England',                 short_name: 'ENG', group_name: 'L' },
  { name: 'Croatia',                 short_name: 'CRO', group_name: 'L' },
  { name: 'Ghana',                   short_name: 'GHA', group_name: 'L' },
  { name: 'Panama',                  short_name: 'PAN', group_name: 'L' },
];

// round_number maps to the 6 LPS game rounds:
//   1 = Groups A–F Matchday 1  |  2 = Groups G–L Matchday 1
//   3 = Groups A–F Matchday 2  |  4 = Groups G–L Matchday 2
//   5 = Groups A–F Matchday 3  |  6 = Groups G–L Matchday 3
const FIXTURES = [
  // ── ROUND 1: Groups A–F, Matchday 1 ──────────────────────────────────
  { round: 1, group: 'A', home: 'Mexico',                 away: 'South Africa',           ko: '2026-06-11T19:00:00Z' },
  { round: 1, group: 'A', home: 'South Korea',            away: 'Czechia',                ko: '2026-06-12T02:00:00Z' },
  { round: 1, group: 'B', home: 'Canada',                 away: 'Bosnia and Herzegovina', ko: '2026-06-12T19:00:00Z' },
  { round: 1, group: 'B', home: 'Qatar',                  away: 'Switzerland',            ko: '2026-06-13T19:00:00Z' },
  { round: 1, group: 'C', home: 'Brazil',                 away: 'Morocco',                ko: '2026-06-13T22:00:00Z' },
  { round: 1, group: 'C', home: 'Haiti',                  away: 'Scotland',               ko: '2026-06-14T01:00:00Z' },
  { round: 1, group: 'D', home: 'USA',                    away: 'Paraguay',               ko: '2026-06-13T01:00:00Z' },
  { round: 1, group: 'D', home: 'Australia',              away: 'Türkiye',                ko: '2026-06-14T04:00:00Z' },
  { round: 1, group: 'E', home: 'Germany',                away: 'Curaçao',                ko: '2026-06-14T17:00:00Z' },
  { round: 1, group: 'E', home: 'Ivory Coast',            away: 'Ecuador',                ko: '2026-06-14T23:00:00Z' },
  { round: 1, group: 'F', home: 'Netherlands',            away: 'Japan',                  ko: '2026-06-14T20:00:00Z' },
  { round: 1, group: 'F', home: 'Sweden',                 away: 'Tunisia',                ko: '2026-06-15T02:00:00Z' },

  // ── ROUND 2: Groups G–L, Matchday 1 ──────────────────────────────────
  { round: 2, group: 'G', home: 'Belgium',                away: 'Egypt',                  ko: '2026-06-15T19:00:00Z' },
  { round: 2, group: 'G', home: 'Iran',                   away: 'New Zealand',            ko: '2026-06-16T01:00:00Z' },
  { round: 2, group: 'H', home: 'Spain',                  away: 'Cape Verde',             ko: '2026-06-15T16:00:00Z' },
  { round: 2, group: 'H', home: 'Saudi Arabia',           away: 'Uruguay',                ko: '2026-06-15T22:00:00Z' },
  { round: 2, group: 'I', home: 'France',                 away: 'Senegal',                ko: '2026-06-16T19:00:00Z' },
  { round: 2, group: 'I', home: 'Iraq',                   away: 'Norway',                 ko: '2026-06-16T22:00:00Z' },
  { round: 2, group: 'J', home: 'Argentina',              away: 'Algeria',                ko: '2026-06-17T01:00:00Z' },
  { round: 2, group: 'J', home: 'Austria',                away: 'Jordan',                 ko: '2026-06-17T04:00:00Z' },
  { round: 2, group: 'K', home: 'Portugal',               away: 'DR Congo',               ko: '2026-06-17T17:00:00Z' },
  { round: 2, group: 'K', home: 'Uzbekistan',             away: 'Colombia',               ko: '2026-06-18T02:00:00Z' },
  { round: 2, group: 'L', home: 'England',                away: 'Croatia',                ko: '2026-06-17T20:00:00Z' },
  { round: 2, group: 'L', home: 'Ghana',                  away: 'Panama',                 ko: '2026-06-17T23:00:00Z' },

  // ── ROUND 3: Groups A–F, Matchday 2 ──────────────────────────────────
  { round: 3, group: 'A', home: 'Czechia',                away: 'South Africa',           ko: '2026-06-18T16:00:00Z' },
  { round: 3, group: 'A', home: 'Mexico',                 away: 'South Korea',            ko: '2026-06-19T01:00:00Z' },
  { round: 3, group: 'B', home: 'Switzerland',            away: 'Bosnia and Herzegovina', ko: '2026-06-18T19:00:00Z' },
  { round: 3, group: 'B', home: 'Canada',                 away: 'Qatar',                  ko: '2026-06-18T22:00:00Z' },
  { round: 3, group: 'C', home: 'Scotland',               away: 'Morocco',                ko: '2026-06-19T22:00:00Z' },
  { round: 3, group: 'C', home: 'Brazil',                 away: 'Haiti',                  ko: '2026-06-20T00:30:00Z' },
  { round: 3, group: 'D', home: 'USA',                    away: 'Australia',              ko: '2026-06-19T19:00:00Z' },
  { round: 3, group: 'D', home: 'Türkiye',                away: 'Paraguay',               ko: '2026-06-20T03:00:00Z' },
  { round: 3, group: 'E', home: 'Germany',                away: 'Ivory Coast',            ko: '2026-06-20T20:00:00Z' },
  { round: 3, group: 'E', home: 'Ecuador',                away: 'Curaçao',                ko: '2026-06-21T00:00:00Z' },
  { round: 3, group: 'F', home: 'Netherlands',            away: 'Sweden',                 ko: '2026-06-20T17:00:00Z' },
  { round: 3, group: 'F', home: 'Tunisia',                away: 'Japan',                  ko: '2026-06-21T04:00:00Z' },

  // ── ROUND 4: Groups G–L, Matchday 2 ──────────────────────────────────
  { round: 4, group: 'G', home: 'Belgium',                away: 'Iran',                   ko: '2026-06-21T19:00:00Z' },
  { round: 4, group: 'G', home: 'New Zealand',            away: 'Egypt',                  ko: '2026-06-22T01:00:00Z' },
  { round: 4, group: 'H', home: 'Spain',                  away: 'Saudi Arabia',           ko: '2026-06-21T16:00:00Z' },
  { round: 4, group: 'H', home: 'Uruguay',                away: 'Cape Verde',             ko: '2026-06-21T22:00:00Z' },
  { round: 4, group: 'I', home: 'France',                 away: 'Iraq',                   ko: '2026-06-22T21:00:00Z' },
  { round: 4, group: 'I', home: 'Norway',                 away: 'Senegal',                ko: '2026-06-23T00:00:00Z' },
  { round: 4, group: 'J', home: 'Argentina',              away: 'Austria',                ko: '2026-06-22T17:00:00Z' },
  { round: 4, group: 'J', home: 'Jordan',                 away: 'Algeria',                ko: '2026-06-23T03:00:00Z' },
  { round: 4, group: 'K', home: 'Portugal',               away: 'Uzbekistan',             ko: '2026-06-23T17:00:00Z' },
  { round: 4, group: 'K', home: 'Colombia',               away: 'DR Congo',               ko: '2026-06-24T02:00:00Z' },
  { round: 4, group: 'L', home: 'England',                away: 'Ghana',                  ko: '2026-06-23T20:00:00Z' },
  { round: 4, group: 'L', home: 'Panama',                 away: 'Croatia',                ko: '2026-06-23T23:00:00Z' },

  // ── ROUND 5: Groups A–F, Matchday 3 ──────────────────────────────────
  { round: 5, group: 'A', home: 'South Africa',           away: 'South Korea',            ko: '2026-06-25T01:00:00Z' },
  { round: 5, group: 'A', home: 'Czechia',                away: 'Mexico',                 ko: '2026-06-25T01:00:00Z' },
  { round: 5, group: 'B', home: 'Switzerland',            away: 'Canada',                 ko: '2026-06-24T19:00:00Z' },
  { round: 5, group: 'B', home: 'Bosnia and Herzegovina', away: 'Qatar',                  ko: '2026-06-24T19:00:00Z' },
  { round: 5, group: 'C', home: 'Morocco',                away: 'Haiti',                  ko: '2026-06-24T22:00:00Z' },
  { round: 5, group: 'C', home: 'Scotland',               away: 'Brazil',                 ko: '2026-06-24T22:00:00Z' },
  { round: 5, group: 'D', home: 'Türkiye',                away: 'USA',                    ko: '2026-06-26T02:00:00Z' },
  { round: 5, group: 'D', home: 'Paraguay',               away: 'Australia',              ko: '2026-06-26T02:00:00Z' },
  { round: 5, group: 'E', home: 'Curaçao',                away: 'Ivory Coast',            ko: '2026-06-25T20:00:00Z' },
  { round: 5, group: 'E', home: 'Ecuador',                away: 'Germany',                ko: '2026-06-25T20:00:00Z' },
  { round: 5, group: 'F', home: 'Tunisia',                away: 'Netherlands',            ko: '2026-06-25T23:00:00Z' },
  { round: 5, group: 'F', home: 'Japan',                  away: 'Sweden',                 ko: '2026-06-25T23:00:00Z' },

  // ── ROUND 6: Groups G–L, Matchday 3 ──────────────────────────────────
  { round: 6, group: 'G', home: 'New Zealand',            away: 'Belgium',                ko: '2026-06-27T03:00:00Z' },
  { round: 6, group: 'G', home: 'Egypt',                  away: 'Iran',                   ko: '2026-06-27T03:00:00Z' },
  { round: 6, group: 'H', home: 'Cape Verde',             away: 'Saudi Arabia',           ko: '2026-06-27T00:00:00Z' },
  { round: 6, group: 'H', home: 'Uruguay',                away: 'Spain',                  ko: '2026-06-27T00:00:00Z' },
  { round: 6, group: 'I', home: 'Norway',                 away: 'France',                 ko: '2026-06-26T19:00:00Z' },
  { round: 6, group: 'I', home: 'Senegal',                away: 'Iraq',                   ko: '2026-06-26T19:00:00Z' },
  { round: 6, group: 'J', home: 'Algeria',                away: 'Austria',                ko: '2026-06-28T02:00:00Z' },
  { round: 6, group: 'J', home: 'Jordan',                 away: 'Argentina',              ko: '2026-06-28T02:00:00Z' },
  { round: 6, group: 'K', home: 'Colombia',               away: 'Portugal',               ko: '2026-06-27T23:30:00Z' },
  { round: 6, group: 'K', home: 'DR Congo',               away: 'Uzbekistan',             ko: '2026-06-27T23:30:00Z' },
  { round: 6, group: 'L', home: 'Panama',                 away: 'England',                ko: '2026-06-27T21:00:00Z' },
  { round: 6, group: 'L', home: 'Croatia',                away: 'Ghana',                  ko: '2026-06-27T21:00:00Z' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.WC_SEED_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Clear existing data (fixtures first due to FK constraints)
    await sql.query(`DELETE FROM wc_fixtures`);
    await sql.query(`DELETE FROM wc_teams`);

    // Insert teams
    for (const team of TEAMS) {
      await sql.query(
        `INSERT INTO wc_teams (name, short_name, group_name) VALUES ($1, $2, $3)`,
        [team.name, team.short_name, team.group_name]
      );
    }

    // Build name → id lookup
    const { rows: teamRows } = await sql.query<{ id: number; name: string }>(
      `SELECT id, name FROM wc_teams`
    );
    const teamIdByName = Object.fromEntries(teamRows.map((r) => [r.name, r.id]));

    // Verify all fixture team names resolve before inserting
    for (const f of FIXTURES) {
      if (!teamIdByName[f.home])
        throw new Error(`Unknown team name in seed: "${f.home}"`);
      if (!teamIdByName[f.away])
        throw new Error(`Unknown team name in seed: "${f.away}"`);
    }

    // Insert fixtures
    for (const f of FIXTURES) {
      await sql.query(
        `INSERT INTO wc_fixtures (round_number, group_name, home_team_id, away_team_id, kickoff_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [f.round, f.group, teamIdByName[f.home], teamIdByName[f.away], f.ko]
      );
    }

    return Response.json({
      seeded: true,
      teams: TEAMS.length,
      fixtures: FIXTURES.length
    });
  } catch (error) {
    console.error('WC seed error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Seed failed' },
      { status: 500 }
    );
  }
}
