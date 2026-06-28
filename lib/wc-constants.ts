export const WC_LEAGUE_ID = 3;

export const WC_ROUND_DEADLINES: Record<number, Date> = {
  // Group stage
  1: new Date('2026-06-11T17:00:00Z'), // 6pm BST
  2: new Date('2026-06-15T14:00:00Z'), // 3pm BST
  3: new Date('2026-06-18T14:00:00Z'),
  4: new Date('2026-06-21T14:00:00Z'),
  5: new Date('2026-06-24T17:00:00Z'), // 6pm BST
  6: new Date('2026-06-26T17:00:00Z'),
  // Knockout stage
  7: new Date('2026-06-28T18:00:00Z'), // 7pm BST — Round of 32
  8: new Date('2026-07-04T16:00:00Z'), // 5pm BST — Round of 16
  9: new Date('2026-07-09T19:00:00Z'), // 8pm BST — Quarter-Finals
  10: new Date('2026-07-14T18:00:00Z'), // 7pm BST — Semi-Finals
  11: new Date('2026-07-19T18:00:00Z') // 7pm BST — The Final
};

export const WC_ROUND_LABELS: Record<number, string> = {
  1: 'Round 1 — Groups A–F, Matchday 1 (11–14 Jun)',
  2: 'Round 2 — Groups G–L, Matchday 1 (15–17 Jun)',
  3: 'Round 3 — Groups A–F, Matchday 2 (18–20 Jun)',
  4: 'Round 4 — Groups G–L, Matchday 2 (21–23 Jun)',
  5: 'Round 5 — Groups A–F, Matchday 3 (24–25 Jun)',
  6: 'Round 6 — Groups G–L, Matchday 3 (26–27 Jun)',
  7: 'Round 7 — Round of 32',
  8: 'Round 8 — Round of 16',
  9: 'Round 9 — Quarter-Finals',
  10: 'Round 10 — Semi-Finals',
  11: 'Round 11 — The Final'
};

// Short fixture description for each round (used in rules tables)
export const WC_ROUND_FIXTURE_LABELS: Record<number, string> = {
  1: 'Groups A–F, Matchday 1',
  2: 'Groups G–L, Matchday 1',
  3: 'Groups A–F, Matchday 2',
  4: 'Groups G–L, Matchday 2',
  5: 'Groups A–F, Matchday 3',
  6: 'Groups G–L, Matchday 3',
  7: 'Round of 32',
  8: 'Round of 16',
  9: 'Quarter-Finals',
  10: 'Semi-Finals',
  11: 'The Final 🏆'
};

export const WC_ROUND_GROUPS: Record<number, string[]> = {
  1: ['A', 'B', 'C', 'D', 'E', 'F'],
  2: ['G', 'H', 'I', 'J', 'K', 'L'],
  3: ['A', 'B', 'C', 'D', 'E', 'F'],
  4: ['G', 'H', 'I', 'J', 'K', 'L'],
  5: ['A', 'B', 'C', 'D', 'E', 'F'],
  6: ['G', 'H', 'I', 'J', 'K', 'L']
};

export const WC_TEAM_FLAGS: Record<string, string> = {
  // Group A
  Czechia: '🇨🇿',
  Mexico: '🇲🇽',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  // Group B
  Switzerland: '🇨🇭',
  'Bosnia and Herzegovina': '🇧🇦',
  Canada: '🇨🇦',
  Qatar: '🇶🇦',
  // Group C
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Brazil: '🇧🇷',
  Haiti: '🇭🇹',
  Morocco: '🇲🇦',
  // Group D
  Türkiye: '🇹🇷',
  Paraguay: '🇵🇾',
  USA: '🇺🇸',
  Australia: '🇦🇺',
  // Group E
  Germany: '🇩🇪',
  Ecuador: '🇪🇨',
  'Ivory Coast': '🇨🇮',
  Curaçao: '🇨🇼',
  // Group F
  Sweden: '🇸🇪',
  Netherlands: '🇳🇱',
  Tunisia: '🇹🇳',
  Japan: '🇯🇵',
  // Group G
  Belgium: '🇧🇪',
  Egypt: '🇪🇬',
  Iran: '🇮🇷',
  'New Zealand': '🇳🇿',
  // Group H
  Spain: '🇪🇸',
  Uruguay: '🇺🇾',
  'Cape Verde': '🇨🇻',
  'Saudi Arabia': '🇸🇦',
  // Group I
  France: '🇫🇷',
  Norway: '🇳🇴',
  Senegal: '🇸🇳',
  Iraq: '🇮🇶',
  // Group J
  Austria: '🇦🇹',
  Argentina: '🇦🇷',
  Algeria: '🇩🇿',
  Jordan: '🇯🇴',
  // Group K
  Portugal: '🇵🇹',
  Colombia: '🇨🇴',
  'DR Congo': '🇨🇩',
  Uzbekistan: '🇺🇿',
  // Group L
  Croatia: '🇭🇷',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Ghana: '🇬🇭',
  Panama: '🇵🇦'
};

