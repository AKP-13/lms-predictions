import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react';
import { Session } from 'next-auth';
import { FixturesData, Results, TeamsArr } from '@/lib/definitions';
import PickPlanner from './PickPlanner';

const teams: TeamsArr = [
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

const fixtures = [
  fixture({ id: 1, event: 5, team_h: 1, team_a: 2 }),
  fixture({ id: 2, event: 5, team_h: 3, team_a: 4 }),
  fixture({ id: 3, event: 6, team_h: 2, team_a: 1 }),
  fixture({ id: 4, event: 6, team_h: 4, team_a: 3 })
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

function renderPlanner(props: Partial<Parameters<typeof PickPlanner>[0]> = {}) {
  return render(
    <PickPlanner
      teams={teams}
      fixtures={fixtures}
      predictionGwNumber={5}
      isPastSubmissionDeadline={false}
      numWeeks={2}
      setNumWeeks={() => {}}
      results={{}}
      session={session}
      currentGameId={7}
      {...props}
    />
  );
}

const cell = (name: string | RegExp) => screen.getByRole('button', { name });
const teamRow = (team: string) =>
  screen.getByRole('rowheader', { name: new RegExp(team) });

afterEach(cleanup);

describe('PickPlanner', () => {
  it('shows one column for each week, from the pick week', () => {
    renderPlanner();

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual(['Team', 'GW5', 'GW6']);
  });

  it('plans a pick on a click and clears it on a second click', () => {
    renderPlanner();
    const arsenalGw5 = cell('GW 5, Arsenal, Brighton (H)');

    expect(arsenalGw5).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(arsenalGw5);
    expect(arsenalGw5).toHaveAttribute('aria-pressed', 'true');
    expect(within(teamRow('Arsenal')).getByText('Planned')).toBeInTheDocument();

    fireEvent.click(arsenalGw5);
    expect(arsenalGw5).toHaveAttribute('aria-pressed', 'false');
    expect(within(teamRow('Arsenal')).queryByText('Planned')).toBeNull();
  });

  it('moves a planned team to the week the player clicks', () => {
    renderPlanner();

    fireEvent.click(cell('GW 5, Arsenal, Brighton (H)'));
    fireEvent.click(cell(/^GW 6, Arsenal, Brighton \(A\)/));

    expect(cell(/^GW 5, Arsenal/)).toHaveAttribute('aria-pressed', 'false');
    expect(cell(/^GW 6, Arsenal/)).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables a team that the player used earlier in the game', () => {
    renderPlanner({ results: { 7: [pick({})] } });

    const chelseaGw5 = cell('GW 5, Chelsea, Everton (H), already used');
    expect(chelseaGw5).toBeDisabled();
    expect(
      within(teamRow('Chelsea')).getByText('Used in round 1')
    ).toBeInTheDocument();
  });

  it('shows the submitted pick as the player’s pick', () => {
    renderPlanner({
      results: {
        7: [
          pick({}),
          pick({ team_selected: 'Everton', fpl_gw: 5, round_number: 2 })
        ]
      },
      isPastSubmissionDeadline: true
    });

    const evertonGw5 = cell(/^GW 5, Everton, Chelsea \(A\), submitted/);
    expect(evertonGw5).toHaveAttribute('aria-pressed', 'true');
    expect(evertonGw5).toBeDisabled();
    expect(
      within(teamRow('Everton')).getByText('Your pick')
    ).toBeInTheDocument();
  });

  it('locks the pick week after the deadline', () => {
    renderPlanner({ isPastSubmissionDeadline: true });

    expect(cell(/^GW 5, Arsenal.*locked$/)).toBeDisabled();
    expect(cell(/^GW 6, Arsenal/)).toBeEnabled();
  });

  it('changes the number of weeks with the Weeks select', () => {
    const setNumWeeks = vi.fn();
    renderPlanner({ setNumWeeks });

    fireEvent.change(screen.getByLabelText('Weeks'), {
      target: { value: '6' }
    });

    expect(setNumWeeks).toHaveBeenCalledWith(6);
  });

  it('asks a signed-out visitor to sign in', () => {
    renderPlanner({ session: null });

    expect(
      screen.getByRole('link', { name: 'Sign in to get started' })
    ).toHaveAttribute('href', '/login');
    expect(screen.queryByLabelText('Weeks')).toBeNull();
  });
});
