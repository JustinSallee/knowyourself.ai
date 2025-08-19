// src/app/page.tsx

export default function HomePage() {
  return (
    <main className="relative isolate min-h-dvh">
      <section className="mx-auto max-w-3xl px-4 py-16 text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-200">
            KnowYourself.ai
          </span>
        </h1>

        <p className="mt-4 text-lg/7 text-white/90">
          Answer a few questions to get instant insight on who you truly are. Then use the AI assistant as you already do, and watch those insights deepen over time. Get current progress instantly anytime. Uncover personal blind spots, gain clarity on love languages, relationships, &amp; more!
        </p>
        <p className="mt-2 text-sm text-white/70">
          Powered by OpenAI&apos;s ChatGPT
        </p>

        <div className="mt-8 flex gap-3">
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 font-semibold shadow transition-all duration-150 hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            Start
          </a>
          <a
            href="/trial/1"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white/10 ring-1 ring-white/30 text-white font-semibold transition hover:bg-white/10"
          >
            Go to Quiz
          </a>
          <a
            href="/chat"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-black text-white font-semibold"
          >
            Chat
          </a>
        </div>
      </section>
    </main>
  );
}
