"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowser } from "../lib/supabaseClient";

/* ---------------- Helpers ---------------- */

function log(...args) { try { console.log("[KY]", ...args); } catch {} }

function parseAIResponse(json) {
  return (json?.text || json?.results || "").toString().trim();
}

async function saveRun({ userId = "anon", smartPct, seconds, totals, loveTotals, aiText }) {
  try {
    const res = await fetch("/api/runs/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, smartPct, seconds, totals, loveTotals, aiText })
    });
    log("saveRun status:", res.status);
  } catch (e) {
    log("saveRun failed:", e?.message || e);
  }
}

/* ---------------- Question set (45) ---------------- */

const Q = (text, options) => ({ text, options });
const O = (text, scores) => ({ text, scores });

const QUESTIONS = [
  // ---------------- COGNITIVE (10) ----------------
  Q("What is 18 × 3?", [
    O("48", { smart: 0 }),
    O("54", { smart: 1, analytic: 1 }),
    O("57", { smart: 0 }),
    O("63", { smart: 0 })
  ]),
  Q("Closest estimate: minutes in 48 hours", [
    O("1440", { smart: 0 }),
    O("1920", { smart: 0 }),
    O("2880", { smart: 1, analytic: 1 }),
    O("4320", { smart: 0 })
  ]),
  Q("Fair coin. Chance of 4 heads in a row?", [
    O("1/8", { smart: 0 }),
    O("1/12", { smart: 0 }),
    O("1/16", { smart: 1, analytic: 1 }),
    O("1/32", { smart: 0 })
  ]),
  Q("Pattern next: 2, 5, 11, 23, __", [
    O("35", { smart: 0 }),
    O("46", { smart: 0 }),
    O("47", { smart: 1, analytic: 1 }),
    O("51", { smart: 0 })
  ]),
  Q("A train averages 60 mph for 2h then 30 mph for 1h. Average speed?", [
    O("40 mph", { smart: 0 }),
    O("45 mph", { smart: 1, analytic: 1 }),
    O("50 mph", { smart: 0 }),
    O("55 mph", { smart: 0 })
  ]),
  Q("All drims are fex. Some fex are gols. What must be true?", [
    O("Some drims are gols", { smart: 0 }),
    O("All gols are drims", { smart: 0 }),
    O("We cannot be sure any drim is a gol", { smart: 1, analytic: 1 }),
    O("Most fex are drims", { smart: 0 })
  ]),
  Q("What percent discount is 80 dropping to 60?", [
    O("20%", { smart: 0 }),
    O("25%", { smart: 1, analytic: 1 }),
    O("30%", { smart: 0 }),
    O("35%", { smart: 0 })
  ]),
  Q("You must estimate a quantity quickly. Best approach?", [
    O("Break into round numbers and combine", { smart: 1, analytic: 1 }),
    O("Guess once and move on", { smart: 0 }),
    O("Wait until exact data arrives", { smart: 0 }),
    O("Ask a friend and average", { smart: 0 })
  ]),
  Q("Cube nets: which statement is true?", [
    O("Opposite faces never share an edge", { smart: 1, analytic: 1 }),
    O("Opposite faces always share an edge", { smart: 0 }),
    O("Every face touches every face", { smart: 0 }),
    O("Two opposite faces share a vertex and edge", { smart: 0 })
  ]),
  Q("You have tasks: 40m hard, 30m medium, 20m easy; 70 minutes free. Best move?", [
    O("Do the hard one, then reassess", { smart: 1, analytic: 1, practical: 1 }),
    O("Do medium now, easy later", { smart: 0 }),
    O("Do the easy now for momentum", { smart: 0 }),
    O("Skip planning; start anywhere", { smart: 0 })
  ]),

  // ------------- BEHAVIORAL / WORK (15) -------------
  Q("You feel scattered. First move?", [
    O("Write a 2-minute plan then act", { smart: 1, practical: 1 }),
    O("Open every tab and grind", { smart: 0 }),
    O("Pick one tiny task and finish it", { smart: 1, practical: 1 }),
    O("Wait for motivation to kick in", { smart: 0 })
  ]),
  Q("You adopt a new tool. First step?", [
    O("Run a 10-minute test on a real task", { smart: 1, practical: 1, sm: 1 }),
    O("Skim docs and identify 2 key features", { smart: 1, analytic: 1 }),
    O("Ask a teammate for a quick demo", { smart: 1, social: 1, vc: 1 }),
    O("Commit fully and migrate everything", { smart: 0 })
  ]),
  Q("Preferred focus style", [
    O("Deep focus blocks", { smart: 1, analytic: 1 }),
    O("Short bursts with variety", { smart: 1, creative: 1 }),
    O("Task hopping to keep momentum", { smart: 1, practical: 1 }),
    O("Ambient multitasking all day", { smart: 0 })
  ]),
  Q("Deciding fast with limited info", [
    O("Use a simple rule you trust", { smart: 1, practical: 1 }),
    O("Find one disconfirming fact first", { smart: 1, analytic: 1 }),
    O("Avoid deciding until forced", { smart: 0 }),
    O("Flip a coin", { smart: 0 })
  ]),
  Q("You hit a wall on a hard problem", [
    O("Change the frame and try a new angle", { smart: 1, creative: 1 }),
    O("Sleep on it and return fresh", { smart: 1, practical: 1 }),
    O("Phone a domain expert for 10 minutes", { smart: 1, social: 1 }),
    O("Force it longer the same way", { smart: 0 })
  ]),
  Q("Best way to improve a skill long term", [
    O("Tight practice w/ immediate feedback", { smart: 1, analytic: 1 }),
    O("Track reps & review weekly", { smart: 1, practical: 1 }),
    O("Read more, practice later", { smart: 0 }),
    O("Only do it; never review", { smart: 0 })
  ]),
  Q("When plans change last minute", [
    O("Replan quickly and move", { smart: 1, practical: 1 }),
    O("Get annoyed but adapt soon", { smart: 1, analytic: 1 }),
    O("Treat as chance to explore", { smart: 1, creative: 1 }),
    O("Cancel everything", { smart: 0 })
  ]),
  Q("Handling distraction", [
    O("Silence phone + set a 25-min timer", { smart: 1, practical: 1 }),
    O("Batch notifications every hour", { smart: 1, analytic: 1 }),
    O("Multitask a bit of everything", { smart: 0 }),
    O("Let distractions steer the day", { smart: 0 })
  ]),
  Q("Morning routine preference", [
    O("Plan day on paper then start", { smart: 1, analytic: 1 }),
    O("Start first task immediately", { smart: 1, practical: 1 }),
    O("Scan for inspiration and pivot", { smart: 1, creative: 1 }),
    O("Open inbox and react", { smart: 0 })
  ]),
  Q("Feedback you prefer first", [
    O("Blunt specifics", { smart: 1, analytic: 1, vc: 1 }),
    O("Encouragement then suggestions", { smart: 1, social: 1, vc: 1 }),
    O("Stories & analogies", { smart: 1, creative: 1, vc: 1 }),
    O("Vague vibes only", { smart: 0 })
  ]),
  Q("Explain a complex idea quickly", [
    O("Start with a concrete example", { smart: 1, social: 1 }),
    O("Lead with 1-sentence summary", { smart: 1, analytic: 1 }),
    O("Only metaphors, no specifics", { smart: 0 }),
    O("Only jargon and theory", { smart: 0 })
  ]),
  Q("Persuading a smart skeptic", [
    O("Show data + limits; be honest", { smart: 1, analytic: 1 }),
    O("Give small trial to de-risk", { smart: 1, practical: 1 }),
    O("Heavy social proof", { smart: 0 }),
    O("Avoid specifics to stay flexible", { smart: 0 })
  ]),
  Q("Onboarding a partner to a shared goal", [
    O("Define roles + early wins", { smart: 1, practical: 1, sm: 1 }),
    O("Align on success metrics", { smart: 1, analytic: 1 }),
    O("Talk vibes then see", { smart: 1, social: 1 }),
    O("Let them guess expectations", { smart: 0 })
  ]),
  Q("You need fresh ideas by tomorrow", [
    O("Generate 30 rough ideas fast", { smart: 1, creative: 1 }),
    O("Perfect 3 ideas in depth", { smart: 1, analytic: 1 }),
    O("Recruit 2 people to brainstorm", { smart: 1, social: 1 }),
    O("Wait for inspiration", { smart: 0 })
  ]),
  Q("Pick a risk profile", [
    O("Moderate upside, controlled risk", { smart: 1, analytic: 1 }),
    O("Small safe wins compounding", { smart: 1, practical: 1 }),
    O("Moonshot, high risk/reward", { smart: 1, creative: 1 }),
    O("No risk ever", { smart: 0 })
  ]),

  // ------------- RELATIONSHIPS / PERSONAL (20) -------------
  Q("You catch your partner texting an ex", [
    O("Address it now and ask for context", { smart: 1, relational: 1, social: 1, ea: 1, vc: 1 }),
    O("Sleep on it; plan a calm talk", { smart: 1, relational: 1, analytic: 1, ea: 1 }),
    O("Agree on boundaries going forward", { smart: 1, relational: 1, sm: 1 }),
    O("Secretly monitor for a while", { smart: 0 })
  ]),
  Q("During a fight, voices are rising", [
    O("Call a 20-minute timeout, resume", { smart: 1, relational: 1, practical: 1, ea: 1 }),
    O("Switch to writing to cool down", { smart: 1, vc: 1 }),
    O("Name the core issue and table tangents", { smart: 1, analytic: 1 }),
    O("Push through and win the point", { smart: 0 })
  ]),
  Q("Your partner asks for your phone passcode; you feel uneasy", [
    O("Explain boundary + offer reassurance", { smart: 1, relational: 1, ea: 1 }),
    O("Offer specific transparency instead (photos, messages)", { smart: 1, vc: 1 }),
    O("Share it but discuss scope/timeframe", { smart: 1, sm: 1 }),
    O("Refuse with insults", { smart: 0 })
  ]),
  Q("You hurt their feelings. Best repair", [
    O("Own it, name impact, ask what helps", { smart: 1, relational: 1, social: 1, vc: 1, ea: 1 }),
    O("Apologize + change a behavior commitment", { smart: 1, sm: 1 }),
    O("Give space then check in with care", { smart: 1, pp: 1 }),
    O("Say sorry but defend intent", { smart: 0 })
  ]),
  Q("They get flirty DMs", [
    O("Agree on boundaries + reply plan", { smart: 1, relational: 1, ea: 1 }),
    O("Draft a respectful reply together", { smart: 1, sm: 1, vc: 1 }),
    O("Ignore DMs; focus on trust practices", { smart: 1, relational: 1 }),
    O("Log in and delete messages", { smart: 0 })
  ]),
  Q("Which feels most like love right now", [
    O("Acts that make life easier", { smart: 1, relational: 1, practical: 1, sm: 1 }),
    O("Feeling truly understood in words", { smart: 1, relational: 1, vc: 1 }),
    O("Undivided attention and presence", { smart: 1, relational: 1, pp: 1 }),
    O("Playful touch and closeness", { smart: 1, relational: 1, ph: 1 })
  ]),
  Q("Money talks as a couple should happen", [
    O("Monthly with a simple dashboard", { smart: 1, relational: 1, analytic: 1, sm: 1 }),
    O("Quarterly, focused on trends", { smart: 1, analytic: 1 }),
    O("After any major purchase", { smart: 1, practical: 1 }),
    O("Only during crises", { smart: 0 })
  ]),
  Q("Partner’s family drops by unannounced often", [
    O("Align with partner; set a visiting window", { smart: 1, relational: 1, ea: 1 }),
    O("Move visits to neutral locations", { smart: 1, practical: 1 }),
    O("Host less; plan shared calendar times", { smart: 1, sm: 1 }),
    O("Say nothing and resent it", { smart: 0 })
  ]),
  Q("Partner texts less during busy weeks", [
    O("Agree on expectations/busy signals", { smart: 1, relational: 1, ea: 1, vc: 1 }),
    O("Plan a short daily check-in time", { smart: 1, pp: 1 }),
    O("Send one clear request, not 20 texts", { smart: 1, vc: 1 }),
    O("Assume disinterest and withdraw", { smart: 0 })
  ]),
  Q("Best trust builder over time", [
    O("Keep small promises consistently", { smart: 1, relational: 1, practical: 1, sm: 1 }),
    O("Own mistakes + visible repairs", { smart: 1, ea: 1 }),
    O("Regular transparency rituals", { smart: 1, vc: 1 }),
    O("One grand gesture", { smart: 0 })
  ]),
  Q("Affection preference", [
    O("Hugs/hand-holding often", { smart: 1, relational: 1, ph: 1 }),
    O("Eye contact & deep conversation", { smart: 1, relational: 1, vc: 1, pp: 1 }),
    O("Playful physicality (dance, sports, etc.)", { smart: 1, ph: 1 }),
    O("Sweet surprises or mementos", { smart: 1, relational: 1, sg: 1 })
  ]),
  Q("Quality time ideal", [
    O("Phones away, single focus", { smart: 1, relational: 1, pp: 1 }),
    O("Working on something together", { smart: 1, relational: 1, sm: 1 }),
    O("Adventures and shared experiences", { smart: 1, relational: 1, ph: 1, sg: 1 }),
    O("Parallel play (together, separate tasks)", { smart: 1, relational: 1, pp: 1 })
  ]),
  Q("What unlocks you in conflict", [
    O("Hearing you’re understood in words", { smart: 1, vc: 1, ea: 1 }),
    O("Seeing consistent follow-through", { smart: 1, sm: 1 }),
    O("Time together without interruptions", { smart: 1, pp: 1 }),
    O("Humor to lower the heat", { smart: 1, social: 1 })
  ]),
  Q("Gift style that lands best", [
    O("Useful upgrades for daily life", { smart: 1, sg: 1, sm: 1 }),
    O("Something with a story behind it", { smart: 1, sg: 1, vc: 1 }),
    O("Experience we’ll remember", { smart: 1, sg: 1, ph: 1 }),
    O("A letter that says the unsaid", { smart: 1, vc: 1 })
  ]),
  Q("Gesture that would matter most this month", [
    O("Taking a task off my plate", { smart: 1, sm: 1 }),
    O("A heartfelt note or talk", { smart: 1, vc: 1 }),
    O("Focused time just for us", { smart: 1, pp: 1 }),
    O("More hugs and affectionate touch", { smart: 1, ph: 1 })
  ]),
  Q("Boundaries feel best when", [
    O("Clear and discussed", { smart: 1, relational: 1, ea: 1 }),
    O("Agreed and written somewhere", { smart: 1, sm: 1 }),
    O("Implied but revisited as needed", { smart: 1, social: 1 }),
    O("Not needed if love is real", { smart: 0 })
  ]),
  Q("When jealousy spikes you prefer", [
    O("Talk through the feeling", { smart: 1, ea: 1, vc: 1 }),
    O("Extra reassurance by action", { smart: 1, sm: 1 }),
    O("Space + a planned reconnect", { smart: 1, pp: 1 }),
    O("Pretend it isn’t happening", { smart: 0 })
  ]),
  Q("When stressed you usually", [
    O("Do one tiny next step", { smart: 1, practical: 1 }),
    O("Time-box 10 minutes then reassess", { smart: 1, analytic: 1 }),
    O("Open a new project instead", { smart: 1, creative: 1 }),
    O("Quit entirely", { smart: 0 })
  ]),
  Q("You relate best with a partner who", [
    O("Names things directly but kindly", { smart: 1, vc: 1, ea: 1 }),
    O("Helps move life forward together", { smart: 1, sm: 1 }),
    O("Protects time and attention", { smart: 1, pp: 1 }),
    O("Fills silence so you don’t have to", { smart: 0 })
  ]),
  Q("If a plan slips for good reasons", [
    O("Reset expectations explicitly", { smart: 1, analytic: 1, relational: 1 }),
    O("Renegotiate scope and next check-in", { smart: 1, practical: 1, sm: 1 }),
    O("Say it’s fine; track it mentally", { smart: 1, social: 1 }),
    O("Pretend nothing changed", { smart: 0 })
  ])
];

