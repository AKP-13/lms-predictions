import useTileData from 'app/hooks/useTileData';
import {
  ArrowUpWideNarrowIcon,
  AngryIcon,
  BadgePlusIcon,
  BadgeXIcon,
  Hash,
  HouseIcon,
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
  bogeyRound: ThumbsDownIcon
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
      />
      <Tile
        caption="Insufficient data"
        title="Most picked team"
        type="mostSelected"
        value={isLoading ? '...' : mostSelected.value}
      />
      <Tile
        caption="Insufficient data"
        title="Bogey Round"
        type="bogeyRound"
        value={isLoading ? '...' : bogeyRoundNumber.value}
      />
      <Tile
        caption="Insufficient data"
        title="Bogey Team"
        type="bogeyTeam"
        value={isLoading ? '...' : bogeyTeam.value}
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
      />
      <Tile
        caption={mostSelected.caption}
        title="Most picked team"
        type="mostSelected"
        value={isLoading ? '...' : mostSelected.value}
        variant="success"
      />
      <Tile
        caption={mostSuccessful.caption}
        title="Most Successful Pick"
        type="mostSuccessful"
        value={isLoading ? '...' : mostSuccessful.value}
        variant="success"
      />
      <Tile
        caption={leastSuccessful.caption}
        title="Least Successful Pick"
        type="leastSuccessful"
        value={isLoading ? '...' : leastSuccessful.value}
        variant="error"
      />
      <Tile
        caption={bogeyTeam.caption}
        title="Bogey Team"
        type="bogeyTeam"
        value={isLoading ? '...' : bogeyTeam.value}
        variant={
          bogeyTeam.caption === 'Yet to be knocked out!' ? 'success' : 'error'
        }
      />
      <Tile
        caption={homeSuccess.caption}
        title="Home Pick Success"
        type="homeSuccess"
        value={isLoading ? '...' : homeSuccess.value}
        variant={homeSuccess.value === 'N/A' ? 'error' : 'success'}
      />
      <Tile
        caption={awaySuccess.caption}
        title="Away Pick Success"
        type="awaySuccess"
        value={isLoading ? '...' : awaySuccess.value}
        variant={awaySuccess.value === 'N/A' ? 'error' : 'success'}
      />
    </div>
  );
}

export function Tile({
  caption,
  title,
  type,
  value,
  variant = 'default'
}: {
  caption?: string;
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
  const Icon = iconMap[type];

  const color =
    variant === 'error'
      ? 'text-red-400'
      : variant === 'success'
        ? 'text-green-400'
        : 'text-gray-400';

  return (
    <div className="rounded-xl bg-white p-2 shadow-sm grid col-span-2 md:col-span-1">
      <div className="flex p-4">
        {Icon ? <Icon className={`h-5 w-5 text-blue-300`} /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p className={`truncate rounded-xl px-4 py-2 text-center text-2xl`}>
        {value}
      </p>
      {caption && (
        <p
          className={`truncate rounded-xl px-4 py-4 text-center text-small italic ${color}`}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
