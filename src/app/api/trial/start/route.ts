// src/app/api/trial/start/route.ts
export const runtime = "nodejs";

type MCQ = { id: string; prompt: string; options: string[] };
type FRQ = { id: string; prompt: string };

function getQuestions() {
  // 30 MCQs (q1..q30) — simple, clean prompts + 4 short answers (t1..t4)
  const mcq: MCQ[] = Array.from({ length: 30 }).map((_, i) => {
    const n = i + 1;
    return {
      id: `q${n}`,
      prompt: `Question ${n}: Pick the option that best fits you.`,
      options: ["Strongly disagree", "Disagree", "Agree", "Strongly agree"],
    };
  });

  const frq: FRQ[] = [
    { id: "t1", prompt: "In one sentence, describe your biggest current goal." },
    { id: "t2", prompt: "What habit would you change first and why?" },
    { id: "t3", prompt: "What does ‘progress’ look like for you in 30 days?" },
    { id: "t4", prompt: "Anything else we should know to guide you better?" },
  ];

  return { mcq, frq };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = Number(url.searchParams.get("day") || "1");
  const { mcq, frq } = getQuestions();

  return Response.json({
    day,
    mcq,
    frq,
  });
}
