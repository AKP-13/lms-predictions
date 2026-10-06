import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HomeTabs } from './home-tabs';

function renderHomeTabs(tab: string | null, onTabChange = vi.fn()) {
  render(
    <HomeTabs
      tab={tab}
      onTabChange={onTabChange}
      home={<p>The pick form</p>}
      fixtures={<p>The fixtures</p>}
      injuries={<p>The injuries</p>}
      table={<p>The league table</p>}
      planner={<p>The Pick Planner</p>}
      results={<p>The results table</p>}
    />
  );
  return onTabChange;
}

describe('HomeTabs', () => {
  afterEach(cleanup);

  it('lists the six tabs, with Home first', () => {
    renderHomeTabs(null);

    expect(
      screen.getAllByRole('tab').map((tab) => tab.textContent)
    ).toEqual(['Home', 'Fixtures', 'Injuries', 'Table', 'Planner', 'Results']);
  });

  it.each([
    ['no tab', null],
    ['an unknown tab', 'research'],
    ['the old this-week tab', 'this-week']
  ])('opens Home when the URL has %s', (_, tab) => {
    renderHomeTabs(tab);

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'Home'
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('The pick form');
  });

  it.each([
    ['home', 'Home', 'The pick form'],
    ['fixtures', 'Fixtures', 'The fixtures'],
    ['injuries', 'Injuries', 'The injuries'],
    ['table', 'Table', 'The league table'],
    ['planner', 'Planner', 'The Pick Planner'],
    ['results', 'Results', 'The results table']
  ])('opens %s and shows only its panel', (tab, label, content) => {
    renderHomeTabs(tab);

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      label
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent(content);
  });

  it.each([
    ['Planner', 'planner'],
    ['Results', 'results'],
    ['Home', 'home']
  ])('calls the change callback when the player taps %s', (label, value) => {
    const onTabChange = renderHomeTabs('fixtures');

    // Radix selects a tab on mouse down, not on click.
    fireEvent.mouseDown(screen.getByRole('tab', { name: label }));

    expect(onTabChange).toHaveBeenCalledWith(value);
  });
});
