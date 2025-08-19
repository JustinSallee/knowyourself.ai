import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message, system } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages: ChatCompletionMessageParam[] = [];
    if (system) messages.push({ role: "system", content: String(system) });
    messages.push({ role: "user", content: String(message || "Hello!") });

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const reply = r.choices?.[0]?.message?.content?.trim() || "";
    return Response.json({ reply });
  } catch (e: any) {
    return Response.json({ error: e?.message || "OpenAI error" }, { status: 500 });
  }
}
