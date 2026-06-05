export const WC_ROUND_DEADLINES: Record<number, Date> = {
  1: new Date('2026-06-11T17:00:00Z'), // 6pm BST
  2: new Date('2026-06-15T14:00:00Z'), // 3pm BST
  3: new Date('2026-06-18T14:00:00Z'),
  4: new Date('2026-06-21T14:00:00Z'),
  5: new Date('2026-06-24T17:00:00Z'), // 6pm BST
  6: new Date('2026-06-26T17:00:00Z')
};

export const WC_ROUND_LABELS: Record<number, string> = {
  1: 'Round 1 — Groups A–F, Matchday 1 (11–14 Jun)',
  2: 'Round 2 — Groups G–L, Matchday 1 (15–17 Jun)',
  3: 'Round 3 — Groups A–F, Matchday 2 (18–20 Jun)',
  4: 'Round 4 — Groups G–L, Matchday 2 (21–23 Jun)',
  5: 'Round 5 — Groups A–F, Matchday 3 (24–25 Jun)',
  6: 'Round 6 — Groups G–L, Matchday 3 (26–27 Jun)'
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
