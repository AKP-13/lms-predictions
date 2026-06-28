import { sql } from '@vercel/postgres';
import { WC_TEAMS } from '@/lib/wc-constants';

// round_number maps to the 6 LPS game rounds:
//   1 = Groups A–F Matchday 1  |  2 = Groups G–L Matchday 1
//   3 = Groups A–F Matchday 2  |  4 = Groups G–L Matchday 2
//   5 = Groups A–F Matchday 3  |  6 = Groups G–L Matchday 3
const FIXTURES = [
  // ── ROUND 1: Groups A–F, Matchday 1 ──────────────────────────────────
  {
    round: 1,
    group: 'A',
    home: 'Mexico',
    away: 'South Africa',
    ko: '2026-06-11T19:00:00Z'
  },
  {
    round: 1,
    group: 'A',
    home: 'South Korea',
    away: 'Czechia',
    ko: '2026-06-12T02:00:00Z'
  },
  {
    round: 1,
    group: 'B',
    home: 'Canada',
    away: 'Bosnia and Herzegovina',
    ko: '2026-06-12T19:00:00Z'
  },
  {
    round: 1,
    group: 'B',
    home: 'Qatar',
    away: 'Switzerland',
    ko: '2026-06-13T19:00:00Z'
  },
  {
    round: 1,
    group: 'C',
    home: 'Brazil',
    away: 'Morocco',
    ko: '2026-06-13T22:00:00Z'
  },
  {
    round: 1,
    group: 'C',
    home: 'Haiti',
    away: 'Scotland',
    ko: '2026-06-14T01:00:00Z'
  },
  {
    round: 1,
    group: 'D',
    home: 'USA',
    away: 'Paraguay',
    ko: '2026-06-13T01:00:00Z'
  },
  {
    round: 1,
    group: 'D',
    home: 'Australia',
    away: 'Türkiye',
    ko: '2026-06-14T04:00:00Z'
  },
  {
    round: 1,
    group: 'E',
    home: 'Germany',
    away: 'Curaçao',
    ko: '2026-06-14T17:00:00Z'
  },
  {
    round: 1,
    group: 'E',
    home: 'Ivory Coast',
    away: 'Ecuador',
    ko: '2026-06-14T23:00:00Z'
  },
  {
    round: 1,
    group: 'F',
    home: 'Netherlands',
    away: 'Japan',
    ko: '2026-06-14T20:00:00Z'
  },
  {
    round: 1,
    group: 'F',
    home: 'Sweden',
    away: 'Tunisia',
    ko: '2026-06-15T02:00:00Z'
  },

  // ── ROUND 2: Groups G–L, Matchday 1 ──────────────────────────────────
  {
    round: 2,
    group: 'G',
    home: 'Belgium',
    away: 'Egypt',
    ko: '2026-06-15T19:00:00Z'
  },
  {
    round: 2,
    group: 'G',
    home: 'Iran',
    away: 'New Zealand',
    ko: '2026-06-16T01:00:00Z'
  },
  {
    round: 2,
    group: 'H',
    home: 'Spain',
    away: 'Cape Verde',
    ko: '2026-06-15T16:00:00Z'
  },
  {
    round: 2,
    group: 'H',
    home: 'Saudi Arabia',
    away: 'Uruguay',
    ko: '2026-06-15T22:00:00Z'
  },
  {
    round: 2,
    group: 'I',
    home: 'France',
    away: 'Senegal',
    ko: '2026-06-16T19:00:00Z'
  },
  {
    round: 2,
    group: 'I',
    home: 'Iraq',
    away: 'Norway',
    ko: '2026-06-16T22:00:00Z'
  },
  {
    round: 2,
    group: 'J',
    home: 'Argentina',
    away: 'Algeria',
    ko: '2026-06-17T01:00:00Z'
  },
  {
    round: 2,
    group: 'J',
    home: 'Austria',
    away: 'Jordan',
    ko: '2026-06-17T04:00:00Z'
  },
  {
    round: 2,
    group: 'K',
    home: 'Portugal',
    away: 'DR Congo',
    ko: '2026-06-17T17:00:00Z'
  },
  {
    round: 2,
    group: 'K',
    home: 'Uzbekistan',
    away: 'Colombia',
    ko: '2026-06-18T02:00:00Z'
  },
  {
    round: 2,
    group: 'L',
    home: 'England',
    away: 'Croatia',
    ko: '2026-06-17T20:00:00Z'
  },
  {
    round: 2,
    group: 'L',
    home: 'Ghana',
    away: 'Panama',
    ko: '2026-06-17T23:00:00Z'
  },

  // ── ROUND 3: Groups A–F, Matchday 2 ──────────────────────────────────
  {
    round: 3,
    group: 'A',
    home: 'Czechia',
    away: 'South Africa',
    ko: '2026-06-18T16:00:00Z'
  },
  {
    round: 3,
    group: 'A',
    home: 'Mexico',
    away: 'South Korea',
    ko: '2026-06-19T01:00:00Z'
  },
  {
    round: 3,
    group: 'B',
    home: 'Switzerland',
    away: 'Bosnia and Herzegovina',
    ko: '2026-06-18T19:00:00Z'
  },
  {
    round: 3,
    group: 'B',
    home: 'Canada',
    away: 'Qatar',
    ko: '2026-06-18T22:00:00Z'
  },
  {
    round: 3,
    group: 'C',
    home: 'Scotland',
    away: 'Morocco',
    ko: '2026-06-19T22:00:00Z'
  },
  {
    round: 3,
    group: 'C',
    home: 'Brazil',
    away: 'Haiti',
    ko: '2026-06-20T00:30:00Z'
  },
  {
    round: 3,
    group: 'D',
    home: 'USA',
    away: 'Australia',
    ko: '2026-06-19T19:00:00Z'
  },
  {
    round: 3,
    group: 'D',
    home: 'Türkiye',
    away: 'Paraguay',
    ko: '2026-06-20T03:00:00Z'
  },
  {
    round: 3,
    group: 'E',
    home: 'Germany',
    away: 'Ivory Coast',
    ko: '2026-06-20T20:00:00Z'
  },
  {
    round: 3,
    group: 'E',
    home: 'Ecuador',
    away: 'Curaçao',
    ko: '2026-06-21T00:00:00Z'
  },
  {
    round: 3,
    group: 'F',
    home: 'Netherlands',
    away: 'Sweden',
    ko: '2026-06-20T17:00:00Z'
  },
  {
    round: 3,
    group: 'F',
    home: 'Tunisia',
    away: 'Japan',
    ko: '2026-06-21T04:00:00Z'
  },

  // ── ROUND 4: Groups G–L, Matchday 2 ──────────────────────────────────
  {
    round: 4,
    group: 'G',
    home: 'Belgium',
    away: 'Iran',
    ko: '2026-06-21T19:00:00Z'
  },
  {
    round: 4,
    group: 'G',
    home: 'New Zealand',
    away: 'Egypt',
    ko: '2026-06-22T01:00:00Z'
  },
  {
    round: 4,
    group: 'H',
    home: 'Spain',
    away: 'Saudi Arabia',
    ko: '2026-06-21T16:00:00Z'
  },
  {
    round: 4,
    group: 'H',
    home: 'Uruguay',
    away: 'Cape Verde',
    ko: '2026-06-21T22:00:00Z'
  },
  {
    round: 4,
    group: 'I',
    home: 'France',
    away: 'Iraq',
    ko: '2026-06-22T21:00:00Z'
  },
  {
    round: 4,
    group: 'I',
    home: 'Norway',
    away: 'Senegal',
    ko: '2026-06-23T00:00:00Z'
  },
  {
    round: 4,
    group: 'J',
    home: 'Argentina',
    away: 'Austria',
    ko: '2026-06-22T17:00:00Z'
  },
  {
    round: 4,
    group: 'J',
    home: 'Jordan',
    away: 'Algeria',
    ko: '2026-06-23T03:00:00Z'
  },
  {
    round: 4,
    group: 'K',
    home: 'Portugal',
    away: 'Uzbekistan',
    ko: '2026-06-23T17:00:00Z'
  },
  {
    round: 4,
    group: 'K',
    home: 'Colombia',
    away: 'DR Congo',
    ko: '2026-06-24T02:00:00Z'
  },
  {
    round: 4,
    group: 'L',
    home: 'England',
    away: 'Ghana',
    ko: '2026-06-23T20:00:00Z'
  },
  {
    round: 4,
    group: 'L',
    home: 'Panama',
    away: 'Croatia',
    ko: '2026-06-23T23:00:00Z'
  },

  // ── ROUND 5: Groups A–F, Matchday 3 ──────────────────────────────────
  {
    round: 5,
    group: 'A',
    home: 'South Africa',
    away: 'South Korea',
    ko: '2026-06-25T01:00:00Z'
  },
  {
    round: 5,
    group: 'A',
    home: 'Czechia',
    away: 'Mexico',
    ko: '2026-06-25T01:00:00Z'
  },
  {
    round: 5,
    group: 'B',
    home: 'Switzerland',
    away: 'Canada',
    ko: '2026-06-24T19:00:00Z'
  },
  {
    round: 5,
    group: 'B',
    home: 'Bosnia and Herzegovina',
    away: 'Qatar',
    ko: '2026-06-24T19:00:00Z'
  },
  {
    round: 5,
    group: 'C',
    home: 'Morocco',
    away: 'Haiti',
    ko: '2026-06-24T22:00:00Z'
  },
  {
    round: 5,
    group: 'C',
    home: 'Scotland',
    away: 'Brazil',
    ko: '2026-06-24T22:00:00Z'
  },
  {
    round: 5,
    group: 'D',
    home: 'Türkiye',
    away: 'USA',
    ko: '2026-06-26T02:00:00Z'
  },
  {
    round: 5,
    group: 'D',
    home: 'Paraguay',
    away: 'Australia',
    ko: '2026-06-26T02:00:00Z'
  },
  {
    round: 5,
    group: 'E',
    home: 'Curaçao',
    away: 'Ivory Coast',
    ko: '2026-06-25T20:00:00Z'
  },
  {
    round: 5,
    group: 'E',
    home: 'Ecuador',
    away: 'Germany',
    ko: '2026-06-25T20:00:00Z'
  },
  {
    round: 5,
    group: 'F',
    home: 'Tunisia',
    away: 'Netherlands',
    ko: '2026-06-25T23:00:00Z'
  },
  {
    round: 5,
    group: 'F',
    home: 'Japan',
    away: 'Sweden',
    ko: '2026-06-25T23:00:00Z'
  },

  // ── ROUND 6: Groups G–L, Matchday 3 ──────────────────────────────────
  {
    round: 6,
    group: 'G',
    home: 'New Zealand',
    away: 'Belgium',
    ko: '2026-06-27T03:00:00Z'
  },
  {
    round: 6,
    group: 'G',
    home: 'Egypt',
    away: 'Iran',
    ko: '2026-06-27T03:00:00Z'
  },
  {
    round: 6,
    group: 'H',
    home: 'Cape Verde',
    away: 'Saudi Arabia',
    ko: '2026-06-27T00:00:00Z'
  },
  {
    round: 6,
    group: 'H',
    home: 'Uruguay',
    away: 'Spain',
    ko: '2026-06-27T00:00:00Z'
  },
  {
    round: 6,
    group: 'I',
    home: 'Norway',
    away: 'France',
    ko: '2026-06-26T19:00:00Z'
  },
  {
    round: 6,
    group: 'I',
    home: 'Senegal',
    away: 'Iraq',
    ko: '2026-06-26T19:00:00Z'
  },
  {
    round: 6,
    group: 'J',
    home: 'Algeria',
    away: 'Austria',
    ko: '2026-06-28T02:00:00Z'
  },
  {
    round: 6,
    group: 'J',
    home: 'Jordan',
    away: 'Argentina',
    ko: '2026-06-28T02:00:00Z'
  },
  {
    round: 6,
    group: 'K',
    home: 'Colombia',
    away: 'Portugal',
    ko: '2026-06-27T23:30:00Z'
  },
  {
    round: 6,
    group: 'K',
    home: 'DR Congo',
    away: 'Uzbekistan',
    ko: '2026-06-27T23:30:00Z'
  },
  {
    round: 6,
    group: 'L',
    home: 'Panama',
    away: 'England',
    ko: '2026-06-27T21:00:00Z'
  },
  {
    round: 6,
    group: 'L',
    home: 'Croatia',
    away: 'Ghana',
    ko: '2026-06-27T21:00:00Z'
  }
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
    for (const team of WC_TEAMS) {
      await sql.query(
        `INSERT INTO wc_teams (name, short_name, group_name) VALUES ($1, $2, $3)`,
        [team.name, team.short_name, team.group_name]
      );
    }

    // Build name → id lookup
    const { rows: teamRows } = await sql.query<{ id: number; name: string }>(
      `SELECT id, name FROM wc_teams`
    );
    const teamIdByName = Object.fromEntries(
      teamRows.map((r) => [r.name, r.id])
    );

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
      teams: WC_TEAMS.length,
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
