// src/app/api/trial/start/route.ts
export const runtime = "nodejs";

type MCQ = { id: string; prompt: string; options: string[] };
type FRQ = { id: string; prompt: string };

function getQuestions() {
  // 30 practical MCQs with distinct, useful options
  const mcq: MCQ[] = [
    {
      id: "q1",
      prompt: "When do you do your best deep work?",
      options: ["Early morning", "Late night", "Afternoon", "It varies"]
    },
    {
      id: "q2",
      prompt: "Your default work style:",
      options: ["Plan first", "Iterate as you go", "Follow examples", "Start messy, refine later"]
    },
    {
      id: "q3",
      prompt: "How far ahead do you usually plan?",
      options: ["Same day", "1–2 weeks", "1–3 months", "6+ months"]
    },
    {
      id: "q4",
      prompt: "Risk appetite right now:",
      options: ["Play it safe", "Moderate risk", "Bold but calculated", "All-in if upside is big"]
    },
    {
      id: "q5",
      prompt: "How you best learn new skills:",
      options: ["Hands-on", "Reading/watching", "Guided coaching", "Discussing with peers"]
    },
    {
      id: "q6",
      prompt: "Preferred feedback style:",
      options: ["Blunt & direct", "Actionable & specific", "Encouraging first", "Show me examples"]
    },
    {
      id: "q7",
      prompt: "Interruptions impact you:",
      options: ["Derail me fast", "Mildly annoying", "I recover quickly", "I don’t mind them"]
    },
    {
      id: "q8",
      prompt: "Keeping focus works best when you:",
      options: ["Time-block", "Use a timer (Pomodoro)", "Change location", "Batch similar tasks"]
    },
    {
      id: "q9",
      prompt: "What motivates your goals most?",
      options: ["Achievement", "Mastery", "Impact", "Stability"]
    },
    {
      id: "q10",
      prompt: "Social battery at the moment:",
      options: ["Low—prefer solo", "Balanced", "Energized by people", "Context dependent"]
    },
    {
      id: "q11",
      prompt: "Your default communication style:",
      options: ["Brief bullets", "Detailed notes", "Story/analogy", "Visuals/diagrams"]
    },
    {
      id: "q12",
      prompt: "Decision speed preference:",
      options: ["Fast & adjust", "Deliberate & stable", "Sleep on it", "Delegate if possible"]
    },
    {
      id: "q13",
      prompt: "Best accountability for you:",
      options: ["Self-tracking", "Accountability partner", "Public commitment", "Coach/mentor"]
    },
    {
      id: "q14",
      prompt: "Your ideal morning kickoff:",
      options: ["Exercise", "Deep work block", "Daily planning", "Slow start/reflection"]
    },
    {
      id: "q15",
      prompt: "Evening shutdown routine you prefer:",
      options: ["Reflect/journal", "Plan tomorrow", "Unplug fully", "Light catch-up"]
    },
    {
      id: "q16",
      prompt: "Biggest procrastination trigger:",
      options: ["Overwhelm", "Boredom", "Perfectionism", "Unclear next step"]
    },
    {
      id: "q17",
      prompt: "How you break down a big task:",
      options: ["Outline first", "Timeline backwards", "Just start somewhere", "Find a good example"]
    },
    {
      id: "q18",
      prompt: "Calendar vs to-do preference:",
      options: ["Time-block calendar", "To-do list app", "Both together", "Keep it minimal"]
    },
    {
      id: "q19",
      prompt: "Notifications strategy:",
      options: ["All off", "Priority only", "All on", "Batch checks 2–3×/day"]
    },
    {
      id: "q20",
      prompt: "Most leverage right now for health:",
      options: ["Sleep", "Exercise", "Nutrition", "Stress management"]
    },
    {
      id: "q21",
      prompt: "Relationship habit to strengthen:",
      options: ["Weekly check-ins", "Appreciation notes", "Shared activities", "Clearer boundaries"]
    },
    {
      id: "q22",
      prompt: "Money habit to emphasize:",
      options: ["Budgeting", "Investing", "Saving buffer", "Expense tracking"]
    },
    {
      id: "q23",
      prompt: "Learning cadence that suits you:",
      options: ["Daily micro-learning", "Weekly deep blocks", "Short sprints", "Structured courses"]
    },
    {
      id: "q24",
      prompt: "Reading preference:",
      options: ["Audiobooks", "E-books", "Print books", "Summaries/notes"]
    },
    {
      id: "q25",
      prompt: "Note-taking style:",
      options: ["Notion/OneNote", "Paper notebook", "Bare-bones text", "I rarely take notes"]
    },
    {
      id: "q26",
      prompt: "Declutter/review rhythm:",
      options: ["Weekly", "Monthly", "Quarterly", "Rarely"]
    },
    {
      id: "q27",
      prompt: "Travel planning style:",
      options: ["Light plan, flexible", "Detailed itinerary", "Spontaneous", "Guided tours"]
    },
    {
      id: "q28",
      prompt: "Best time for creative work:",
      options: ["Morning", "Afternoon", "Evening", "Weekends"]
    },
    {
      id: "q29",
      prompt: "Breaks that recharge you:",
      options: ["Short & frequent", "Longer but fewer", "Get outside", "Social chat"]
    },
    {
      id: "q30",
      prompt: "Quick motivation reset:",
      options: ["Music", "Movement", "Change environment", "Knock out a quick win"]
    }
  ];

  // 4 short-answer prompts
  const frq: FRQ[] = [
    { id: "t1", prompt: "In one sentence, describe your biggest current goal." },
    { id: "t2", prompt: "What habit would you change first and why?" },
    { id: "t3", prompt: "What does ‘progress’ look like for you in 30 days?" },
    { id: "t4", prompt: "Anything else we should know to guide you better?" }
  ];

  return { mcq, frq };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = Number(url.searchParams.get("day") || "1");
  const { mcq, frq } = getQuestions();

  return Response.json({ day, mcq, frq });
}
