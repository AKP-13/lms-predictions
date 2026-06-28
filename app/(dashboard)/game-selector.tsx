import { Select } from '@/components/ui/select';
import { WcLeagueMembership } from '@/lib/wc-definitions';

// Lets a user who belongs to more than one WC game choose which one they're
// viewing. Hidden when there's nothing to switch between.
export default function GameSelector({
  leagues,
  selectedLeagueId,
  onSelect
}: {
  leagues: WcLeagueMembership[];
  selectedLeagueId: number | null;
  onSelect: (leagueId: number) => void;
}) {
  if (leagues.length < 2) return null;

  const selected = leagues.find((l) => l.league_id === selectedLeagueId);

  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      <label
        htmlFor="game-select"
        className="text-sm font-medium text-gray-700"
      >
        Game:
      </label>
      <Select
        id="game-select"
        className="w-auto bg-white"
        options={leagues.map((l) => l.name)}
        value={selected?.name ?? ''}
        onChange={(e) => {
          const league = leagues.find((l) => l.name === e.target.value);
          if (league) onSelect(league.league_id);
        }}
      />
    </div>
  );
}
