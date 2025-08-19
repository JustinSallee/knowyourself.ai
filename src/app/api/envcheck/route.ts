import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    chatModel: process.env.CHAT_MODEL ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}
