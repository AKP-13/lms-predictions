'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const homeTabs = [
  { value: 'this-week', label: 'This week' },
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'injuries', label: 'Injuries' },
  { value: 'table', label: 'Table' },
  { value: 'planner', label: 'Planner' }
] as const;

export type HomeTab = (typeof homeTabs)[number]['value'];

function toHomeTab(tab: string | null): HomeTab {
  return homeTabs.find(({ value }) => value === tab)?.value ?? 'this-week';
}

const desktopQuery = '(min-width: 768px)';

function subscribe(onChange: () => void) {
  const desktop = window.matchMedia(desktopQuery);
  desktop.addEventListener('change', onChange);
  return () => desktop.removeEventListener('change', onChange);
}

// The server renders the desktop markup. The phone CSS hides the inactive panels until hydration.
function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(desktopQuery).matches,
    () => true
  );
}

export function HomeTabs({
  tab,
  onTabChange,
  thisWeek,
  fixtures,
  injuries,
  table,
  planner
}: {
  tab: string | null;
  onTabChange: (tab: HomeTab) => void;
  thisWeek: ReactNode;
  fixtures: ReactNode;
  injuries: ReactNode;
  table: ReactNode;
  planner: ReactNode;
}) {
  const selected = toHomeTab(tab);
  const isDesktop = useIsDesktop();

  // All panels stay mounted, so a form keeps its state when the player changes tab.
  const panel = (value: HomeTab, className = '') =>
    ({
      value,
      forceMount: true,
      hidden: !isDesktop && value !== selected,
      className: `mt-0 max-md:my-6 max-md:data-[state=inactive]:hidden ${className}`,
      ...(isDesktop && {
        role: undefined,
        tabIndex: undefined,
        'aria-labelledby': undefined
      })
    }) as const;

  return (
    <Tabs
      value={selected}
      onValueChange={(value) => onTabChange(toHomeTab(value))}
    >
      <TabsList className="flex w-full justify-start overflow-x-auto md:hidden">
        {homeTabs.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="flex-1 px-2">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent {...panel('this-week')}>{thisWeek}</TabsContent>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4 my-6 max-md:contents">
        <div className="w-full md:col-span-2 relative max-md:contents">
          <div className="flex flex-col gap-6 md:absolute md:inset-0 max-md:contents">
            <TabsContent {...panel('fixtures')}>{fixtures}</TabsContent>

            <TabsContent {...panel('injuries', 'flex-1 min-h-0 flex flex-col')}>
              {injuries}
            </TabsContent>
          </div>
        </div>

        <TabsContent {...panel('table', 'w-full md:col-span-2')}>
          {table}
        </TabsContent>
      </div>

      <TabsContent {...panel('planner', 'w-full overflow-x-auto my-6')}>
        {planner}
      </TabsContent>
    </Tabs>
  );
}
