export type InjuryNews = {
  injury: string | null;
  expectedBack: string | null;
};

// FPL news reads "Knee injury - Expected back 10 Oct" or "Knee injury - Unknown return date".
export const parseInjuryNews = (news: string): InjuryNews => {
  const [injury, ...rest] = news.split(' - ');
  const expectedBack = rest.join(' - ').match(/^Expected back (.+)$/);

  return {
    injury: injury.trim() || null,
    expectedBack: expectedBack ? expectedBack[1] : null
  };
};
