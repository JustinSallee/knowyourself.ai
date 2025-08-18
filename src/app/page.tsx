import TopNav from "@/components/TopNav";

export default function HomePage() {
  return (
    <main className="relative isolate min-h-dvh bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700">
      <TopNav />
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 text-white">
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-200">
            knowyourself.ai
          </span>
        </h1>
        <p className="mt-4 text-lg/7 text-white/90">
          Answer a few questions to get instant insight about who you are. Then chat to deepen it over time.
        </p>
        <div className="mt-8">
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 font-semibold shadow transition-all duration-150 hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            Start
          </a>
        </div>
      </div>
    </main>
  );
}
