import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { Results } from '@/lib/definitions';
import { ResultsTable } from './results-table';

function pick(
  gameId: number,
  round: number,
  overrides: Partial<Results> & Pick<Results, 'team_selected' | 'team_opposing'>
): Results {
  return {
    id: gameId * 100 + round,
    user_id: 'user-1',
    game_id: gameId,
    round_number: round,
    team_selected_location: 'Home',
    result_selected: 'Win',
    correct: true,
    fpl_gw: round,
    team_selected_score: 2,
    team_opposing_score: 0,
    ...overrides
  };
}

// Game 1: out in round 1. Game 2: safe, safe, then out in round 3.
const results: Record<number, Results[]> = {
  1: [
    pick(1, 1, {
      team_selected: 'West Ham',
      team_opposing: 'Everton',
      correct: false,
      team_selected_score: 0,
      team_opposing_score: 1
    })
  ],
  2: [
    pick(2, 1, { team_selected: 'Man Utd', team_opposing: 'Fulham' }),
    pick(2, 2, {
      team_selected: 'Arsenal',
      team_opposing: 'Spurs',
      team_selected_score: 3,
      team_opposing_score: 1
    }),
    pick(2, 3, {
      team_selected: 'Chelsea',
      team_opposing: 'Brighton',
      team_selected_location: 'Away',
      correct: false,
      team_selected_score: 1,
      team_opposing_score: 2
    })
  ]
};

function bodyRows() {
  const [, ...rows] = screen.getAllByRole('row');
  return rows;
}

describe('ResultsTable', () => {
  afterEach(cleanup);

  it('shows one row for each game and one column for each round', () => {
    render(<ResultsTable results={results} isSignedIn />);

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual(['Game', 'Round 1', 'Round 2', 'Round 3']);

    const rows = bodyRows();
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByRole('rowheader')).toHaveTextContent('1');
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('2');
    expect(within(rows[0]).getAllByRole('cell')).toHaveLength(3);
    expect(within(rows[1]).getAllByRole('cell')).toHaveLength(3);
  });

  it('shows the home team above the away team, with goals and the pick marked', () => {
    render(<ResultsTable results={results} isSignedIn />);

    const homePick = within(bodyRows()[1]).getAllByRole('cell')[1];
    expect(homePick).toHaveTextContent(/^Arsenal\s*3\s*Spurs\s*1$/);
    expect(within(homePick).getByRole('strong')).toHaveTextContent('Arsenal');

    const awayPick = within(bodyRows()[1]).getAllByRole('cell')[2];
    expect(awayPick).toHaveTextContent(/^Brighton\s*2\s*Chelsea\s*1$/);
    expect(within(awayPick).getByRole('strong')).toHaveTextContent('Chelsea');
  });

  it('labels each cell safe or out, not by colour only', () => {
    render(<ResultsTable results={results} isSignedIn />);

    const [gameOne, gameTwo] = bodyRows();
    const outCell = within(gameOne).getAllByRole('cell')[0];
    const [safeCell, , lastOutCell] = within(gameTwo).getAllByRole('cell');

    expect(within(safeCell).getByRole('img', { name: 'Safe' })).toBeVisible();
    expect(within(safeCell).queryByRole('img', { name: 'Out' })).toBeNull();
    expect(within(outCell).getByRole('img', { name: 'Out' })).toBeVisible();
    expect(within(lastOutCell).getByRole('img', { name: 'Out' })).toBeVisible();
  });

  it('explains the labels in a Safe and Out key', () => {
    render(<ResultsTable results={results} isSignedIn />);

    const key = screen.getByRole('list', { name: 'Key' });
    expect(
      within(key)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['Safe', 'Out']);
  });

  it('shows a signed-out visitor the sign-in link and no table', () => {
    render(<ResultsTable results={{}} isSignedIn={false} />);

    expect(
      screen.getByRole('link', { name: 'Sign in to get started' })
    ).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
