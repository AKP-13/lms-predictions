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
