import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { WcKnockoutStanding } from '@/lib/wc-definitions';

export default function KnockoutStandings({
  standings,
  isLoading
}: {
  standings: WcKnockoutStanding[];
  isLoading: boolean;
}) {
  const { data: session } = useSession();
  const myId = session?.user?.id;

  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">
          Standings
        </h3>

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Loading…
          </p>
        ) : standings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No predictions yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left py-2 w-10">#</th>
                <th className="text-left py-2">Player</th>
                <th className="text-right py-2 w-16">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => {
                // Ties share a position.
                const position =
                  i > 0 && standings[i - 1].points === s.points ? null : i + 1;
                const isMe = myId != null && String(s.user_id) === myId;
                return (
                  <tr
                    key={s.user_id}
                    className={`border-b border-gray-100 last:border-0 ${
                      isMe ? 'bg-amber-50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2 text-gray-500">{position ?? ''}</td>
                    <td className="py-2 text-gray-800">
                      {s.user_name ?? 'Unknown'}
                      {isMe && (
                        <span className="ml-1 text-xs text-amber-600">
                          (you)
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right font-semibold text-gray-900">
                      {s.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
