// src/app/page.tsx

export default function HomePage() {
  return (
    <main className="relative isolate min-h-dvh">
      <section className="mx-auto max-w-3xl px-4 py-16 text-white">
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-200">
            KnowYourself.ai
          </span>
        </h1>
        <p className="mt-4 text-lg/7 text-white/90">
          Answer a few questions to get instant insight about who you are. Then chat to deepen it over time.
        </p>
      </section>
    </main>
  );
}
