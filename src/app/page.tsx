// src/app/chat/page.tsx
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

export default function ChatIndex() {
  const id = randomUUID();
  redirect(`/chat/${id}`);
}