const TRAITS = ["analytic", "creative", "practical", "social", "relational"];
const LOVE_KEYS = ["vc", "sm", "pp", "ph", "sg", "ea"];
const LOVE_LABELS = {
  vc: "Verbal Connection",
  sm: "Shared Missions",
  pp: "Presence Priority",
  ph: "Physical Harmony",
  sg: "Symbolic Gestures",
  ea: "Emotional Availability"
};

const MAX_SMART = QUESTIONS.reduce((sum, q) => {
  const best = Math.max(...q.options.map(o => o.scores.smart || 0));
  return sum + best;
}, 0);

/* ---------------- Local helpers ---------------- */

function mmss(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}
function pickThinkingType(totals) {
  const r = TRAITS.map(k => ({ k, v: totals[k] || 0 })).sort((a, b) => b.v - a.v);
  const top = r[0]?.k, second = r[1]?.k;
  const map = {
    "analytic+practical": "Strategic Operator",
    "analytic+creative": "Systems Innovator",
    "creative+practical": "Adaptive Builder",
    "social+relational": "Trust Architect",
    "analytic+relational": "Calm Mediator",
    "creative+social": "Narrative Catalyst"
  };
  return map[`${top}+${second}`] || (top ? top[0].toUpperCase() + top.slice(1) + " Lean" : "Balanced");
}
function dominantLove(loveTotals) {
  let bestKey = "vc", best = -Infinity;
  for (const k of LOVE_KEYS) {
    const v = loveTotals[k] || 0;
    if (v > best) { best = v; bestKey = k; }
  }
  return { key: bestKey, label: LOVE_LABELS[bestKey] };
}
function localWriteup(totals, smartPct, seconds, loveTotals) {
  const type = pickThinkingType(totals);
  const { label } = dominantLove(loveTotals);
  const pace = seconds <= 180 ? "fast" : seconds <= 480 ? "steady" : "deliberate";
  const p1 = `Smartness Score ${smartPct}/100. Your profile trends ${type}: you steady the signal and turn ideas into motion without a lot of noise.`;
  const p2 = `Your pace reads ${pace}; decisions don’t stall, but you keep enough verification to stay confident. In close relationships you value ${label.toLowerCase()} cues, which is why simple consistency lands so well.`;
  const p3 = `You do best when expectations are explicit and cycles are short enough to see cause–effect. Keep the environment light on friction and you compound quickly.`;
  return [p1, p2, p3];
}

