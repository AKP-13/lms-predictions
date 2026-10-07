// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { sql } from '@vercel/postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fetchLeagueHeading } from './data';

// Needs a real database. vitest.config.ts loads the URLs from .env and .env.local.
const hasDatabase = Boolean(
  process.env.POSTGRES_URL && process.env.DATABASE_URL
);

describe.runIf(hasDatabase)('fetchLeagueHeading against the database', () => {
  const tag = randomUUID();
  const leagueName = `Heading test league ${tag}`;
  const emptyLeagueName = `Heading test empty league ${tag}`;
  const userIds: string[] = [];
  const leagueIds: number[] = [];

  // `out` went out in the first round of the latest game. `survivor` picked in both rounds.
  let out: string;
  let survivor: string;
  let noGame: string;
  let twoLeagues: string;
  let noLeague: string;

  beforeAll(async () => {
    [out, survivor, noGame, twoLeagues, noLeague] = await Promise.all(
      ['out', 'survivor', 'no-game', 'two-leagues', 'no-league'].map(
        createUser
      )
    );
    // Created first, so it has the lower id.
    const league = await createLeague(leagueName);
    const emptyLeague = await createLeague(emptyLeagueName);

    await enrol(out, league);
    await enrol(survivor, league);
    await enrol(noGame, emptyLeague);
    await enrol(twoLeagues, emptyLeague);
    await enrol(twoLeagues, league);

    const oldGame = await createGame(league);
    for (const gameweek of [1, 2, 3, 4]) {
      await pick(survivor, league, oldGame, gameweek);
    }

    const latestGame = await createGame(league);
    await pick(out, league, latestGame, 10, false);
    await pick(survivor, league, latestGame, 10, true);
    await pick(survivor, league, latestGame, 11, null);
  });

  afterAll(async () => {
    await sql.query('DELETE FROM results WHERE league_id = ANY($1)', [
      leagueIds
    ]);
    await sql.query('DELETE FROM user_leagues WHERE user_id = ANY($1)', [
      userIds
    ]);
    await sql.query('DELETE FROM games WHERE league_id = ANY($1)', [leagueIds]);
    await sql.query('DELETE FROM leagues WHERE id = ANY($1)', [leagueIds]);
    await sql.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
  });

  it("gives the league name and the latest game's round for the pick week", async () => {
    expect(await fetchLeagueHeading({ userId: survivor, gameweek: 12 })).toEqual(
      { leagueName, week: { round: 3, gameweek: 12 } }
    );
  });

  it('gives the same round to a player who is out', async () => {
    expect(await fetchLeagueHeading({ userId: out, gameweek: 12 })).toEqual({
      leagueName,
      week: { round: 3, gameweek: 12 }
    });
  });

  it('does not count picks for the pick week itself', async () => {
    expect(await fetchLeagueHeading({ userId: out, gameweek: 11 })).toEqual({
      leagueName,
      week: { round: 2, gameweek: 11 }
    });
  });

  it('gives Round 1 before any gameweek of the game is played', async () => {
    expect(await fetchLeagueHeading({ userId: out, gameweek: 10 })).toEqual({
      leagueName,
      week: { round: 1, gameweek: 10 }
    });
  });

  it('gives no week when the pick week is unknown', async () => {
    expect(
      await fetchLeagueHeading({ userId: survivor, gameweek: null })
    ).toEqual({ leagueName, week: null });
  });

  it('gives no week when the league has no game', async () => {
    expect(await fetchLeagueHeading({ userId: noGame, gameweek: 12 })).toEqual({
      leagueName: emptyLeagueName,
      week: null
    });
  });

  it('gives nothing to a user with no league', async () => {
    expect(
      await fetchLeagueHeading({ userId: noLeague, gameweek: 12 })
    ).toBeNull();
  });

  it('reads the lowest league of a user with two league rows', async () => {
    expect(
      await fetchLeagueHeading({ userId: twoLeagues, gameweek: 12 })
    ).toEqual({ leagueName, week: { round: 3, gameweek: 12 } });
  });

  async function createUser(name: string) {
    const { rows } = await sql.query<{ id: number }>(
      'INSERT INTO users (email) VALUES ($1) RETURNING id',
      [`heading-${name}-${tag}@example.com`]
    );
    const id = String(rows[0].id);
    userIds.push(id);
    return id;
  }

  async function createLeague(name: string) {
    const { rows } = await sql.query<{ id: number }>(
      'INSERT INTO leagues (league_name) VALUES ($1) RETURNING id',
      [name]
    );
    leagueIds.push(rows[0].id);
    return rows[0].id;
  }

  async function enrol(userId: string, leagueId: number) {
    await sql.query(
      'INSERT INTO user_leagues (user_id, league_id) VALUES ($1, $2)',
      [userId, leagueId]
    );
  }

  async function createGame(leagueId: number) {
    const { rows } = await sql.query<{ id: number }>(
      `INSERT INTO games (start_date, entry_cost, league_id)
       VALUES ('2026-01-01', 0, $1) RETURNING id`,
      [leagueId]
    );
    return rows[0].id;
  }

  async function pick(
    userId: string,
    leagueId: number,
    gameId: number,
    gameweek: number,
    correct: boolean | null = true
  ) {
    await sql.query(
      `INSERT INTO results (user_id, league_id, game_id, fpl_gw, team_selected,
         team_opposing, team_selected_location, result_selected, correct)
       VALUES ($1, $2, $3, $4, 'Arsenal', 'Chelsea', 'Home', 'Win', $5)`,
      [userId, leagueId, gameId, gameweek, correct]
    );
  }
});
