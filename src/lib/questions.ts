export type MCQItem = { id: string; q: string; options: string[] };

export const MCQ: MCQItem[] = [
  { id: "q01", q: "I get energy from:", options: ["Being around others", "Quiet solo time"] },
  { id: "q02", q: "My default decision style:", options: ["Go with gut", "Analyze pros/cons", "Ask others", "Delay deciding"] },
  { id: "q03", q: "Mornings or nights?", options: ["Morning", "Night", "Varies"] },
  { id: "q04", q: "Biggest current focus:", options: ["Career", "Health", "Relationships", "Money", "Learning", "Mental clarity"] },
  { id: "q05", q: "When stressed I tend to:", options: ["Overwork", "Avoid", "Vent", "Plan it out"] },
  { id: "q06", q: "Best way to hold me accountable:", options: ["Public commitment", "Buddy", "App reminders", "Self-tracking"] },
  { id: "q07", q: "Preferred planning horizon:", options: ["Day", "Week", "Month", "Quarter+"] },
  { id: "q08", q: "My work style:", options: ["Sprints", "Steady daily cadence", "Last-minute rush"] },
  { id: "q09", q: "Attention lately feels:", options: ["Laser", "Scattered", "Depends", "Not sure"] },
  { id: "q10", q: "Sleep quality lately:", options: ["Great", "Okay", "Rough"] },
  { id: "q11", q: "Exercise frequency:", options: ["Most days", "1–3×/week", "Rarely"] },
  { id: "q12", q: "I learn best by:", options: ["Doing", "Reading", "Watching", "Explaining"] },
  { id: "q13", q: "Money mindset now:", options: ["Confident", "Uneasy", "Avoiding", "Rebuilding"] },
  { id: "q14", q: "Relationship energy:", options: ["Connected", "Lonely", "Drained", "Mixed"] },
  { id: "q15", q: "Current pace feels:", options: ["Too fast", "About right", "Too slow"] },
  { id: "q16", q: "Inbox/notifications:", options: ["Under control", "Overflowing", "I ignore them"] },
  { id: "q17", q: "Biggest blocker today:", options: ["Time", "Energy", "Clarity", "Fear", "Other"] },
  { id: "q18", q: "Frustration tolerance:", options: ["High", "Medium", "Low"] },
  { id: "q19", q: "Perfectionism:", options: ["Strong", "Sometimes", "Rarely"] },
  { id: "q20", q: "Comfort with risk:", options: ["High", "Medium", "Low"] },
  { id: "q21", q: "Social media use:", options: ["Minimal", "Moderate", "Heavy"] },
  { id: "q22", q: "Focus environment:", options: ["Silence", "Cafe hum", "Music", "Doesn't matter"] },
  { id: "q23", q: "Task size preference:", options: ["Small quick wins", "One big chunk"] },
  { id: "q24", q: "Habits consistency:", options: ["Very", "So-so", "Inconsistent"] },
  { id: "q25", q: "Breaks during work:", options: ["Frequent short", "Few long", "Rarely break"] },
  { id: "q26", q: "Food choices lately:", options: ["Nutritious", "Mixed", "Convenience"] },
  { id: "q27", q: "Alcohol/substances:", options: ["None/minimal", "Moderate", "Frequent"] },
  { id: "q28", q: "Learning time weekly:", options: ["<1h", "1–3h", "3–7h", "7h+"] },
  { id: "q29", q: "Goal clarity today:", options: ["Crystal", "Fuzzy", "Unsure"] },
  { id: "q30", q: "Biggest win last week:", options: ["Progress", "Learning", "Connection", "Health", "Money"] },
];

export function getAnswers(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("ky_mcq") || "{}"); } catch { return {}; }
}
export function setAnswer(id: string, idx: number) {
  const a = getAnswers();
  a[id] = idx;
  try { localStorage.setItem("ky_mcq", JSON.stringify(a)); } catch {}
}
export function pickRandomUnanswered(): MCQItem | undefined {
  const a = getAnswers();
  const unanswered = MCQ.filter(x => !(x.id in a));
  if (!unanswered.length) return undefined;
  const i = Math.floor(Math.random() * unanswered.length);
  return unanswered[i];
}
