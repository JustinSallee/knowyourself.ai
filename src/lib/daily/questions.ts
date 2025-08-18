export type Q = { id: string; text: string; tags: string[] };
export const DAILY_QUESTIONS: Q[] = [
  { id:"focus-1", text:"What’s the one thing that would make today a win?", tags:["focus","planning"] },
  { id:"blocker-1", text:"Any blockers you can remove in 10 minutes or less?", tags:["blockers","timeboxing"] },
  { id:"gratitude-1", text:"Name one thing you’re grateful for today.", tags:["gratitude","mood"] },
  { id:"risk-1", text:"What small risk would move your goal forward?", tags:["courage","goal"] },
  { id:"energy-1", text:"What’s your energy level (1–5) and why?", tags:["energy","reflection"] },
];

export function pickNextQuestion(doneIds: string[] = []): Q {
  const pool = DAILY_QUESTIONS.filter(q => !doneIds.includes(q.id));
  return (pool.length ? pool : DAILY_QUESTIONS)[Math.floor(Math.random() * (pool.length ? pool.length : DAILY_QUESTIONS.length))];
}
