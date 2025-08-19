// src/app/api/chat/route.ts
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions";

export const runtime = "nodejs";

// --- simple moon phase helper (server-side) ---
function moonPhaseInfo(date = new Date()) {
  const msPerDay = 86400000;
  const synodic = 29.530588853; // days
  const d = date.getTime() / msPerDay + 2440587.5; // Julian Day Number
  const daysSince = d - 2451550.1; // ref new moon 2000-01-06 18:14 UTC
  const phase = (daysSince % synodic + synodic) % synodic; // 0..29.53
  const illum = (1 - Math.cos((2 * Math.PI * phase) / synodic)) / 2; // 0..1
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
    illumination: Number((illum * 100).toFixed(1)),
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
        properties: { dateISO: { type: "string", description: "ISO datetime (optional)" } },
        additionalProperties: false,
      },
    },
  },
];

function safeParse(json: string) {
  try { return JSON.parse(json || "{}"); } catch { return {}; }
}

export async function POST(req: Request) {
  try {
    const { message, system } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });

    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o";

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          (system as string) ||
          "You are KnowYourself.ai. Be clear and helpful. Use available tools for time or moon questions.",
      },
      { role: "user", content: String(message || "Hello!") },
    ];

    // First pass with tools enabled
    let r = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      tools,
      tool_choice: "auto",
    });

    const firstMsg = r.choices?.[0]?.message;
    const toolCalls = firstMsg?.tool_calls as ChatCompletionMessageToolCall[] | undefined;

    const convo: ChatCompletionMessageParam[] = [...messages];
    if (firstMsg) convo.push(firstMsg);

    // Narrow tool calls by type before accessing `.function`
    if (toolCalls?.length) {
      for (const call of toolCalls) {
        if (call.type === "function") {
          const name = call.function.name;
          const args = safeParse(call.function.arguments || "{}");

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
          } else {
            // unknown function: return a stub so the model can respond gracefully
            convo.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify({ error: "unsupported_tool", name }),
            });
          }
        } else {
          // Not a function tool; acknowledge so the model can continue
          convo.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({ error: "unsupported_tool_type", type: call.type }),
          });
        }
      }

      // Second pass to produce the final message with tool outputs
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
