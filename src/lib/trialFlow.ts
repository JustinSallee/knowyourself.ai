// Lightweight 10-day trial flow with surgical prompts and tiny tailoring.
// You can edit the copy here without touching the UI.

export type Baseline = {
  clarity: number;       // 0-100
  stability: number;     // 0-100
  selfBelief: number;    // 0-100
  energy: number;        // 0-100
};

export type MicroGoal = { id: string; text: string; done?: boolean };

export type DayPlan = {
  day: number;
  mood: boolean;              // include mood slider
  freePrompt: string;         // quick text
  aiPrompt: string;           // tailored, open-ended
  microGoalsHint?: string;    // optional copy
};

// Default bank for days 1-10. Feel free to tweak wording.
export const DAYS: DayPlan[] = [
  {
    day: 1,
    mood: true,
    freePrompt: "What’s the biggest thing on your mind today?",
    aiPrompt:
      "You wrote your Day 0 intake yesterday. What truth about yourself felt the most uncomfortable — and why?",
    microGoalsHint: "Start tiny. We’ll keep them easy to win."
  },
  {
    day: 2,
    mood: true,
    freePrompt: "What drained you most in the last 24 hours?",
    aiPrompt:
      "When you feel overwhelmed, what’s your first move? Be specific about time, place, and behavior."
  },
  {
    day: 3,
    mood: true,
    freePrompt: "Name one small win from today (even if it feels dumb).",
    aiPrompt:
      "Do you avoid mistakes or chase opportunities when deciding? Tell a story from this week."
  },
  {
    day: 4,
    mood: true,
    freePrompt: "What did you procrastinate on — and what did you do instead?",
    aiPrompt:
      "If a close friend had to call out 3 things holding you back, what would they say?"
  },
  {
    day: 5,
    mood: true,
    freePrompt: "What did you do today that actually helped?",
    aiPrompt:
      "Think of a time in the past year you felt totally overwhelmed. What did you do next, step by step?"
  },
  {
    day: 6,
    mood: true,
    freePrompt: "What did you avoid today that you’ll pay for later?",
    aiPrompt:
      "What do you wish people understood about you, but never seem to?"
  },
  {
    day: 7,
    mood: true,
    freePrompt: "Where did you feel most like yourself today?",
    aiPrompt:
      "You wake up tomorrow and all current problems are gone — what’s the first thing you do differently and why?"
  },
  {
    day: 8,
    mood: true,
    freePrompt: "What’s one tension you keep ignoring?",
    aiPrompt:
      "Describe the last time you gave up early. What would ‘sticking with it’ have actually looked like?"
  },
  {
    day: 9,
    mood: true,
    freePrompt: "What gave you real energy today?",
    aiPrompt:
      "What’s the pattern you’re starting to see about yourself after a week of check-ins?"
  },
  {
    day: 10,
    mood: true,
    freePrompt: "What’s different about you today vs Day 1?",
    aiPrompt:
      "If you only fixed ONE habit the next 20 days, what would it be and how will you make it idiot-proof?",
    microGoalsHint: "We’ll lock micro-goals for the next 20 days after today."
  }
];

// Simple micro-goal generator (adjustable)
export function pickMicroGoals(seed: {
  intake?: string;
  lastFree?: string;
  lastMood?: number;
}): MicroGoal[] {
  const hints = (seed.intake || seed.lastFree || "").toLowerCase();
  const goals: MicroGoal[] = [];

  if (hints.includes("sleep") || hints.includes("tired")) {
    goals.push({ id: "sleep", text: "In bed 30 mins earlier tonight." });
  }
  if (hints.includes("anxiety") || hints.includes("overwhelmed")) {
    goals.push({ id: "reset", text: "2-minute box-breathing after lunch." });
  }
  if (hints.includes("focus") || hints.includes("adhd") || hints.includes("scatter")) {
    goals.push({ id: "focus", text: "One 15-min deep-focus block before noon." });
  }
  if (hints.includes("drinking") || hints.includes("alcohol")) {
    goals.push({ id: "hydrate", text: "3 full glasses of water by 2pm." });
  }
  if (!goals.length) {
    goals.push({ id: "wins", text: "Write 3 tiny wins before bed." });
  }
  return goals.slice(0, 3);
}
