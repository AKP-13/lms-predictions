import useTileData from 'app/hooks/useTileData';
import {
  ChevronRight,
  CircleX,
  Flag,
  Frown,
  Hash,
  House,
  Info,
  Repeat,
  ThumbsDown,
  Trophy,
  X,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState } from 'react';
import { toneClasses, type Tone } from '@/components/ui/tones';
import { cn } from '@/lib/utils';

type TileType =
  | 'gamesPlayed'
  | 'mostSelected'
  | 'mostSuccessful'
  | 'leastSuccessful'
  | 'bogeyTeam'
  | 'homeSuccess'
  | 'awaySuccess'
  | 'bogeyRound';

type TileVariant = 'success' | 'error' | 'default';

/** Caption that indicates user has never been knocked out; used for variant logic. */
const CAPTION_NEVER_KNOCKED_OUT = 'Yet to be knocked out!';

const iconMap: Record<TileType, LucideIcon> = {
  gamesPlayed: Hash,
  mostSelected: Repeat,
  mostSuccessful: Trophy,
  leastSuccessful: CircleX,
  bogeyTeam: Frown,
  homeSuccess: House,
  awaySuccess: Flag,
  bogeyRound: ThumbsDown
};

const iconTones: Record<TileType, Tone> = {
  gamesPlayed: 'accent',
  mostSelected: 'tint',
  mostSuccessful: 'success',
  leastSuccessful: 'destructive',
  bogeyTeam: 'destructive',
  homeSuccess: 'accent',
  awaySuccess: 'accent',
  bogeyRound: 'destructive'
};

const captionTones: Record<TileVariant, string> = {
  success: 'text-success',
  error: 'text-destructive',
  default: 'text-muted-foreground'
};

const infoDescriptions: Record<TileType, string> = {
  gamesPlayed:
    'Total number of games you have participated in, with your furthest round reached displayed below.',
  mostSelected: 'The team you have selected most frequently across all games.',
  mostSuccessful:
    'The team with your highest success rate, considering only teams picked at least 3 times.',
  leastSuccessful:
    'The team with your lowest success rate, considering only teams picked at least 3 times.',
  bogeyTeam:
    'The opposing team that has knocked you out the most times across all games.',
  homeSuccess: 'Your success rate when picking teams playing at home.',
  awaySuccess: 'Your success rate when picking teams playing away.',
  bogeyRound:
    'The round(s) in which you have been knocked out most frequently across all games.'
};

/** Shorter labels for the narrow desktop columns below xl. */
const shortTitles: Record<TileType, string> = {
  gamesPlayed: 'Games',
  mostSelected: 'Most picked',
  mostSuccessful: 'Best pick',
  leastSuccessful: 'Worst pick',
  bogeyTeam: 'Bogey team',
  homeSuccess: 'Home',
  awaySuccess: 'Away',
  bogeyRound: 'Bogey round'
};

type TileDataSlice = { value: number | string; caption: string };
type TileDataKey = keyof ReturnType<typeof useTileData>['data'];

/** Static config for each tile: type, label, data key, and variant logic. Single source of truth for adding/removing tiles. */
const TILE_CONFIGS: Array<{
  type: TileType;
  title: string;
  dataKey: TileDataKey;
  getVariant: (slice: TileDataSlice) => TileVariant;
}> = [
  { type: 'gamesPlayed', title: 'Games played', dataKey: 'gamesPlayed', getVariant: () => 'success' },
  {
    type: 'bogeyRound',
    title: 'Bogey round',
    dataKey: 'bogeyRoundNumber',
    getVariant: (s) => (s.caption === CAPTION_NEVER_KNOCKED_OUT ? 'success' : 'error')
  },
  { type: 'mostSelected', title: 'Most picked team', dataKey: 'mostSelected', getVariant: () => 'success' },
  { type: 'mostSuccessful', title: 'Most successful pick', dataKey: 'mostSuccessful', getVariant: () => 'success' },
  { type: 'leastSuccessful', title: 'Least successful pick', dataKey: 'leastSuccessful', getVariant: () => 'error' },
  {
    type: 'bogeyTeam',
    title: 'Bogey team',
    dataKey: 'bogeyTeam',
    getVariant: (s) => (s.caption === CAPTION_NEVER_KNOCKED_OUT ? 'success' : 'error')
  },
  {
    type: 'homeSuccess',
    title: 'Home pick success',
    dataKey: 'homeSuccess',
    getVariant: (s) => (s.value === 'N/A' ? 'error' : 'success')
  },
  {
    type: 'awaySuccess',
    title: 'Away pick success',
    dataKey: 'awaySuccess',
    getVariant: (s) => (s.value === 'N/A' ? 'error' : 'success')
  }
];

