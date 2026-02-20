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
import { useState } from 'react';

type TileType =
  | 'gamesPlayed'
  | 'mostSelected'
  | 'mostSuccessful'
  | 'leastSuccessful'
  | 'bogeyTeam'
  | 'homeSuccess'
  | 'awaySuccess'
  | 'bogeyRound';

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

export default function TileWrapper({
  refreshTrigger
}: {
  refreshTrigger: number;
}) {
  const {
    data: {
      gamesPlayed,
      bogeyRoundNumber,
      mostSelected,
      mostSuccessful,
      leastSuccessful,
      bogeyTeam,
      homeSuccess,
      awaySuccess
    },
    isLoading
  } = useTileData({ refreshTrigger });

  return gamesPlayed.value === 0 ? (
    <div className="grid gap-6 grid-cols-4">
      <Tile
        caption="Insufficient data"
        title="Games Played"
        type="gamesPlayed"
        value={isLoading ? '...' : gamesPlayed.value}
        isLoading={isLoading}
      />
      <Tile
        caption="Insufficient data"
        title="Most picked team"
        type="mostSelected"
        value={isLoading ? '...' : mostSelected.value}
        isLoading={isLoading}
      />
      <Tile
        caption="Insufficient data"
        title="Bogey Round"
        type="bogeyRound"
        value={isLoading ? '...' : bogeyRoundNumber.value}
        isLoading={isLoading}
      />
      <Tile
        caption="Insufficient data"
        title="Bogey Team"
        type="bogeyTeam"
        value={isLoading ? '...' : bogeyTeam.value}
        isLoading={isLoading}
      />
    </div>
  ) : (
    <div className="grid gap-6 grid-cols-4">
      <Tile
        caption={gamesPlayed.caption}
        title="Games Played"
        type="gamesPlayed"
        value={isLoading ? '...' : gamesPlayed.value}
        variant="success"
        isLoading={isLoading}
      />
      <Tile
        caption={bogeyRoundNumber.caption}
        title="Bogey Round"
        type="bogeyRound"
        value={isLoading ? '...' : bogeyRoundNumber.value}
        variant={
          bogeyRoundNumber.caption === 'Yet to be knocked out!'
            ? 'success'
            : 'error'
        }
        isLoading={isLoading}
      />
      <Tile
        caption={mostSelected.caption}
        title="Most picked team"
        type="mostSelected"
        value={isLoading ? '...' : mostSelected.value}
        variant="success"
        isLoading={isLoading}
      />
      <Tile
        caption={mostSuccessful.caption}
        title="Most Successful Pick"
        type="mostSuccessful"
        value={isLoading ? '...' : mostSuccessful.value}
        variant="success"
        isLoading={isLoading}
      />
      <Tile
        caption={leastSuccessful.caption}
        title="Least Successful Pick"
        type="leastSuccessful"
        value={isLoading ? '...' : leastSuccessful.value}
        variant="error"
        isLoading={isLoading}
      />
      <Tile
        caption={bogeyTeam.caption}
        title="Bogey Team"
        type="bogeyTeam"
        value={isLoading ? '...' : bogeyTeam.value}
        variant={
          bogeyTeam.caption === 'Yet to be knocked out!' ? 'success' : 'error'
        }
        isLoading={isLoading}
      />
      <Tile
        caption={homeSuccess.caption}
        title="Home Pick Success"
        type="homeSuccess"
        value={isLoading ? '...' : homeSuccess.value}
        variant={homeSuccess.value === 'N/A' ? 'error' : 'success'}
        isLoading={isLoading}
      />
      <Tile
        caption={awaySuccess.caption}
        title="Away Pick Success"
        type="awaySuccess"
        value={isLoading ? '...' : awaySuccess.value}
        variant={awaySuccess.value === 'N/A' ? 'error' : 'success'}
        isLoading={isLoading}
      />
    </div>
  );
}

export function Tile({
  caption,
  isLoading,
  title,
  type,
  value,
  variant = 'default'
}: {
  caption?: string;
  isLoading: boolean;
  title: string;
  type: TileType;
  value: number | string;
  variant?: 'success' | 'error' | 'default';
}) {
  const [showInfo, setShowInfo] = useState(false);
  const Icon = iconMap[isLoading ? 'loading' : type];

  const color =
    variant === 'error'
      ? 'text-red-400'
      : variant === 'success'
        ? 'text-green-400'
        : 'text-gray-400';

  return isLoading ? (
    <SkeletonTile />
  ) : (
    <div className="rounded-xl bg-white p-2 shadow-sm grid col-span-2 md:col-span-1 content-between border-2 border-transparent transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-blue-200 overflow-hidden min-w-0">
      {/* Label row: short title on mobile so it fits; full title on desktop */}
      <div className="flex p-2 md:p-4 items-center justify-between gap-2 border-b border-gray-100 min-h-0 min-w-0">
        <div className="flex items-center min-w-0 flex-1 overflow-hidden">
          {Icon ? (
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-blue-300 flex-shrink-0" />
          ) : null}
          <h3 className="ml-1.5 md:ml-2 text-xs md:text-sm font-medium text-gray-500 md:text-gray-900 truncate min-w-0">
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

const SkeletonTile = () => {
  const Icon = iconMap['loading'];
  return (
    <div className="rounded-xl bg-white p-2 shadow-sm grid col-span-2 md:col-span-1 animate-pulse">
      <div className="flex p-4">
        <Icon className={`h-5 w-5 text-blue-300 animate-spin`} />
        <div className="ml-2 h-4 w-24 bg-gray-300 rounded" />
      </div>
      <div className="h-8 w-3/4 bg-gray-300 rounded mx-auto my-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mx-auto my-2" />
    </div>
  );
};
