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
  ThumbsDownIcon
} from 'lucide-react';

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
    <div className="grid gap-6 md:gap-8 grid-cols-4">
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
    <div className="grid gap-6 md:gap-8 grid-cols-4">
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
      <div className="flex p-2 md:p-3 items-center">
        {Icon ? <Icon className={`h-6 w-6 text-blue-400`} /> : null}
        <h3 className="ml-2 text-sm md:text-base font-semibold text-gray-700">{title}</h3>
      </div>
      <p className={`truncate rounded-xl px-2 md:px-4 py-3 md:py-4 text-center text-xl md:text-4xl font-bold text-gray-900`}>
        {value}
      </p>
      {caption && (
        <p
          className={`truncate rounded-xl px-2 md:px-4 py-2 md:py-3 text-center text-sm md:text-base font-medium ${color}`}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

const SkeletonTile = () => {
  const Icon = iconMap['loading'];
  return (
    <div className="rounded-2xl bg-white p-4 md:p-6 shadow-md grid col-span-2 md:col-span-1 animate-pulse">
      <div className="flex p-3 items-center">
        <Icon className={`h-6 w-6 text-blue-400 animate-spin`} />
        <div className="ml-2 h-5 w-28 bg-gray-300 rounded" />
      </div>
      <div className="h-10 w-3/4 bg-gray-300 rounded mx-auto my-3" />
      <div className="h-5 w-1/2 bg-gray-200 rounded mx-auto my-2" />
    </div>
  );
};
