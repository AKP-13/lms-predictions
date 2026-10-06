'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const homeTabs = [
  { value: 'home', label: 'Home' },
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'injuries', label: 'Injuries' },
  { value: 'table', label: 'Table' },
  { value: 'planner', label: 'Planner' },
  { value: 'results', label: 'Results' }
] as const;

export type HomeTab = (typeof homeTabs)[number]['value'];

function toHomeTab(tab: string | null): HomeTab {
  return homeTabs.find(({ value }) => value === tab)?.value ?? 'home';
}

export type DesktopView = 'home' | 'planner' | 'results';

// Desktop has no Fixtures, Injuries or Table tab, so those show the Home view.
export function toDesktopView(tab: string | null): DesktopView {
  const selected = toHomeTab(tab);
  return selected === 'planner' || selected === 'results' ? selected : 'home';
}

export function desktopViewHref(view: DesktopView) {
  return view === 'home' ? '/' : `/?tab=${view}`;
}

// The `md` breakpoint, where the top bar replaces the phone header.
export const desktopQuery = '(min-width: 768px)';

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

const EDGE_CLASSES =
  'pointer-events-none absolute inset-y-0 flex w-10 items-center text-muted-foreground transition-opacity';

function PhoneTabList({
  selected,
  isDesktop
}: {
  selected: HomeTab;
  isDesktop: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const hasCentred = useRef(false);
  const [more, setMore] = useState({ left: false, right: false });

  // Show a chevron at each end that has more tabs.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const left = list.scrollLeft > 1;
      const right = list.scrollLeft < list.scrollWidth - list.clientWidth - 1;
      setMore((prev) =>
        prev.left === left && prev.right === right ? prev : { left, right }
      );
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Centre the selected tab. Not scrollIntoView, which can scroll the page too.
  useEffect(() => {
    const list = listRef.current;
    const trigger = list?.querySelector('[data-state="active"]');
    if (isDesktop || !list || !trigger) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = trigger.getBoundingClientRect();
    // Jump on page load, slide after a tap.
    list.style.scrollBehavior = hasCentred.current ? 'smooth' : 'auto';
    list.scrollLeft +=
      tabBox.left + tabBox.width / 2 - (listBox.left + listBox.width / 2);
    hasCentred.current = true;
  }, [selected, isDesktop]);

  return (
    <div className="relative md:hidden">
      <TabsList
        ref={listRef}
        className="flex w-full justify-start overflow-x-auto [scrollbar-width:none]"
      >
        {homeTabs.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="flex-1 px-4">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <span
        aria-hidden="true"
        className={cn(
          EDGE_CLASSES,
          'left-0 rounded-l-full bg-gradient-to-l from-transparent to-chip to-60% pl-2',
          !more.left && 'opacity-0'
        )}
      >
        <ChevronLeft className="size-4" />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          EDGE_CLASSES,
          'right-0 justify-end rounded-r-full bg-gradient-to-r from-transparent to-chip to-60% pr-2',
          !more.right && 'opacity-0'
        )}
      >
        <ChevronRight className="size-4" />
      </span>
    </div>
  );
}

export function HomeTabs({
  tab,
  onTabChange,
  home,
  fixtures,
  injuries,
  table,
  planner,
  results
}: {
  tab: string | null;
  onTabChange: (tab: HomeTab) => void;
  home: ReactNode;
  fixtures: ReactNode;
  injuries: ReactNode;
  table: ReactNode;
  planner: ReactNode;
  results: ReactNode;
}) {
  const selected = toHomeTab(tab);
  const isDesktop = useIsDesktop();
  const view = toDesktopView(selected);

  // A phone shows the selected tab. Desktop shows the panels of the selected view.
  const isShown = (value: HomeTab) =>
    isDesktop ? toDesktopView(value) === view : value === selected;

  // All panels stay mounted, so a form keeps its state when the player changes tab.
  const panel = (value: HomeTab, className = '') =>
    ({
      value,
      forceMount: true,
      hidden: !isShown(value),
      className: `mt-0 max-md:my-6 max-md:data-[state=inactive]:hidden [&[hidden]]:hidden ${className}`,
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
      className="md:flex md:flex-col md:gap-5"
    >
      <PhoneTabList selected={selected} isDesktop={isDesktop} />

      <TabsContent {...panel('home')}>{home}</TabsContent>

      <div
        hidden={isDesktop && view !== 'home'}
        className="grid gap-5 grid-cols-1 md:grid-cols-4 max-md:contents [&[hidden]]:hidden"
      >
        <div className="w-full md:col-span-2 relative max-md:contents">
          <div className="flex flex-col gap-5 md:absolute md:inset-0 max-md:contents">
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

      <TabsContent {...panel('planner', 'w-full overflow-x-auto')}>
        {planner}
      </TabsContent>

      <TabsContent {...panel('results')}>{results}</TabsContent>
    </Tabs>
  );
}
