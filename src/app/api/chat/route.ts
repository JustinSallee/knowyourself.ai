// src/app/api/chat/route.ts
import OpenAI from "openai";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_MODEL = process.env.CHAT_MODEL ?? "gpt-5-nano";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama3-8b-8192";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    let messages: ChatMessage[] | undefined = body?.messages;
    if (!messages && typeof body?.message === "string") {
      messages = [{ role: "user", content: body.message }];
    }
    if (!messages?.length) {
      return NextResponse.json({ reply: "Ask me something" });
    }
    messages = messages.map(m => ({ role: m.role, content: String(m.content ?? "") })) as ChatMessage[];
    const temperature = typeof body?.temperature === "number" ? body.temperature : 0.4;

    // 1) MOCK: develop without any key/billing
    if (process.env.MOCK_AI === "1") {
      const last = messages[messages.length - 1]?.content ?? "";
      const reply =
        `🔧 Mock reply: ${last.slice(0, 140) || "Hello"}\n\n` +
        `• This is running in MOCK_AI mode\n• Turn off MOCK_AI when billing/keys are ready`;
      return NextResponse.json({ reply, providerUsed: "mock", modelUsed: "mock" });
    }

    // 2) OpenAI (if key present)
    const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const r = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          temperature,
          messages,
          max_tokens: 350,
        });
        const text = r.choices?.[0]?.message?.content?.trim() ?? "";
        return NextResponse.json({
          reply: text || "I did not get a reply from the model",
          providerUsed: "openai",
          modelUsed: OPENAI_MODEL,
        });
      } catch (err: any) {
        const status = err?.status || err?.response?.status;
        // Fall through to Groq on common “can’t use model right now” cases
        if (![400, 401, 402, 403, 404, 429].includes(status)) {
          // unknown error; still try Groq as a backup
        }
      }
    }

    // 3) Groq fallback (if key present)
    const groqKey = (process.env.GROQ_API_KEY || "").trim();
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const r = await groq.chat.completions.create({
          model: GROQ_MODEL,
          temperature,
          messages,
          max_tokens: 350,
        });
        const text = r.choices?.[0]?.message?.content?.trim() ?? "";
        return NextResponse.json({
          reply: text || "I did not get a reply from the model",
          providerUsed: "groq",
          modelUsed: GROQ_MODEL,
        });
      } catch (err: any) {
        const status = err?.status || err?.response?.status || 500;
        let detail = err?.message || "Unknown error";
        try {
          const data = await err?.response?.json();
          if (data?.error?.message) detail = data.error.message;
        } catch {}
        return NextResponse.json({ reply: `Server error via Groq: ${detail}` }, { status });
      }
    }

    return NextResponse.json(
      { reply: "No AI provider configured. Set OPENAI_API_KEY or GROQ_API_KEY, or use MOCK_AI=1." },
      { status: 500 }
    );
  } catch (outer: any) {
    return NextResponse.json({ reply: `Server error: ${outer?.message || "Unknown"}` }, { status: 500 });
  }
}
