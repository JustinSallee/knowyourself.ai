import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Single place to set your model
// Options: "gpt-5", "gpt-5-mini", "gpt-4o", etc. Snapshots optional like "gpt-5-2025-06-24"
const CHAT_MODEL = process.env.CHAT_MODEL ?? "gpt-5-mini";

export async function POST(req: Request) {
  try {
    const { messages }:{ messages: Array<{ role:"system"|"user"|"assistant"; content:string }> } = await req.json();

    // Hard stop if nothing to answer
    if (!messages?.length) {
      return NextResponse.json({ reply: "Ask me something" });
    }

    // Basic non streaming reply first so we can confirm it works again
    const result = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.4,
      messages,
      // remove any tools you added for moon phase
      // tools: [], 
    });

    const msg = result.choices?.[0]?.message;
    let text = msg?.content?.trim() ?? "";

    // If you later re add tools, handle them safely with a type guard
    // const toolCalls = msg?.tool_calls ?? [];
    // for (const call of toolCalls) {
    //   if (call.type !== "function") continue; // type guard fixes TS error
    //   const name = call.function.name;
    //   const args = JSON.parse(call.function.arguments || "{}");
    //   // run your function here and append to text or follow up
    // }

    if (!text) {
      text = "I did not get a reply from the model";
    }
    return NextResponse.json({ reply: text });
  } catch (err:any) {
    console.error("chat route error", err);
    return NextResponse.json({ reply: "Server error. Check logs" }, { status: 500 });
  }
}
