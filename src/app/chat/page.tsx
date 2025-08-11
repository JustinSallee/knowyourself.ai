'use client';

import React from 'react';

export default function ChatPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold">KnowYourself.ai</h1>
        <p className="opacity-80">
          Tailwind is working. Page compiles. Now paste your real chat UI back in here in small chunks.
        </p>

        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur shadow-lg border border-white/20">
          <p>If you see this frosted card, CSS is loaded.</p>
        </div>
      </div>
    </main>
  );
}
