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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const iconMap = {
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

const infoDescriptions = {
  gamesPlayed: 'Total number of games you have participated in, with your furthest round reached displayed below.',
  mostSelected: 'The team you have selected most frequently across all games.',
  mostSuccessful: 'The team with your highest success rate, considering only teams picked at least 3 times.',
  leastSuccessful: 'The team with your lowest success rate, considering only teams picked at least 3 times.',
  bogeyTeam: 'The opposing team that has knocked you out the most times across all games.',
  homeSuccess: 'Your success rate when picking teams playing at home.',
  awaySuccess: 'Your success rate when picking teams playing away.',
  bogeyRound: 'The round(s) in which you have been knocked out most frequently across all games.'
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
  type:
    | 'gamesPlayed'
    | 'mostSelected'
    | 'mostSuccessful'
    | 'leastSuccessful'
    | 'bogeyTeam'
    | 'homeSuccess'
    | 'awaySuccess'
    | 'bogeyRound';
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
    <div className="rounded-xl bg-white p-2 shadow-sm grid col-span-2 md:col-span-1">
      <div className="flex p-2 md:p-4 items-center justify-between">
        <div className="flex items-center">
          {Icon ? <Icon className={`h-5 w-5 text-blue-300`} /> : null}
          <h3 className="ml-2 text-sm font-medium">{title}</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={showInfo ? 'Hide info' : 'Show info'}
        >
          {showInfo ? (
            <X className="h-4 w-4 text-gray-600" />
          ) : (
            <Info className="h-4 w-4 text-gray-600" />
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
              {infoDescriptions[type] || 'Information about this tile.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className={`truncate rounded-xl px-2 md:px-4 py-2 text-center text-2xl`}>
              {value}
            </p>
            {caption && (
              <p
                className={`truncate rounded-xl px-2 md:px-4 py-2 md:py-4 text-center text-small italic ${color}`}
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
