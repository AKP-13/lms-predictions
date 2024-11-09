import { fetchTileData } from '@/lib/data';
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

export default async function TileWrapper() {
  const {
    gamesPlayed,
    bogeyRoundNumber,
    mostSelected,
    mostSuccessful
    // leastSuccessful,
    // bogeyTeam,
    // homeSuccess,
    // awaySuccess,
  } = await fetchTileData();

  return (
    <>
      <Tile
        caption={gamesPlayed.caption}
        title="Games Played"
        type="gamesPlayed"
        value={gamesPlayed.value}
      />
      <Tile
        caption={bogeyRoundNumber.caption}
        title="Bogey Round"
        type="bogeyRound"
        value={bogeyRoundNumber.value}
      />
      <Tile
        caption={mostSelected.caption}
        title="Most Picked Teams"
        type="mostSelected"
        value={mostSelected.value}
      />
      <Tile
        caption={mostSuccessful.caption}
        title="Most Successful Pick"
        type="mostSuccessful"
        value={mostSuccessful.value}
      />
      {/* <Tile
        caption={leastSuccessful.caption}
        title="Least Successful Pick"
        type="leastSuccessful"
        value={leastSuccessful.value}
      />
      <Tile
        caption={bogeyTeam.caption}
        title="Bogey Teams"
        type="bogeyTeam"
        value={bogeyTeam.value}
      />
      <Tile
        caption={homeSuccess.caption}
        title="Home Pick Success"
        type="homeSuccess"
        value={homeSuccess.value}
      />
      <Tile
        caption={awaySuccess.caption}
        title="Away Pick Success"
        type="awaySuccess"
        value={awaySuccess.value}
      /> */}
    </>
  );
}

export function Tile({
  caption,
  title,
  type,
  value
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
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-white p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p className="truncate rounded-xl px-4 py-8 text-center text-2xl">
        {value}
      </p>
      {caption && (
        <p className="truncate rounded-xl px-4 py-4 text-center text-small italic">
          {caption}
        </p>
      )}
    </div>
  );
}
