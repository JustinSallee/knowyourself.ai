import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt || "hello" }],
    });
    return Response.json({ text: chat.choices[0].message.content });
  } catch (err: any) {
    return new Response(err?.message || "OpenAI error", { status: 500 });
  }
}
