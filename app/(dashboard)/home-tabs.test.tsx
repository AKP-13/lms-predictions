import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HomeTabs } from './home-tabs';

function renderHomeTabs(tab: string | null, onTabChange = vi.fn()) {
  render(
    <HomeTabs
      tab={tab}
      onTabChange={onTabChange}
      thisWeek={<p>The pick form</p>}
      fixtures={<p>The fixtures</p>}
      injuries={<p>The injuries</p>}
      table={<p>The league table</p>}
      planner={<p>The Pick Planner</p>}
    />
  );
  return onTabChange;
}

describe('HomeTabs', () => {
  afterEach(cleanup);

  it('opens This week when the URL has no tab', () => {
    renderHomeTabs(null);

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'This week'
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('The pick form');
  });

  it.each([
    ['this-week', 'This week', 'The pick form'],
    ['fixtures', 'Fixtures', 'The fixtures'],
    ['injuries', 'Injuries', 'The injuries'],
    ['table', 'Table', 'The league table'],
    ['planner', 'Planner', 'The Pick Planner']
  ])('opens %s and shows only its panel', (tab, label, content) => {
    renderHomeTabs(tab);

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      label
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent(content);
  });

  it('opens This week when the URL has an unknown tab', () => {
    renderHomeTabs('research');

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'This week'
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('The pick form');
  });

  it('calls the change callback with the tab the player taps', () => {
    const onTabChange = renderHomeTabs(null);

    // Radix selects a tab on mouse down, not on click.
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Planner' }));

    expect(onTabChange).toHaveBeenCalledWith('planner');
  });
});
