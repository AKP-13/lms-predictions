import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  describe('on desktop', () => {
    const panels = [
      'The pick form',
      'The fixtures',
      'The injuries',
      'The league table',
      'The Pick Planner',
      'The results table'
    ];

    function visiblePanels() {
      return panels.filter(
        (content) => screen.getByText(content).closest('[hidden]') === null
      );
    }

    beforeEach(() => {
      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query) =>
          ({
            matches: query === '(min-width: 768px)',
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {}
          }) as unknown as MediaQueryList
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each([
      ['no tab', null],
      ['fixtures', 'fixtures'],
      ['injuries', 'injuries'],
      ['table', 'table']
    ])('shows the Home view for %s', (_, tab) => {
      renderHomeTabs(tab);

      expect(visiblePanels()).toEqual([
        'The pick form',
        'The fixtures',
        'The injuries',
        'The league table'
      ]);
    });

    it.each([
      ['planner', 'The Pick Planner'],
      ['results', 'The results table']
    ])('shows only the %s view', (tab, content) => {
      renderHomeTabs(tab);

      expect(visiblePanels()).toEqual([content]);
    });

    it('keeps every panel mounted', () => {
      renderHomeTabs('planner');

      for (const content of panels) {
        expect(screen.getByText(content)).toBeInTheDocument();
      }
    });
  });
});