/* ---------------- Component ---------------- */

export default function Page() {
  // Supabase (browser) client
  const supabase = useMemo(() => getSupabaseBrowser(), []);

  // Auth
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user || null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [supabase]);

  async function signIn() {
    if (!email) return alert("Enter your email first");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) alert(error.message);
    else alert("Sign-in link sent! Check your email.");
  }
  async function signOut() { await supabase.auth.signOut(); }

  // Quiz state
  const [screen, setScreen] = useState("intro"); // intro | quiz | results
  const [index, setIndex] = useState(0);
  const [totals, setTotals] = useState({ smart: 0, analytic: 0, creative: 0, practical: 0, social: 0, relational: 0 });
  const [loveTotals, setLoveTotals] = useState({ vc: 0, sm: 0, pp: 0, ph: 0, sg: 0, ea: 0 });
  const [hoverIdx, setHoverIdx] = useState(-1);

  // Timer
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // AI result
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startQuiz = () => { setScreen("quiz"); startTimer(); };

  const handleAnswer = (scores) => {
    setTotals(prev => {
      const next = { ...prev };
      for (const k of Object.keys(scores)) {
        if (TRAITS.includes(k) || k === "smart") next[k] = (next[k] || 0) + (scores[k] || 0);
      }
      return next;
    });
    setLoveTotals(prev => {
      const next = { ...prev };
      for (const k of Object.keys(scores)) {
        if (LOVE_KEYS.includes(k)) next[k] = (next[k] || 0) + (scores[k] || 0);
      }
      return next;
    });
    setIndex(i => i + 1);
    setHoverIdx(-1);
  };

  const finished = index >= QUESTIONS.length;
  const smartPct = useMemo(
    () => Math.max(0, Math.min(100, Math.round((totals.smart / MAX_SMART) * 100)))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totals.smart]
  ;

  // On finish: stop timer, call AI, then save the run
  useEffect(() => {
    if (!finished || screen === "results") return;

    stopTimer();
    setScreen("results");
    setLoading(true);
    setErrorMsg("");

    const userId = user?.id ? user.id : "anon";
    log("Finish → calling /api/generate with", { smartPct, seconds, totals, loveTotals, userId });

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totals, loveTotals, seconds, smartPct, userId })
    })
      .then(async (r) => {
        log("generate status:", r.status);
        const json = await r.json().catch(() => ({}));
        const ai = parseAIResponse(json);
        setAiText(ai);
        log("AI text length:", ai.length);

        return saveRun({ userId, smartPct, seconds, totals, loveTotals, aiText: ai });
      })
      .catch(async (err) => {
        log("generate failed:", err?.message || err);
        setErrorMsg("AI write-up unavailable. Showing a local summary.");
        await saveRun({ userId, smartPct, seconds, totals, loveTotals, aiText: "" });
      })
      .finally(() => setLoading(false));
  }, [finished, screen, totals, loveTotals, seconds, smartPct, user]);

  const restart = () => {
    stopTimer();
    setScreen("intro");
    setIndex(0);
    setTotals({ smart: 0, analytic: 0, creative: 0, practical: 0, social: 0, relational: 0 });
    setLoveTotals({ vc: 0, sm: 0, pp: 0, ph: 0, sg: 0, ea: 0 });
    setHoverIdx(-1);
    setSeconds(0);
    setAiText("");
    setErrorMsg("");
  };

  const progress = screen === "quiz" ? Math.min(1, index / QUESTIONS.length) : 0;

  // Styles (dark)
  const ui = {
    page: { minHeight: "100vh", background: "#0b0f1a", color: "#e5e7eb", display: "flex", alignItems: "center" },
    shell: { width: "100%", maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "system-ui, Arial" },
    card: { background: "#0f172a", border: "1px
