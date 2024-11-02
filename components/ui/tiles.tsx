import {
  ArrowUpWideNarrowIcon,
  BadgePlusIcon,
  BadgeXIcon,
  Hash
} from 'lucide-react';

const iconMap = {
  played: Hash,
  most_selected: ArrowUpWideNarrowIcon,
  most_successful: BadgePlusIcon,
  least_successful: BadgeXIcon
};

export default async function TileWrapper() {
  //   const {
  //     numberOfInvoices,
  //     numberOfCustomers,
  //     totalPaidInvoices,
  //     totalPendingInvoices
  //   } = await fetchTileData();

  return (
    <>
      <Tile title="Games Played" type="played" value={21} />
      <Tile
        caption="11 times"
        title="Most Picked Teams"
        type="most_selected"
        value="Spurs & Arsenal"
      />
      <Tile
        caption="90%"
        title="Most Successful Team"
        type="most_successful"
        value="Liverpool"
      />
      <Tile
        caption="50%"
        title="Least Successful Team"
        type="least_successful"
        value="Chelsea"
      />
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
  type: 'played' | 'most_selected' | 'most_successful' | 'least_successful';
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
        <p className="truncate rounded-xl px-4 py-4 text-center text-small">
          {caption}
        </p>
      )}
    </div>
  );
}
