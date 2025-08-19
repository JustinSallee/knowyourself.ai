// src/app/chat/page.tsx
import { redirect } from "next/navigation";

export default function ChatIndex() {
  // Generate a unique id without importing 'crypto'
  const id =
    (globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2));

  redirect(`/chat/${id}`);
}
