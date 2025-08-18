export type Tone = { politeness:number; frustration:number; energy:number };

export function analyzeTone(input: string): Tone {
  const txt = input.toLowerCase();
  const please = (txt.match(/\bplease\b/g) || []).length;
  const thanks = (txt.match(/\bthanks|\bthank you\b/g) || []).length;
  const swears = (txt.match(/\b(fuck|shit|damn|wtf)\b/g) || []).length;
  const excls = (txt.match(/!/g) || []).length;

  const politeness = Math.min(1, (please + thanks) / 2);
  const frustration = Math.min(1, (swears + (excls>2 ? 1 : 0)) / 3);
  const energy = Math.min(1, (excls/3));

  return { politeness, frustration, energy };
}
