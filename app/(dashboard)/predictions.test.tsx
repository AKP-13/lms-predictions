import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { Session } from 'next-auth';
import { FixturesData, Results, TeamsArr } from '@/lib/definitions';
import Predictions from './predictions';

const teamsArr: TeamsArr = [
  { id: 1, name: 'Arsenal', short_name: 'ARS' },
  { id: 2, name: 'Brighton', short_name: 'BHA' },
  { id: 3, name: 'Chelsea', short_name: 'CHE' },
  { id: 4, name: 'Everton', short_name: 'EVE' }
];

function fixture(overrides: Partial<FixturesData>): FixturesData {
  return {
    code: 1,
    event: 5,
    finished: false,
    finished_provisional: false,
    id: 1,
    kickoff_time: '2026-09-19T14:00:00Z',
    minutes: 0,
    provisional_start_time: false,
    started: false,
    team_a: 2,
    team_a_score: 0,
    team_h: 1,
    team_h_score: 0,
    stats: [],
    team_h_difficulty: 3,
    team_a_difficulty: 3,
    pulse_id: 1,
    ...overrides
  };
}

// Kickoff 14:00, so picks lock at 12:00.
const predictionWeekFixtures = [
  fixture({ id: 1, team_h: 1, team_a: 2 }),
  fixture({ id: 2, team_h: 3, team_a: 4 })
];

function pick(overrides: Partial<Results>): Results {
  return {
    id: 1,
    user_id: 'user-1',
    game_id: 7,
    team_selected: 'Chelsea',
    team_opposing: 'Everton',
    team_selected_location: 'Home',
    result_selected: 'Win',
    correct: true,
    fpl_gw: 4,
    round_number: 1,
    team_selected_score: 2,
    team_opposing_score: 0,
    ...overrides
  };
}

const session = { user: { id: 'user-1' }, expires: '' } as Session;

function renderForm(props: Partial<Parameters<typeof Predictions>[0]> = {}) {
  return render(
    <Predictions
      results={{}}
      teamsArr={teamsArr}
      session={session}
      predictionWeekFixtures={predictionWeekFixtures}
      predictionGwNumber={5}
      isPastSubmissionDeadline={false}
      setRefreshTrigger={() => {}}
      isLoading={false}
      currentGameId={7}
      {...props}
    />
  );
}

const outcomeButtons = () => [
  screen.getByRole('button', { name: 'Win' }),
  screen.getByRole('button', { name: 'Draw' })
];

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Predictions outcome buttons', () => {
  it('shows Win and Draw as buttons, and only the clicked one is pressed', () => {
    renderForm();
    const [win, draw] = outcomeButtons();

    expect(win).toHaveAttribute('aria-pressed', 'false');
    expect(draw).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(draw);
    expect(draw).toHaveAttribute('aria-pressed', 'true');
    expect(win).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(win);
    expect(win).toHaveAttribute('aria-pressed', 'true');
    expect(draw).toHaveAttribute('aria-pressed', 'false');
  });

  it('enables Win and Draw before the deadline', () => {
    renderForm();
    for (const button of outcomeButtons()) expect(button).toBeEnabled();
  });

  it.each([
    ['past the deadline', { isPastSubmissionDeadline: true }],
    [
      'eliminated',
      { results: { 7: [pick({ correct: false as unknown as boolean })] } }
    ],
    [
      'a pick is pending',
      { results: { 7: [pick({ correct: null as unknown as boolean })] } }
    ],
    ['the gameweek is unresolved', { predictionGwNumber: null }]
  ])('disables Win and Draw when %s', (_, props) => {
    renderForm(props);
    for (const button of outcomeButtons()) expect(button).toBeDisabled();
  });

  it('does not submit the form when an outcome is clicked', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderForm();

    fireEvent.change(screen.getByLabelText('Team'), {
      target: { value: 'Arsenal' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Win' }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Predictions submit', () => {
  it('posts the team, opponent, location, outcome, gameweek and next round', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    renderForm({ results: { 7: [pick({ round_number: 1 })] } });

    const lockIn = screen.getByRole('button', { name: /lock it in/i });
    expect(lockIn).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Team'), {
      target: { value: 'Brighton' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Draw' }));
    expect(lockIn).toBeEnabled();

    fireEvent.click(lockIn);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/predictions');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      team_selected: 'Brighton',
      team_opposing: 'Arsenal',
      team_selected_location: 'Away',
      result_selected: 'Draw',
      fpl_gw: 5,
      round_number: 2
    });
    expect(await screen.findByText('Prediction submitted!')).toBeVisible();
  });

  it('shows the error in words when the submit fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    renderForm();

    fireEvent.change(screen.getByLabelText('Team'), {
      target: { value: 'Arsenal' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Win' }));
    fireEvent.click(screen.getByRole('button', { name: /lock it in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /failed to submit prediction/i
    );
  });
});

describe('Predictions countdown pill', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date('2026-09-19T10:12:00Z'));
  });

  it('shows the time until picks lock and updates once a minute', () => {
    renderForm();
    expect(screen.getByText('1h 48m')).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });
    expect(screen.getByText('1h 47m')).toBeVisible();
  });

  it('goes at the deadline, not up to a minute after it', () => {
    vi.setSystemTime(new Date('2026-09-19T11:59:30Z'));
    renderForm();
    expect(screen.getByText('1m')).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(30 * 1000);
    });
    expect(screen.queryByText(/picks lock in/i)).not.toBeInTheDocument();
  });

  it('still shows when the pick is locked in', () => {
    renderForm({
      results: { 7: [pick({ correct: null as unknown as boolean })] }
    });
    expect(screen.getByText('1h 48m')).toBeVisible();
  });

  it('does not show past the deadline', () => {
    vi.setSystemTime(new Date('2026-09-19T12:30:00Z'));
    renderForm({ isPastSubmissionDeadline: true });
    expect(screen.queryByText(/picks lock in/i)).not.toBeInTheDocument();
  });
});