/** Tiles shown when user has no games played (subset, same order as design). */
const EMPTY_STATE_TILE_TYPES: TileType[] = ['gamesPlayed', 'mostSelected', 'bogeyRound', 'bogeyTeam'];

const TILE_CLASSES =
  'flex min-w-0 flex-col gap-2 rounded-[1.25rem] bg-card p-3.5 shadow-card max-md:flex-[0_0_10rem] max-md:snap-start md:p-2.5 lg:p-3.5';

export default function TileWrapper({
  refreshTrigger
}: {
  refreshTrigger: number;
}) {
  const { data, isLoading } = useTileData({ refreshTrigger });
  const isEmpty = !isLoading && data.gamesPlayed.value === 0;

  const configs = isEmpty
    ? TILE_CONFIGS.filter((c) => EMPTY_STATE_TILE_TYPES.includes(c.type))
    : TILE_CONFIGS;

  return (
    <section aria-labelledby="season-heading">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2
          id="season-heading"
          className="text-[0.9375rem] font-extrabold leading-5 md:text-base"
        >
          Your season
        </h2>
        <p className="flex items-center gap-1 text-[0.8125rem] font-semibold leading-[1.125rem] text-muted-foreground md:hidden">
          Swipe for more
          <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
        </p>
      </div>

      {/* On a phone the row bleeds to the screen edges and scrolls sideways. */}
      <div
        className={cn(
          'max-md:-mx-4 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:gap-2.5 max-md:overflow-x-auto max-md:scroll-px-4 max-md:px-4 max-md:pb-1.5 max-md:pt-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'md:mt-2.5 md:grid md:gap-2 lg:gap-3',
          configs.length === TILE_CONFIGS.length
            ? 'md:grid-cols-8'
            : 'md:grid-cols-4'
        )}
      >
        {configs.map(({ type, title, dataKey, getVariant }) => {
          const slice = data[dataKey];
          return isLoading ? (
            <SkeletonTile key={type} />
          ) : (
            <Tile
              key={type}
              caption={isEmpty ? 'Insufficient data' : slice.caption}
              title={title}
              type={type}
              value={slice.value}
              variant={isEmpty ? 'default' : getVariant(slice)}
            />
          );
        })}
      </div>
    </section>
  );
}

export interface TileProps {
  caption?: string;
  title: string;
  type: TileType;
  value: number | string;
  variant?: TileVariant;
}

function TileComponent({
  caption,
  title,
  type,
  value,
  variant = 'default'
}: TileProps) {
  const [showInfo, setShowInfo] = useState(false);
  const Icon = iconMap[type];

  return (
    <div className={TILE_CLASSES}>
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            'flex size-[1.875rem] shrink-0 items-center justify-center rounded-full',
            toneClasses[iconTones[type]]
          )}
        >
          <Icon aria-hidden="true" className="size-4" strokeWidth={2.25} />
        </span>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={showInfo ? `Hide info about ${title}` : `Show info about ${title}`}
          aria-expanded={showInfo}
        >
          {showInfo ? (
            <X aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          ) : (
            <Info aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {showInfo ? (
          <motion.p
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-semibold leading-4 text-muted-foreground"
          >
            {infoDescriptions[type]}
          </motion.p>
        ) : (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex min-w-0 flex-col gap-2"
          >
            <h3 className="line-clamp-2 min-h-8 text-xs font-bold leading-4 text-muted-foreground">
              <span className="md:hidden xl:inline">{title}</span>
              <span className="hidden md:inline xl:hidden">
                {shortTitles[type]}
              </span>
            </h3>
            <p
              className="line-clamp-2 break-words text-[1.375rem] font-extrabold leading-[1.625rem] md:text-[0.9375rem] md:leading-5 lg:text-lg lg:leading-6 xl:text-[1.375rem] xl:leading-[1.625rem]"
              title={String(value)}
            >
              {value}
            </p>
            {caption && (
              <p
                className={cn(
                  'line-clamp-2 text-xs font-bold leading-4',
                  captionTones[variant]
                )}
                title={caption}
              >
                {caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Memoized to avoid re-renders when parent updates but props are unchanged (e.g. other tiles in the grid). */
export const Tile = memo(TileComponent);

function SkeletonTile() {
  return (
    <div aria-hidden="true" className={cn(TILE_CLASSES, 'animate-pulse')}>
      <div className="size-[1.875rem] rounded-full bg-chip" />
      <div className="h-4 w-3/4 rounded-full bg-chip" />
      <div className="h-6 w-full rounded-full bg-chip" />
      <div className="h-4 w-1/2 rounded-full bg-chip" />
    </div>
  );
}
