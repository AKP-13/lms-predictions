import useTileData from 'app/hooks/useTileData';
import {
  ArrowUpWideNarrowIcon,
  AngryIcon,
  BadgePlusIcon,
  BadgeXIcon,
  Hash,
  HouseIcon,
  Loader,
  SignpostIcon,
  ThumbsDownIcon,
  Info,
  X,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState } from 'react';

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

const iconMap: Record<TileType | 'loading', LucideIcon> = {
  gamesPlayed: Hash,
  mostSelected: ArrowUpWideNarrowIcon,
  mostSuccessful: BadgePlusIcon,
  leastSuccessful: BadgeXIcon,
  bogeyTeam: AngryIcon,
  homeSuccess: HouseIcon,
  awaySuccess: SignpostIcon,
  bogeyRound: ThumbsDownIcon,
  loading: Loader
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

/** Shorter labels for mobile so titles fit without truncation. */
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
  {
    type: 'gamesPlayed',
    title: 'Games Played',
    dataKey: 'gamesPlayed',
    getVariant: () => 'success'
  },
  {
    type: 'bogeyRound',
    title: 'Bogey Round',
    dataKey: 'bogeyRoundNumber',
    getVariant: (s) =>
      s.caption === CAPTION_NEVER_KNOCKED_OUT ? 'success' : 'error'
  },
  {
    type: 'mostSelected',
    title: 'Most picked team',
    dataKey: 'mostSelected',
    getVariant: () => 'success'
  },
  {
    type: 'mostSuccessful',
    title: 'Most Successful Pick',
    dataKey: 'mostSuccessful',
    getVariant: () => 'success'
  },
  {
    type: 'leastSuccessful',
    title: 'Least Successful Pick',
    dataKey: 'leastSuccessful',
    getVariant: () => 'error'
  },
  {
    type: 'bogeyTeam',
    title: 'Bogey Team',
    dataKey: 'bogeyTeam',
    getVariant: (s) =>
      s.caption === CAPTION_NEVER_KNOCKED_OUT ? 'success' : 'error'
  },
  {
    type: 'homeSuccess',
    title: 'Home Pick Success',
    dataKey: 'homeSuccess',
    getVariant: (s) => (s.value === 'N/A' ? 'error' : 'success')
  },
  {
    type: 'awaySuccess',
    title: 'Away Pick Success',
    dataKey: 'awaySuccess',
    getVariant: (s) => (s.value === 'N/A' ? 'error' : 'success')
  }
];

/** Tiles shown when user has no games played (subset, same order as design). */
const EMPTY_STATE_TILE_TYPES: TileType[] = [
  'gamesPlayed',
  'mostSelected',
  'bogeyRound',
  'bogeyTeam'
];

export default function TileWrapper({
  refreshTrigger
}: {
  refreshTrigger: number;
}) {
  const { data, isLoading } = useTileData({ refreshTrigger });
  const isEmpty = data.gamesPlayed.value === 0;

  const configs = isEmpty
    ? TILE_CONFIGS.filter((c) => EMPTY_STATE_TILE_TYPES.includes(c.type))
    : TILE_CONFIGS;

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-4">
      {configs.map(({ type, title, dataKey, getVariant }) => {
        const slice = data[dataKey];
        return (
          <Tile
            key={type}
            caption={isEmpty ? 'Insufficient data' : slice.caption}
            isLoading={isLoading}
            title={title}
            type={type}
            value={isLoading ? '...' : slice.value}
            variant={isEmpty ? 'default' : getVariant(slice)}
          />
        );
      })}
    </div>
  );
}

export interface TileProps {
  caption?: string;
  isLoading: boolean;
  title: string;
  type: TileType;
  value: number | string;
  variant?: TileVariant;
}

function TileComponent({
  caption,
  isLoading,
  title,
  type,
  value,
  variant = 'default'
}: TileProps) {
  const [showInfo, setShowInfo] = useState(false);
  const Icon = iconMap[isLoading ? 'loading' : type];

  const color =
    variant === 'error'
      ? 'text-red-500'
      : variant === 'success'
        ? 'text-green-500'
        : 'text-gray-500';

  return isLoading ? (
    <SkeletonTile />
  ) : (
    <div className="rounded-2xl bg-white p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-200 grid col-span-2 md:col-span-1">
      {/* Label row: short title on mobile so it fits; full title on desktop */}
      <div className="flex p-2 md:p-4 items-center justify-between gap-2 border-b border-gray-100 min-h-0 min-w-0">
        <div className="flex items-center min-w-0 flex-1 overflow-hidden">
          {Icon ? (
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-blue-300 flex-shrink-0" />
          ) : null}
          <h3 className="ml-2 text-sm md:text-base font-semibold text-gray-700">
            <span className="md:hidden">{shortTitles[type]}</span>
            <span className="hidden md:inline">{title}</span>
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={showInfo ? 'Hide info' : 'Show info'}
        >
          {showInfo ? (
            <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" />
          ) : (
            <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showInfo ? (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-2 md:px-4 py-2 md:py-4"
          >
            <p className="text-sm text-gray-700 leading-relaxed">
              {infoDescriptions[type]}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-2 md:px-4 py-3 md:py-4 min-w-0 overflow-hidden"
          >
            <p
              className="text-2xl font-semibold text-gray-900 text-left md:text-center truncate"
              title={typeof value === 'string' ? value : String(value)}
            >
              {value}
            </p>
            {caption && (
              <p
                className={`mt-0.5 text-xs md:text-sm italic text-left md:text-center truncate ${color}`}
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
  const Icon = iconMap.loading;
  return (
    <div className="rounded-2xl bg-white p-4 md:p-6 shadow-md grid col-span-2 md:col-span-1 animate-pulse">
      <div className="flex p-3 items-center">
        <Icon className="h-6 w-6 text-blue-400 animate-spin" />
        <div className="ml-2 h-5 w-28 bg-gray-300 rounded" />
      </div>
      <div className="h-10 w-3/4 bg-gray-300 rounded mx-auto my-3" />
      <div className="h-5 w-1/2 bg-gray-200 rounded mx-auto my-2" />
    </div>
  );
}
