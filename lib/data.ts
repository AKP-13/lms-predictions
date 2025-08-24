import { sql } from '@vercel/postgres';
import { CurrentGameId, CurrentGameResults, Results } from './definitions';

export async function fetchResultsData({
  userId
}: {
  userId?: string | undefined;
}) {
  try {
    const data = await sql.query<Results>(
      `
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
    FROM results
    WHERE user_id = ($1);
    `,
      [userId]
    );

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

export async function fetchCurrentGameData({
  userId
}: {
  userId?: string | undefined;
}) {
  try {
    const queryResult = await sql<CurrentGameId>`
        SELECT
            MAX(id) AS current_game_id
        FROM rounds;
    `;

    const currentGameId = queryResult.rows[0].current_game_id;

    const currentGameResults = await sql.query<CurrentGameResults>(
      `
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
        WHERE game_id = ($2)
        AND user_id = ($1);
    `,
      [userId, currentGameId]
    );

    return currentGameResults.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch current game results.');
  }
}

export async function fetchTileData({
  userId
}: {
  userId?: string | undefined;
}) {
  try {
    const gamesPlayedQuery = sql.query(
      `
        SELECT 
            CAST(COUNT(DISTINCT game_id) AS INT) AS games_played
            , MAX(round_number) AS furthest_round
        FROM results
        WHERE user_id = ($1);
    `,
      [userId]
    );
    const mostSelectedQuery = sql.query(
      `
        SELECT
            team_selected,
            CAST(COUNT(team_selected) AS INT) AS selection_count
        FROM results
        WHERE user_id = ($1)
        GROUP BY team_selected
        HAVING COUNT(team_selected) = (
            SELECT MAX(selection_count)
            FROM (
                SELECT 
                    COUNT(team_selected) AS selection_count
                FROM results
                WHERE user_id = ($1)
                GROUP BY team_selected
            )
        )
        ORDER BY selection_count DESC;
    `,
      [userId]
    );
    const teamSuccessRatesSql = sql.query(
      `
        WITH results AS (
            SELECT
                r.team_selected
                , CAST(count(r.team_selected) AS NUMERIC) AS times_selected
                , CAST(SUM(CASE WHEN r.correct IS TRUE THEN 1 ELSE 0 END) AS NUMERIC) AS times_correct
                , CAST(SUM(CASE WHEN r.correct IS FALSE THEN 1 ELSE 0 END) AS NUMERIC) AS times_incorrect
            FROM results r
            WHERE user_id = ($1)
            GROUP BY 1
            ORDER BY team_selected
        )

        SELECT 
        *
        , ROUND(times_correct / NULLIF(times_selected, 0) * 100, 0) AS perc_correct
        FROM results
        WHERE times_selected >= 3
        ORDER BY perc_correct DESC;
    `,
      [userId]
    );
    const bogeyTeamSql = sql.query(
      `
        WITH loss_counts AS (
            SELECT
                team_opposing
                , COUNT(team_opposing) AS loss_count
            FROM results
            WHERE user_id = ($1)
                AND correct = FALSE
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
    `,
      [userId]
    );
    const homeAndAwaySuccessSql = sql.query(
      `
        SELECT 
            team_selected_location,
            SUM(CASE WHEN correct = TRUE THEN 1 ELSE 0 END) AS correct_count,
            COUNT(*) AS total_count,
            100 * SUM(CASE WHEN correct = TRUE THEN 1 ELSE 0 END) / COUNT(*) AS success_percentage
        FROM results
        WHERE user_id = ($1)
        GROUP BY team_selected_location;
    `,
      [userId]
    );
    const bogeyRoundNumberSql = sql.query(
      `
        WITH knocked_out_counts AS (
            SELECT
                DISTINCT round_number
                , COUNT(*) AS times_knocked_out
            FROM results
            WHERE user_id = ($1)
                AND correct = FALSE
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
    `,
      [userId]
    );

    const data = await Promise.all([
      gamesPlayedQuery,
      mostSelectedQuery,
      teamSuccessRatesSql,
      bogeyTeamSql,
      homeAndAwaySuccessSql,
      bogeyRoundNumberSql
    ]);

    const gamesPlayed = {
      value: data[0].rows.length > 0 ? data[0].rows[0].games_played : 0,
      caption: `Furthest round: ${data[0].rows.length > 0 ? data[0].rows[0].furthest_round : 0}`
    };

    const mostSelected = {
      value: data[1].rows.length > 0 ? data[1].rows[0].team_selected : 'N/A',
      caption:
        data[1].rows.length > 0
          ? `${data[1].rows[0].selection_count} times`
          : 'N/A'
    };

    const mostSuccessful = {
      value: data[2].rows.length > 0 ? data[2].rows[0].team_selected : 'N/A',
      caption:
        data[2].rows.length > 0
          ? `${data[2].rows[0].perc_correct}% success rate`
          : 'N/A'
    };

    const leastSuccessful = {
      value:
        data[2].rows.length > 0
          ? data[2].rows[data[2].rows.length - 1].team_selected
          : 'N/A',
      caption:
        data[2].rows.length > 0
          ? `${data[2].rows[data[2].rows.length - 1].perc_correct}% success rate`
          : 'N/A'
    };

    const bogeyTeam = {
      value: data[3].rows.length > 0 ? data[3].rows[0].team_opposing : 'N/A',
      caption:
        data[3].rows.length > 0 ? `${data[3].rows[0].loss_count} times` : 'N/A'
    };

    const homeObjIdx = data[4].rows.findIndex(
      (obj) => obj.team_selected_location === 'Home'
    );

    const awayObjIdx = data[4].rows.findIndex(
      (obj) => obj.team_selected_location === 'Away'
    );

    const homeSuccess = {
      value:
        data[4].rows.length > 0
          ? `${data[4].rows[homeObjIdx]?.success_percentage}%`
          : 'N/A',
      caption:
        data[4].rows.length > 0
          ? `${data[4].rows[homeObjIdx].correct_count} / ${data[4].rows[homeObjIdx].total_count} picks`
          : 'N/A'
    };

    const awaySuccess = {
      value:
        data[4].rows.length > 0
          ? `${data[4].rows[awayObjIdx]?.success_percentage}%`
          : 'N/A',
      caption:
        data[4].rows.length > 0
          ? `${data[4].rows[awayObjIdx].correct_count} / ${data[4].rows[awayObjIdx].total_count} picks`
          : 'N/A'
    };

    const bogeyRoundNumber = {
      value:
        data[5].rows.length > 0
          ? `Round${data[5].rows.length > 1 ? 's' : ''} ${data[5].rows.map(({ round_number }) => round_number).join(', ')}`
          : 'N/A',
      caption:
        data[5].rows.length > 0
          ? `${data[5].rows[0].times_knocked_out ?? 0} times`
          : 'N/A'
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
