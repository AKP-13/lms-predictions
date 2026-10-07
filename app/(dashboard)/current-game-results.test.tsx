import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { CurrentGameResults } from '@/lib/definitions';
import CurrentGame from './current-game-results';

function pick(
  round: number,
  overrides: Partial<CurrentGameResults> &
    Pick<CurrentGameResults, 'team_selected' | 'team_opposing'>
): CurrentGameResults {
  return {
    id: round,
    user_id: 'user-1',
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

const safe = pick(1, { team_selected: 'Arsenal', team_opposing: 'Spurs' });
const out = pick(2, {
  team_selected: 'Chelsea',
  team_opposing: 'Brighton',
  team_selected_location: 'Away',
  correct: false,
  team_selected_score: 1,
  team_opposing_score: 2
});
// The results table stores a pick without a result as null.
const pending = pick(2, {
  team_selected: 'Newcastle',
  team_opposing: 'Everton',
  correct: null as unknown as boolean
});

function renderCard(
  props: Partial<Parameters<typeof CurrentGame>[0]> = {}
) {
  return render(
    <CurrentGame
      currentGameResults={[safe, out]}
      leagueName="The League"
      isLoading={false}
      isSignedIn
      {...props}
    />
  );
}

function roundCells() {
  return within(screen.getByRole('table')).getAllByRole('cell');
}

describe('CurrentGame', () => {
  afterEach(cleanup);

  it('shows one column for each round', () => {
    renderCard();

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual(['Round 1', 'Round 2']);
  });

  it('shows both teams and the score, with the pick marked', () => {
    renderCard();

    const [safeCell, outCell] = roundCells();
    expect(safeCell).toHaveTextContent(/^Arsenal\s*2\s*Spurs\s*0$/);
    expect(within(safeCell).getByRole('strong')).toHaveTextContent('Arsenal');
    expect(outCell).toHaveTextContent(/^Brighton\s*2\s*Chelsea\s*1$/);
    expect(within(outCell).getByRole('strong')).toHaveTextContent('Chelsea');
  });

  it('labels each round safe or out, not by colour only', () => {
    renderCard();

    const [safeCell, outCell] = roundCells();
    expect(within(safeCell).getByRole('img', { name: 'Safe' })).toBeVisible();
    expect(within(outCell).getByRole('img', { name: 'Out' })).toBeVisible();
  });

  it('tells an eliminated player what happens next', () => {
    renderCard();

    expect(
      screen.getByText(
        'You are eliminated and will get an email when the new game starts.'
      )
    ).toBeVisible();
  });

  it('shows a pick without a result as pending, with an edit link', () => {
    renderCard({ currentGameResults: [safe, pending] });

    const pendingCell = roundCells()[1];
    expect(pendingCell).toHaveTextContent('Pending');
    expect(within(pendingCell).queryByRole('img')).toBeNull();
    expect(
      within(pendingCell).getByRole('link', { name: 'Edit' })
    ).toHaveAttribute('href', expect.stringMatching(/^mailto:/));
    expect(screen.queryByText(/You are eliminated/)).not.toBeInTheDocument();
  });

  it('shows a signed-out visitor the sign-in link and no table', () => {
    renderCard({ currentGameResults: [], isSignedIn: false });

    expect(
      screen.getByRole('link', { name: 'Sign in to get started' })
    ).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('asks a player with no league to join one', () => {
    renderCard({ currentGameResults: [], leagueName: null });

    expect(screen.getByText('Join a league to get started.')).toBeVisible();
  });

  it('asks a player with no picks in this game to make one', () => {
    renderCard({ currentGameResults: [] });

    expect(
      screen.getByText('Submit a prediction to begin seeing results here.')
    ).toBeVisible();
  });
});
