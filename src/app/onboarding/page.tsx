"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MCQS = [
  { id: "q1",  prompt: "How do you usually start your day?", options: [
    {id:"a",label:"Jump right in"},{id:"b",label:"Plan first"},
    {id:"c",label:"Scroll news/social"},{id:"d",label:"Slow & quiet start"}
  ]},
  { id: "q2",  prompt: "When stuck, you tend to…", options: [
    {id:"a",label:"Ask someone"},{id:"b",label:"Research"},
    {id:"c",label:"Experiment"},{id:"d",label:"Wait it out"}
  ]},
  { id: "q3",  prompt: "Your focus is best…", options: [
    {id:"a",label:"Early morning"},{id:"b",label:"Midday"},
    {id:"c",label:"Evening"},{id:"d",label:"It varies"}
  ]},
  { id: "q4",  prompt: "Biggest drag on energy lately?", options: [
    {id:"a",label:"Sleep"},{id:"b",label:"Stress/Anxiety"},
    {id:"c",label:"Too many tasks"},{id:"d",label:"People/conflict"}
  ]},
  { id: "q5",  prompt: "Which describes your planning?", options: [
    {id:"a",label:"Detailed"},{id:"b",label:"Rough outline"},
    {id:"c",label:"Mostly reactive"},{id:"d",label:"Avoid planning"}
  ]},
  { id: "q6",  prompt: "Money behavior right now is…", options: [
    {id:"a",label:"On top of it"},{id:"b",label:"Okay-ish"},
    {id:"c",label:"Behind"},{id:"d",label:"Avoiding it"}
  ]},
  { id: "q7",  prompt: "Feedback lands best when…", options: [
    {id:"a",label:"Direct & blunt"},{id:"b",label:"Supportive"},
    {id:"c",label:"Written"},{id:"d",label:"Live chat"}
  ]},
  { id: "q8",  prompt: "You’re motivated most by…", options: [
    {id:"a",label:"Clear goals"},{id:"b",label:"Deadlines"},
    {id:"c",label:"Accountability"},{id:"d",label:"Curiosity"}
  ]},
  { id: "q9",  prompt: "Decision style:", options: [
    {id:"a",label:"Fast gut"},{id:"b",label:"Research heavy"},
    {id:"c",label:"Ask trusted person"},{id:"d",label:"Delay/avoid"}
  ]},
  { id: "q10", prompt: "What breaks your flow?", options: [
    {id:"a",label:"Notifications"},{id:"b",label:"People"},
    {id:"c",label:"Multi-tasking"},{id:"d",label:"Unclear task"}
  ]},
  { id: "q11", prompt: "You recharge by…", options: [
    {id:"a",label:"Solo time"},{id:"b",label:"Friends"},
    {id:"c",label:"Movement"},{id:"d",label:"Creative play"}
  ]},
  { id: "q12", prompt: "Conflict stance:", options: [
    {id:"a",label:"Head-on"},{id:"b",label:"Diplomatic"},
    {id:"c",label:"Avoid"},{id:"d",label:"Delay then handle"}
  ]},
  { id: "q13", prompt: "Your workspace is…", options: [
    {id:"a",label:"Minimalist"},{id:"b",label:"Organized chaos"},
    {id:"c",label:"Varies"},{id:"d",label:"Wherever I am"}
  ]},
  { id: "q14", prompt: "Procrastination trigger:", options: [
    {id:"a",label:"Boredom"},{id:"b",label:"Ambiguity"},
    {id:"c",label:"Perfectionism"},{id:"d",label:"Fear of outcome"}
  ]},
  { id: "q15", prompt: "Most helpful nudge:", options: [
    {id:"a",label:"Time block"},{id:"b",label:"External deadline"},
    {id:"c",label:"Public commitment"},{id:"d",label:"Tiny first step"}
  ]},
  { id: "q16", prompt: "Biggest strength at work:", options: [
    {id:"a",label:"Persistence"},{id:"b",label:"Strategy"},
    {id:"c",label:"People"},{id:"d",label:"Speed"}
  ]},
  { id: "q17", prompt: "Biggest growth area:", options: [
    {id:"a",label:"Focus"},{id:"b",label:"Confidence"},
    {id:"c",label:"Systems"},{id:"d",label:"Communication"}
  ]},
  { id: "q18", prompt: "You learn best by…", options: [
    {id:"a",label:"Doing"},{id:"b",label:"Reading/Research"},
    {id:"c",label:"Watching"},{id:"d",label:"Teaching others"}
  ]},
  { id: "q19", prompt: "Risk tolerance:", options: [
    {id:"a",label:"High"},{id:"b",label:"Medium"},
    {id:"c",label:"Low"},{id:"d",label:"Varies"}
  ]},
  { id: "q20", prompt: "Social energy:", options: [
    {id:"a",label:"Energized"},{id:"b",label:"Neutral"},
    {id:"c",label:"Drained"},{id:"d",label:"Depends who"}
  ]},
  { id: "q21", prompt: "Sleep quality lately:", options: [
    {id:"a",label:"Great"},{id:"b",label:"Okay"},
    {id:"c",label:"Poor"},{id:"d",label:"All over the place"}
  ]},
  { id: "q22", prompt: "Fitness/movement:", options: [
    {id:"a",label:"Consistent"},{id:"b",label:"Some weeks"},
    {id:"c",label:"Rare"},{id:"d",label:"Restarting"}
  ]},
  { id: "q23", prompt: "Caffeine habit:", options: [
    {id:"a",label:"Daily"},{id:"b",label:"Sometimes"},
    {id:"c",label:"None"},{id:"d",label:"Trying to cut"}
  ]},
  { id: "q24", prompt: "Digital clutter:", options: [
    {id:"a",label:"Clean"},{id:"b",label:"Manageable"},
    {id:"c",label:"Messy"},{id:"d",label:"Overwhelmed"}
  ]},
  { id: "q25", prompt: "Money mindset today:", options: [
    {id:"a",label:"Confident"},{id:"b",label:"Cautious"},
    {id:"c",label:"Anxious"},{id:"d",label:"Avoidant"}
  ]},
  { id: "q26", prompt: "Attention leaks most via…", options: [
    {id:"a",label:"Phone"},{id:"b",label:"Browser tabs"},
    {id:"c",label:"Chat apps"},{id:"d",label:"Meetings"}
  ]},
  { id: "q27", prompt: "Ship style:", options: [
    {id:"a",label:"Iterate fast"},{id:"b",label:"Perfect then ship"},
    {id:"c",label:"Collaborative"},{id:"d",label:"Private until ready"}
  ]},
  { id: "q28", prompt: "What you track:", options: [
    {id:"a",label:"Habits"},{id:"b",label:"Time"},
    {id:"c",label:"Money"},{id:"d",label:"Nothing"}
  ]},
  { id: "q29", prompt: "Personal growth lately:", options: [
    {id:"a",label:"Up"},{id:"b",label:"Flat"},
    {id:"c",label:"Down"},{id:"d",label:"Unsure"}
  ]},
  { id: "q30", prompt: "Preferred reflection cadence:", options: [
    {id:"a",label:"Daily"},{id:"b",label:"Weekly"},
    {id:"c",label:"Ad-hoc"},{id:"d",label:"Rarely"}
  ]},
];

