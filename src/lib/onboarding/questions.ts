export type Big5Key = "openness"|"conscientiousness"|"extraversion"|"agreeableness"|"neuroticism";

export const valueOptions = [
  "Growth","Health","Family","Freedom","Wealth",
  "Learning","Creativity","Stability","Adventure","Service",
] as const;

export const onboardingTemplate = {
  text: {
    high: "Recent high — what went right?",
    low: "Recent low — what’s been hard?",
    goal: "Big goal (next 3–6 months)",
    strengths: "Your strengths (short, comma-separated)",
  },
  values: valueOptions,
  big5Defaults: { openness:3, conscientiousness:3, extraversion:3, agreeableness:3, neuroticism:3 } as Record<Big5Key,number>,
};
