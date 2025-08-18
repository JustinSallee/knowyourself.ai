// lib/trialFlow.ts
export type Baseline = {
  energy: number;
  stability: number;
  finances: number;
  confidence: number;
};

export type MicroGoal = { id: string; text: string };

export type DayPlan = {
  day: number;
  mood: boolean;
  freePrompt: string;
  aiPrompt: string;
  microGoalsHint?: string;
};

export const TRIAL_DAYS = 30 as const;

export const DAYS: DayPlan[] = [
  { day: 1, mood: true,
    freePrompt: "What’s one honest thing about today?",
    aiPrompt: "Name one thing that’s bugging you right now. Keep it simple.",
    microGoalsHint: "Start tiny. We’ll keep them easy to win." },
  { day: 2, mood: true,
    freePrompt: "What gave you real energy in the last 24 hours?",
    aiPrompt: "When motivation dips, what small move helps you get going?" },
  { day: 3, mood: true,
    freePrompt: "Name one tiny win from today (even if it feels small).",
    aiPrompt: "What’s different on your better days?" },
  { day: 4, mood: true,
    freePrompt: "What did you put off — and what did you do instead?",
    aiPrompt: "If a close friend gave you 3 honest suggestions, what would they be?" },
  { day: 5, mood: true,
    freePrompt: "What did you do today that actually helped?",
    aiPrompt: "Think of a time you felt overwhelmed. What did you do next, step by step?" },
  { day: 6, mood: true,
    freePrompt: "What feels noisy in your head right now?",
    aiPrompt: "What do you wish people understood about you?" },
  { day: 7, mood: true,
    freePrompt: "Where did you feel most like yourself today?",
    aiPrompt: "If tomorrow started clean, what would you do first and why?" },
  { day: 8, mood: true,
    freePrompt: "What’s one tension you keep ignoring?",
    aiPrompt: "Describe the last time you gave up early. What would sticking with it look like?" },
  { day: 9, mood: true,
    freePrompt: "What gave you momentum today?",
    aiPrompt: "What pattern are you starting to see after a week of check-ins?" },
  { day:10, mood: true,
    freePrompt: "What’s different about you today vs Day 1?",
    aiPrompt: "If you could only improve one habit the next 20 days, which one and how will you protect it?" },

  { day:11, mood: true,
    freePrompt: "What did you say no to today?",
    aiPrompt: "Where are you over-committed? Name one thing to drop or defer." },
  { day:12, mood: true,
    freePrompt: "Who made your day better? How?",
    aiPrompt: "What relationship will you invest in this month and what’s the smallest step?" },
  { day:13, mood: true,
    freePrompt: "What almost derailed you today?",
    aiPrompt: "What’s your reset routine when things go sideways?" },
  { day:14, mood: true,
    freePrompt: "What did you learn about your attention today?",
    aiPrompt: "What environment helps you focus? Be specific (time/place/tools)." },
  { day:15, mood: true,
    freePrompt: "Where did you feel proud today?",
    aiPrompt: "What skill would compound most if improved 10%?" },
  { day:16, mood: true,
    freePrompt: "What money decision felt smart or dumb recently?",
    aiPrompt: "What’s one low-friction change to improve finances this week?" },
  { day:17, mood: true,
    freePrompt: "If today had a headline, what would it be?",
    aiPrompt: "What belief about yourself is a bit outdated now?" },
  { day:18, mood: true,
    freePrompt: "What did you do for your body today?",
    aiPrompt: "When energy dips, what cue shows up first? What helps fastest?" },
  { day:19, mood: true,
    freePrompt: "What did you avoid and why?",
    aiPrompt: "What’s the cost of that avoidance 30 days out?" },
  { day:20, mood: true,
    freePrompt: "What surprised you today?",
    aiPrompt: "Which part of your plan is working better than expected — why?" },

  { day:21, mood: true,
    freePrompt: "Where did you feel confident today?",
    aiPrompt: "What action reliably boosts your confidence 5–10%?" },
  { day:22, mood: true,
    freePrompt: "What tiny kindness showed up today?",
    aiPrompt: "How does generosity show up when you’re stressed?" },
  { day:23, mood: true,
    freePrompt: "What did you overthink today?",
    aiPrompt: "How do you decide something is good enough to ship?" },
  { day:24, mood: true,
    freePrompt: "What routine saved you time or energy?",
    aiPrompt: "Where could a 5-minute routine remove daily friction?" },
  { day:25, mood: true,
    freePrompt: "What feedback stuck with you?",
    aiPrompt: "If you ran a tiny 1-day experiment tomorrow, what would you test?" },
  { day:26, mood: true,
    freePrompt: "What boundary did you hold (or miss)?",
    aiPrompt: "Where do you need one clearer stop sign this week?" },
  { day:27, mood: true,
    freePrompt: "What was the best use of your time today?",
    aiPrompt: "If you had 2 fewer hours each day, what would you cut first?" },
  { day:28, mood: true,
    freePrompt: "What did you communicate clearly?",
    aiPrompt: "What message do you owe someone? Draft a sentence." },
  { day:29, mood: true,
    freePrompt: "What would make tomorrow 10% better?",
    aiPrompt: "Choose one lever to pull tomorrow and define done in one line." },
  { day:30, mood: true,
    freePrompt: "Looking back 30 days — what actually changed?",
    aiPrompt: "What’s the one habit you’ll keep for the next 60 days, and how will you protect it?" },
];

// micro-goals
export function pickMicroGoals(seed: { intake?: string; lastFree?: string; lastMood?: number }): MicroGoal[] {
  const hints = (seed.intake || seed.lastFree || "").toLowerCase();
  const goals: MicroGoal[] = [];
  if (hints.includes("sleep") || hints.includes("tired")) goals.push({ id: "sleep", text: "In bed 30 mins earlier." });
  if (hints.includes("anxiety") || hints.includes("overwhelmed")) goals.push({ id: "reset", text: "2-min box-breath after lunch." });
  if (hints.includes("focus") || hints.includes("adhd") || hints.includes("scatter")) goals.push({ id: "focus", text: "One 15-min deep-focus block." });
  if (hints.includes("money") || hints.includes("finance")) goals.push({ id: "money", text: "5-min money review at 6pm." });
  if (hints.includes("drink") || hints.includes("alcohol")) goals.push({ id: "hydrate", text: "3 glasses of water by 2pm." });
  if (!goals.length) goals.push({ id: "wins", text: "Write 3 tiny wins before bed." });
  return goals.slice(0, 3);
}
