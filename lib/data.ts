import { sql } from '@vercel/postgres';
import { CurrentGameId, CurrentGameResults, Results } from './definitions';

export async function fetchResultsData() {
  try {
    const data = await sql<Results>`
    SELECT
        game_id
        , team_selected
        , team_opposing
        , team_selected_location
        , result_selected
        , correct
        , fpl_gw
        , team_selected_score
        , team_opposing_score
    FROM results;
    `;

    const groupedData: Record<number, Results[]> = data.rows.reduce(
      (acc, current) => {
        const { game_id } = current;
        if (!acc[game_id]) {
          acc[game_id] = [];
        }
        acc[game_id].push(current);
        return acc;
      },
      {} as Record<number, Results[]>
    );

    return groupedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch results.');
  }
}

export async function fetchCurrentGameData() {
  try {
    const queryResult = await sql<CurrentGameId>`
        SELECT
            MAX(id) AS current_game_id
        FROM rounds;
    `;

    const currentGameId = queryResult.rows[0].current_game_id - 5;

    const currentGameResults = await sql<CurrentGameResults>`
        SELECT
            team_selected
            , team_opposing
            , team_selected_location
            , result_selected
            , correct
            , fpl_gw
            , team_selected_score
            , team_opposing_score
        FROM results
        WHERE game_id = ${currentGameId};
    `;

    return currentGameResults.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch current game results.');
  }
}

export async function fetchTileData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const gamesPlayedQuery = sql`
        SELECT 
            CAST(COUNT(DISTINCT game_id) AS INT) AS games_played
            , MAX(round_number) AS furthest_round
        FROM results;
    `;
    const mostSelectedQuery = sql`
        SELECT
            team_selected,
            CAST(COUNT(team_selected) AS INT) AS selection_count
        FROM results
        GROUP BY team_selected
        HAVING COUNT(team_selected) = (
            SELECT MAX(selection_count)
            FROM (
                SELECT 
                    COUNT(team_selected) AS selection_count
                FROM results
                GROUP BY team_selected
            )
        )
        ORDER BY selection_count DESC;
    `;
    const teamSuccessRatesSql = sql`
        WITH results AS (
            SELECT
                r.team_selected
                , CAST(count(r.team_selected) AS NUMERIC) AS times_selected
                , CAST(SUM(CASE WHEN r.correct IS TRUE THEN 1 ELSE 0 END) AS NUMERIC) AS times_correct
                , CAST(SUM(CASE WHEN r.correct IS FALSE THEN 1 ELSE 0 END) AS NUMERIC) AS times_incorrect
            FROM results r
            GROUP BY 1
            ORDER BY team_selected
        )

        SELECT 
        *
        , ROUND(times_correct / NULLIF(times_selected, 0) * 100, 0) AS perc_correct
        FROM results
        WHERE times_selected >= 3
        ORDER BY perc_correct DESC;
    `;
    const bogeyTeamSql = sql`
        WITH loss_counts AS (
            SELECT
                team_opposing
                , COUNT(team_opposing) AS loss_count
            FROM results
            WHERE correct = FALSE
            GROUP BY team_opposing
        )

        SELECT 
            team_opposing
            , loss_count
        FROM loss_counts
        WHERE loss_count = (
            SELECT 
                MAX(loss_count) 
            FROM loss_counts
        );
    `;
    const homeAndAwaySuccessSql = sql`
        SELECT 
            team_selected_location,
            SUM(CASE WHEN correct = TRUE THEN 1 ELSE 0 END) AS correct_count,
            COUNT(*) AS total_count,
            100 * SUM(CASE WHEN correct = TRUE THEN 1 ELSE 0 END) / COUNT(*) AS success_percentage
        FROM results
        GROUP BY team_selected_location;
    `;
    const bogeyRoundNumberSql = sql`
        WITH knocked_out_counts AS (
            SELECT
                DISTINCT round_number
                , COUNT(*) AS times_knocked_out
            FROM results
            WHERE correct = FALSE
            GROUP BY round_number
        )

        SELECT 
            round_number
            , times_knocked_out  
        FROM knocked_out_counts
        WHERE times_knocked_out = (
            SELECT
                MAX(times_knocked_out)
            FROM knocked_out_counts
        );
    `;

    const data = await Promise.all([
      gamesPlayedQuery,
      mostSelectedQuery,
      teamSuccessRatesSql,
      bogeyTeamSql,
      homeAndAwaySuccessSql,
      bogeyRoundNumberSql
    ]);

    const gamesPlayed = {
      value: data[0].rows[0].games_played ?? 0,
      caption: `Furthest round: ${data[0].rows[0].furthest_round ?? 0}`
    };

    const mostSelected = {
      value: data[1].rows.map(({ team_selected }) => team_selected).join(', '),
      caption: `${data[1].rows[0].selection_count ?? 0} times`
    };

    const mostSuccessful = {
      value: data[2].rows[0].team_selected,
      caption: `${data[2].rows[0].perc_correct}% success rate`
    };

    const leastSuccessful = {
      value: data[2].rows[data[2].rows.length - 1].team_selected,
      caption: `${data[2].rows[data[2].rows.length - 1].perc_correct}% success rate`
    };

    const bogeyTeam = {
      value: data[3].rows.map(({ team_opposing }) => team_opposing).join(', '),
      caption: `${data[3].rows[0].loss_count ?? 0} times`
    };

    const homeObjIdx = data[4].rows.findIndex(
      (obj) => obj.team_selected_location === 'Home'
    );

    const awayObjIdx = data[4].rows.findIndex(
      (obj) => obj.team_selected_location === 'Away'
    );

    const homeSuccess = {
      value: `${data[4].rows[homeObjIdx]?.success_percentage}%`,
      caption: `${data[4].rows[homeObjIdx].correct_count} / ${data[4].rows[homeObjIdx].total_count} picks`
    };

    const awaySuccess = {
      value: `${data[4].rows[awayObjIdx]?.success_percentage}%`,
      caption: `${data[4].rows[awayObjIdx].correct_count} / ${data[4].rows[awayObjIdx].total_count} picks`
    };

    const bogeyRoundNumber = {
      value: `Round${data[5].rows.length > 1 ? 's' : ''} ${data[5].rows.map(({ round_number }) => round_number).join(', ')}`,
      caption: `${data[5].rows[0].times_knocked_out ?? 0} times`
    };

    return {
      gamesPlayed,
      bogeyRoundNumber,
      mostSelected,
      mostSuccessful,
      leastSuccessful,
      bogeyTeam,
      homeSuccess,
      awaySuccess
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
