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
    playerName: 'Bukayo Saka',
    position: 'MID',
    fplPrice: 10.1,
    minutesPlayed: 2950,
    appearances: 34,
    goals: 16,
    assists: 10,
    xg: 14.9,
    xa: 8.2,
    defcon: 24.2,
    xga: 0,
    yellowCards: 5,
    redCards: 0
  },
  {
    playerName: 'William Saliba',
    position: 'DEF',
    fplPrice: 6.2,
    minutesPlayed: 3200,
    appearances: 36,
    goals: 2,
    assists: 1,
    xg: 1.8,
    xa: 0.9,
    defcon: 71.3,
    xga: 28.5,
    yellowCards: 6,
    redCards: 0
  }
];

describe('Team Builder table', () => {
  it('renders rows and filters by search', () => {
    render(<PlayerTable players={players} droppedRows={0} />);

    expect(screen.getByText('Bukayo Saka')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search players'), {
      target: { value: 'saliba' }
    });
    expect(screen.getByText('William Saliba')).toBeInTheDocument();
    expect(screen.queryByText('Bukayo Saka')).not.toBeInTheDocument();
  });

  it('filters by position and resets filters', async () => {
    render(<PlayerTable players={players} droppedRows={0} />);

    fireEvent.change(screen.getByLabelText('Position'), {
      target: { value: 'DEF' }
    });
    await waitFor(() => {
      expect(screen.getAllByText('William Saliba').length).toBeGreaterThan(0);
      expect(screen.queryByText('Bukayo Saka')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByText('Bukayo Saka')).toBeInTheDocument();
  });
});
