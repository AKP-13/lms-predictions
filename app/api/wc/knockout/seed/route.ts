import { sql } from '@vercel/postgres';

// All 31 knockout matches (R32×16, R16×8, QF×4, SF×2, Final×1), times in UTC.
// Teams are TBD (NULL) until the bracket resolves — the admin fills them in via
// the team-name editor. The one is_predicted = true match per round (the last
// match chronologically) is what players score-predict. Colombia v Ghana, the
// confirmed last Round of 32 match, is pre-filled.
//
// round_number: 7 = R32, 8 = R16, 9 = QF, 10 = SF, 11 = Final.
const KO_FIXTURES: {
  round: number;
  label: string;
  ko: string;
  predicted?: boolean;
  home?: string;
  away?: string;
}[] = [
  // ── Round of 32 (round 7) ──────────────────────────────────────────────
  { round: 7, label: 'Round of 32 — Match 73', ko: '2026-06-28T19:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 76', ko: '2026-06-29T17:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 74', ko: '2026-06-29T20:30:00Z' },
  { round: 7, label: 'Round of 32 — Match 75', ko: '2026-06-30T01:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 78', ko: '2026-06-30T17:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 77', ko: '2026-06-30T21:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 79', ko: '2026-07-01T01:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 80', ko: '2026-07-01T16:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 82', ko: '2026-07-01T20:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 81', ko: '2026-07-02T00:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 84', ko: '2026-07-02T19:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 83', ko: '2026-07-02T23:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 85', ko: '2026-07-03T03:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 88', ko: '2026-07-03T18:00:00Z' },
  { round: 7, label: 'Round of 32 — Match 86', ko: '2026-07-03T22:00:00Z' },
  {
    round: 7,
    label: 'Round of 32 — Match 87',
    ko: '2026-07-04T01:30:00Z',
    predicted: true,
    home: 'Colombia',
    away: 'Ghana'
  },

  // ── Round of 16 (round 8) ──────────────────────────────────────────────
  { round: 8, label: 'Round of 16 — Match 90', ko: '2026-07-04T17:00:00Z' },
  { round: 8, label: 'Round of 16 — Match 89', ko: '2026-07-04T21:00:00Z' },
  { round: 8, label: 'Round of 16 — Match 91', ko: '2026-07-05T20:00:00Z' },
  { round: 8, label: 'Round of 16 — Match 92', ko: '2026-07-06T00:00:00Z' },
  { round: 8, label: 'Round of 16 — Match 93', ko: '2026-07-06T19:00:00Z' },
  { round: 8, label: 'Round of 16 — Match 94', ko: '2026-07-07T00:00:00Z' },
  { round: 8, label: 'Round of 16 — Match 95', ko: '2026-07-07T16:00:00Z' },
  {
    round: 8,
    label: 'Round of 16 — Match 96',
    ko: '2026-07-07T20:00:00Z',
    predicted: true
  },

  // ── Quarter-finals (round 9) ───────────────────────────────────────────
  { round: 9, label: 'Quarter-final — Match 97', ko: '2026-07-09T20:00:00Z' },
  { round: 9, label: 'Quarter-final — Match 98', ko: '2026-07-10T19:00:00Z' },
  { round: 9, label: 'Quarter-final — Match 99', ko: '2026-07-11T21:00:00Z' },
  {
    round: 9,
    label: 'Quarter-final — Match 100',
    ko: '2026-07-12T01:00:00Z',
    predicted: true
  },

  // ── Semi-finals (round 10) ─────────────────────────────────────────────
  { round: 10, label: 'Semi-final — Match 101', ko: '2026-07-14T19:00:00Z' },
  {
    round: 10,
    label: 'Semi-final — Match 102',
    ko: '2026-07-15T19:00:00Z',
    predicted: true
  },

  // ── Final (round 11) ───────────────────────────────────────────────────
  {
    round: 11,
    label: 'Final',
    ko: '2026-07-19T19:00:00Z',
    predicted: true
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.WC_SEED_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Guard: don't clobber existing fixtures (and the FK from picks would block
    // a delete anyway once predictions exist). Seed only into an empty table.
    const { rows: existing } = await sql.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM wc_knockout_fixtures`
    );
    if (Number(existing[0]?.count) > 0) {
      return Response.json(
        {
          error:
            'wc_knockout_fixtures is not empty — refusing to re-seed. Edit fixtures via the admin editor instead.'
        },
        { status: 409 }
      );
    }

    for (const f of KO_FIXTURES) {
      await sql.query(
        `INSERT INTO wc_knockout_fixtures
           (round_number, match_label, home_team_name, away_team_name, kickoff_time, is_predicted)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          f.round,
          f.label,
          f.home ?? null,
          f.away ?? null,
          f.ko,
          f.predicted ?? false
        ]
      );
    }

    return Response.json({
      seeded: true,
      fixtures: KO_FIXTURES.length,
      predicted: KO_FIXTURES.filter((f) => f.predicted).length
    });
  } catch (error) {
    console.error('WC knockout seed error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Seed failed' },
      { status: 500 }
    );
  }
}