// ── Single source of truth for all 48 team identities ────────────────────────
// Consumed by the seed route and the knockout admin team-name dropdown.
// Flags are derived from WC_TEAM_FLAGS above so the special England/Scotland
// subdivision flag emojis live in exactly one place.
export type WcTeamInfo = {
  name: string;
  short_name: string;
  group_name: string;
  flag: string;
};

const RAW_TEAMS: Omit<WcTeamInfo, 'flag'>[] = [
  // Group A
  { name: 'Mexico', short_name: 'MEX', group_name: 'A' },
  { name: 'South Africa', short_name: 'RSA', group_name: 'A' },
  { name: 'South Korea', short_name: 'KOR', group_name: 'A' },
  { name: 'Czechia', short_name: 'CZE', group_name: 'A' },
  // Group B
  { name: 'Canada', short_name: 'CAN', group_name: 'B' },
  { name: 'Bosnia and Herzegovina', short_name: 'BIH', group_name: 'B' },
  { name: 'Qatar', short_name: 'QAT', group_name: 'B' },
  { name: 'Switzerland', short_name: 'SUI', group_name: 'B' },
  // Group C
  { name: 'Brazil', short_name: 'BRA', group_name: 'C' },
  { name: 'Morocco', short_name: 'MAR', group_name: 'C' },
  { name: 'Haiti', short_name: 'HAI', group_name: 'C' },
  { name: 'Scotland', short_name: 'SCO', group_name: 'C' },
  // Group D
  { name: 'USA', short_name: 'USA', group_name: 'D' },
  { name: 'Paraguay', short_name: 'PAR', group_name: 'D' },
  { name: 'Australia', short_name: 'AUS', group_name: 'D' },
  { name: 'Türkiye', short_name: 'TUR', group_name: 'D' },
  // Group E
  { name: 'Germany', short_name: 'GER', group_name: 'E' },
  { name: 'Curaçao', short_name: 'CUW', group_name: 'E' },
  { name: 'Ivory Coast', short_name: 'CIV', group_name: 'E' },
  { name: 'Ecuador', short_name: 'ECU', group_name: 'E' },
  // Group F
  { name: 'Netherlands', short_name: 'NED', group_name: 'F' },
  { name: 'Japan', short_name: 'JPN', group_name: 'F' },
  { name: 'Sweden', short_name: 'SWE', group_name: 'F' },
  { name: 'Tunisia', short_name: 'TUN', group_name: 'F' },
  // Group G
  { name: 'Belgium', short_name: 'BEL', group_name: 'G' },
  { name: 'Egypt', short_name: 'EGY', group_name: 'G' },
  { name: 'Iran', short_name: 'IRN', group_name: 'G' },
  { name: 'New Zealand', short_name: 'NZL', group_name: 'G' },
  // Group H
  { name: 'Spain', short_name: 'ESP', group_name: 'H' },
  { name: 'Cape Verde', short_name: 'CPV', group_name: 'H' },
  { name: 'Saudi Arabia', short_name: 'KSA', group_name: 'H' },
  { name: 'Uruguay', short_name: 'URU', group_name: 'H' },
  // Group I
  { name: 'France', short_name: 'FRA', group_name: 'I' },
  { name: 'Senegal', short_name: 'SEN', group_name: 'I' },
  { name: 'Iraq', short_name: 'IRQ', group_name: 'I' },
  { name: 'Norway', short_name: 'NOR', group_name: 'I' },
  // Group J
  { name: 'Argentina', short_name: 'ARG', group_name: 'J' },
  { name: 'Algeria', short_name: 'ALG', group_name: 'J' },
  { name: 'Austria', short_name: 'AUT', group_name: 'J' },
  { name: 'Jordan', short_name: 'JOR', group_name: 'J' },
  // Group K
  { name: 'Portugal', short_name: 'POR', group_name: 'K' },
  { name: 'DR Congo', short_name: 'COD', group_name: 'K' },
  { name: 'Colombia', short_name: 'COL', group_name: 'K' },
  { name: 'Uzbekistan', short_name: 'UZB', group_name: 'K' },
  // Group L
  { name: 'England', short_name: 'ENG', group_name: 'L' },
  { name: 'Croatia', short_name: 'CRO', group_name: 'L' },
  { name: 'Ghana', short_name: 'GHA', group_name: 'L' },
  { name: 'Panama', short_name: 'PAN', group_name: 'L' }
];

export const WC_TEAMS: WcTeamInfo[] = RAW_TEAMS.map((t) => ({
  ...t,
  flag: WC_TEAM_FLAGS[t.name] ?? '🏳'
}));
