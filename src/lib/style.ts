import type { Tone } from "./tone";

export function styleFromTone(t: Tone) {
  // sliders 0..1 -> weights
  const warmth = 0.4 + t.politeness*0.4 - t.frustration*0.2;
  const directness = 0.5 + t.frustration*0.3;
  const playfulness = 0.2 + t.energy*0.5;

  const temperature = 0.6 + t.energy*0.2 - t.frustration*0.1;

  const persona =
    `You are a helpful coach. 
     Warmth: ${warmth.toFixed(2)}, Directness: ${directness.toFixed(2)}, Playfulness: ${playfulness.toFixed(2)}.
     If frustration is high, acknowledge it briefly, stay calm, and be extra concrete.
     Mirror the user's energy (slightly), never mock.`;

  return { temperature: Math.max(0.2, Math.min(1, temperature)), persona };
}
