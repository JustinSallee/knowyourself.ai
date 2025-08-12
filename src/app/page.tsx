'use client';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Quiz card (kept light for contrast against dark page) */}
      <section className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-xl backdrop-blur">
        <h2 className="text-3xl font-semibold text-white">Take the 3 minute quiz</h2>
        <p className="mt-2 text-slate-200/80">
          Your profile seeds memory so answers feel tailored from message one.
        </p>
        <div className="mt-5">
          <button
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold
                       text-white shadow-md active:scale-[0.99]
                       bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500
                       hover:from-indigo-400 hover:via-fuchsia-400 hover:to-amber-400">
            Start quiz
          </button>
        </div>
      </section>

      {/* Assistant bubble — dark */}
      <section className="rounded-2xl border border-white/10 bg-slate-800/70 p-6 shadow-lg backdrop-blur text-slate-100">
        <p className="leading-relaxed">
          Welcome to KnowYourself.ai. Ask me anything. Your quiz profile helps me
          personalize answers.
        </p>
        <div className="mt-3 text-xs text-slate-300/80">now</div>
      </section>

      {/* Input bar — dark */}
      <section className="sticky bottom-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 shadow-xl backdrop-blur">
          <form
            className="flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: hook into your existing send logic
              alert('Wire this to your send handler');
            }}
          >
            <input
              placeholder="Ask anything"
              className="flex-1 h-12 rounded-xl border border-white/10 bg-slate-800/80
                         px-4 text-slate-100 placeholder:text-slate-400 outline-none
                         focus:ring-4 focus:ring-indigo-500/30"
            />
            <button
              type="submit"
              className="h-12 rounded-xl px-5 font-semibold text-white
                         bg-gradient-to-r from-cyan-500 to-indigo-500
                         hover:from-cyan-400 hover:to-indigo-400 active:scale-[0.99]">
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
