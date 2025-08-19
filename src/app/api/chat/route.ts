// src/app/api/chat/route.ts
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

export const runtime = "nodejs";

// Simple moon phase calculator (approximate but solid for Q&A)
function moonPhaseInfo(date = new Date()) {
  // Algorithm: days since known new moon, normalized to synodic month
  // Reference new moon: 2000-01-06 18:14 UTC (JDN 2451550.1)
  const msPerDay = 86400000;
  const synodic = 29.530588853; // days
  const d = date.getTime() / msPerDay + 2440587.5; // Julian Day Number
  const daysSince = d - 2451550.1;
  let phase = (daysSince % synodic + synodic) % synodic; // 0..29.53
  const illum = (1 - Math.cos((2 * Math.PI * phase) / synodic)) / 2; // 0..1

  // Name buckets
  const idx = Math.floor(((phase / synodic) * 8) + 0.5) % 8;
  const names = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];
  return {
    dateISO: date.toISOString(),
    phaseDays: phase,
    illumination: Number((illum * 100).toFixed(1)), // %
    name: names[idx],
  };
}

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_current_datetime",
      description: "Returns the current ISO datetime from the server.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_moon_phase",
      description:
        "Compute the moon phase for a given date (ISO). If no date provided, use 'now'. Returns phase name and illumination percent.",
      parameters: {
        type: "object",
        properties: {
          dateISO: { type: "string", description: "ISO datetime. Optional." },
        },
        additionalProperties: false,
      },
    },
  },
];

export async function POST(req: Request) {
  try {
    const { message, system } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Choose your model via env; defaults to a strong general model.
    const model = process.env.OPENAI_MODEL || "gpt-4o";

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          (system as string) ||
          "You are KnowYourself.ai. Be clear and helpful. If users ask about moon phase or today’s date, use the provided tools instead of deflecting.",
      },
      { role: "user", content: String(message || "Hello!") },
    ];

    // First call with tools enabled
    let r = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      tools,
      tool_choice: "auto",
    });

    // Handle tool calls (loop once or twice if needed)
    let toolCalls = r.choices[0]?.message?.tool_calls || [];
    const convo: ChatCompletionMessageParam[] = [...messages, r.choices[0].message];

    for (const call of toolCalls || []) {
      const name = call.function.name;
      const args = JSON.parse(call.function.arguments || "{}");

      if (name === "get_current_datetime") {
        const now = new Date().toISOString();
        convo.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify({ nowISO: now }),
        });
      } else if (name === "get_moon_phase") {
        const date = args?.dateISO ? new Date(args.dateISO) : new Date();
        const info = moonPhaseInfo(date);
        convo.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(info),
        });
      }
    }

    if (toolCalls.length > 0) {
      // Ask the model to produce the final answer with tool results
      r = await client.chat.completions.create({
        model,
        messages: convo,
        temperature: 0.7,
      });
    }

    const reply = r.choices?.[0]?.message?.content?.trim() || "";
    return Response.json({ reply });
  } catch (e: any) {
    return Response.json({ error: e?.message || "OpenAI error" }, { status: 500 });
  }
}
