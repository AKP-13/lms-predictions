import { sql } from '@vercel/postgres';
import { Results } from './definitions';

export async function fetchResultsData() {
  try {
    const data = await sql<Results>`
    SELECT
        round_id
        , team_selected
        , team_opposing
        , team_selected_location
        , result_selected
        , correct
        , fpl_gw
    FROM results;
    `;

    const groupedData: Record<number, Results[]> = data.rows.reduce(
      (acc, current) => {
        const { round_id } = current;
        if (!acc[round_id]) {
          acc[round_id] = [];
        }
        acc[round_id].push(current);
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
