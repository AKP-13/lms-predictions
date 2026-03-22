import { afterEach, describe, expect, it } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import PlayerTable from './player-table';
import { FplPlayerMetrics } from '@/lib/fpl-team-builder/types';

afterEach(() => {
  cleanup();
});

const players: FplPlayerMetrics[] = [
  {
    elementType: 3,
    nowCost: 10.1,
    webName: 'Saka',
    teamEng: 'Arsenal',
    minutes: 2950,
    mp: 28,
    starts: 34,
    subs: 4,
    unsub: 0,
    goalsScored: 16,
    assists: 10,
    cleanSheets: 10,
    goalsConceded: 20,
    ownGoals: 0,
    yellowCards: 5,
    redCards: 0,
    defensiveContribution: 24.2,
    expectedGoals: 14.9,
    expectedAssists: 8.2,
    expectedGoalsConceded: 0
  },
  {
    elementType: 2,
    nowCost: 6.2,
    webName: 'Saliba',
    teamEng: 'Arsenal',
    minutes: 3200,
    mp: 36,
    starts: 36,
    subs: 0,
    unsub: 0,
    goalsScored: 2,
    assists: 1,
    cleanSheets: 15,
    goalsConceded: 22,
    ownGoals: 0,
    yellowCards: 6,
    redCards: 0,
    defensiveContribution: 71.3,
    expectedGoals: 1.8,
    expectedAssists: 0.9,
    expectedGoalsConceded: 28.5
  }
];

describe('Team Builder table', () => {
  it('renders rows and filters by search', () => {
    render(<PlayerTable players={players} droppedRows={0} />);

    expect(screen.getByText('Saka')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search players'), {
      target: { value: 'saliba' }
    });
    expect(screen.getByText('Saliba')).toBeInTheDocument();
    expect(screen.queryByText('Saka')).not.toBeInTheDocument();
  });

  it('resets search after filtering', async () => {
    render(<PlayerTable players={players} droppedRows={0} />);

    fireEvent.change(screen.getByLabelText('Search players'), {
      target: { value: 'saliba' }
    });
    await waitFor(() => {
      expect(screen.getAllByText('Saliba').length).toBeGreaterThan(0);
      expect(screen.queryByText('Saka')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByText('Saka')).toBeInTheDocument();
  });
});