export default function OnboardingPage() {
  const router = useRouter();

  // longform (1 required + 3 optional)
  const [about, setAbout] = useState("");
  const [challenge, setChallenge] = useState("");
  const [strength, setStrength] = useState("");
  const [support, setSupport] = useState("");

  // baseline sliders
  const [energy, setEnergy] = useState(50);
  const [stability, setStability] = useState(50);
  const [finances, setFinances] = useState(50);
  const [confidence, setConfidence] = useState(50);

  // MCQ answers map
  const [answers, setAnswers] = useState({});

  // Prefill to avoid disabled button loop
  useEffect(() => {
    try {
      const intake = JSON.parse(localStorage.getItem("ky_intake") || "{}");
      if (typeof intake.about === "string") setAbout(intake.about);
      if (typeof intake.challenge === "string") setChallenge(intake.challenge);
      if (typeof intake.strength === "string") setStrength(intake.strength);
      if (typeof intake.support === "string") setSupport(intake.support);
    } catch {}
    try {
      const base = JSON.parse(localStorage.getItem("ky_baseline") || "{}");
      if (typeof base.energy === "number") setEnergy(base.energy);
      if (typeof base.stability === "number") setStability(base.stability);
      if (typeof base.finances === "number") setFinances(base.finances);
      if (typeof base.confidence === "number") setConfidence(base.confidence);
    } catch {}
    try {
      const mcq = JSON.parse(localStorage.getItem("ky_mcq") || "[]");
      const map = {};
      if (Array.isArray(mcq)) {
        mcq.forEach((a) => { if (a && a.id && a.value) map[a.id] = a.value; });
      }
      setAnswers(map);
    } catch {}
  }, []);

  const canStart = about.trim().length >= 10;

  function saveAndGo() {
    try {
      const intake = {
        about: about.trim(),
        challenge: challenge.trim() || undefined,
        strength: strength.trim() || undefined,
        support: support.trim() || undefined,
        goal: about.trim(), // legacy compatibility
      };
      localStorage.setItem("ky_intake", JSON.stringify(intake));
      localStorage.setItem("ky_baseline", JSON.stringify({ energy, stability, finances, confidence }));
      const mcqArr = Object.keys(answers).map((id) => ({ id, value: answers[id] }));
      localStorage.setItem("ky_mcq", JSON.stringify(mcqArr));
      if (!localStorage.getItem("ky_trial_start")) {
        localStorage.setItem("ky_trial_start", new Date().toISOString());
      }
    } catch {}
    router.push("/trial/1");
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700 grid place-items-center">
      <div className="rounded-2xl bg-white p-8 shadow max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
        <p className="mt-2 text-gray-700">
          Give me enough signal to tailor your 30 days. First question is required; the rest are optional but helpful.
        </p>

        {/* Required longform */}
        <label className="block mt-6 text-sm font-medium text-gray-900">
          Tell me about yourself (struggles, wins, what matters most) <span className="text-rose-600">*</span>
        </label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Write as much as you like."
          className="mt-2 w-full rounded-xl border border-black/10 p-4 outline-none focus:ring-2 focus:ring-black"
          rows={5}
        />

        {/* Optional longform */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">What feels stuck right now? (optional)</label>
            <textarea
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 p-3 outline-none focus:ring-2 focus:ring-black"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">What strength will you lean on? (optional)</label>
            <textarea
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 p-3 outline-none focus:ring-2 focus:ring-black"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Where could you use support? (optional)</label>
            <textarea
              value={support}
              onChange={(e) => setSupport(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 p-3 outline-none focus:ring-2 focus:ring-black"
              rows={3}
            />
          </div>
        </div>

        {/* Baseline sliders */}
        <p className="mt-6 text-sm text-gray-700">
          Adjust the categories below to match where you're at <strong>today</strong>.
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Energy</span><span className="font-mono">{energy}</span>
            </div>
            <input type="range" min={0} max={100} value={energy} onChange={(e)=>setEnergy(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Stability</span><span className="font-mono">{stability}</span>
            </div>
            <input type="range" min={0} max={100} value={stability} onChange={(e)=>setStability(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Finances</span><span className="font-mono">{finances}</span>
            </div>
            <input type="range" min={0} max={100} value={finances} onChange={(e)=>setFinances(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Self-confidence</span><span className="font-mono">{confidence}</span>
            </div>
            <input type="range" min={0} max={100} value={confidence} onChange={(e)=>setConfidence(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        {/* 30 MCQs */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Quick discovery (30 multiple-choice)</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {MCQS.map((q) => (
              <fieldset key={q.id} className="rounded-xl border border-black/10 p-3">
                <legend className="text-sm font-medium text-gray-900">{q.prompt}</legend>
                <div className="mt-2 grid gap-2">
                  {q.options.map((opt) => {
                    const checked = (answers[q.id] === opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 rounded-lg border p-2 cursor-pointer transition ${checked ? "border-gray-900 bg-gray-50" : "border-black/10 hover:bg-gray-50"}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.id}
                          checked={checked}
                          onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                          className="accent-black"
                        />
                        <span className="text-sm text-gray-900">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <button
          onClick={saveAndGo}
          disabled={!canStart}
          className="mt-8 w-full inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-gray-900 text-white font-semibold shadow transition hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          Begin your 30-day trial
        </button>
      </div>
    </main>
  );
}
