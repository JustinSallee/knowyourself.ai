"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const AVATARS = ["🦊","🐼","🐯","🐸","🐶","🐱","🦄","🐙","🐨","🐵"];

type Profile = { displayName?: string; avatar?: string };

export default function AccountPage() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({});

  useEffect(() => {
    sb.auth.getUser().then(({data}) => setEmail(data.user?.email ?? null));
    try {
      const p = JSON.parse(localStorage.getItem("ky_profile") || "{}");
      setProfile(p);
    } catch {}
  }, [sb]);

  function save() {
    try {
      localStorage.setItem("ky_profile", JSON.stringify(profile));
      alert("Saved!");
    } catch {}
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700 grid place-items-center">
      <div className="rounded-2xl bg-white p-8 shadow max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
        {email && <p className="mt-1 text-sm text-gray-600">{email}</p>}

        <label className="block mt-6 text-sm font-medium text-gray-900">
          Display name
        </label>
        <input
          value={profile.displayName ?? ""}
          onChange={(e)=>setProfile(p=>({...p, displayName:e.target.value}))}
          placeholder="What should we call you?"
          className="mt-2 w-full rounded-xl border border-black/10 p-3 outline-none focus:ring-2 focus:ring-black"
        />

        <div className="mt-6">
          <div className="text-sm font-medium text-gray-900">Pick an avatar</div>
          <div className="mt-3 grid grid-cols-5 gap-3">
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={()=>setProfile(p=>({...p, avatar:a}))}
                className={`aspect-square rounded-2xl text-2xl grid place-items-center border transition ${
                  profile.avatar===a ? "border-gray-900 bg-gray-50" : "border-black/10 hover:bg-gray-50"
                }`}
                aria-label={`Choose avatar ${a}`}
              >
                <span>{a}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={save}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-gray-900 text-white font-semibold shadow hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            Save
          </button>
          <a
            href="/chat"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 border border-black/10 font-semibold shadow"
          >
            Back to Chat
          </a>
        </div>

        <div className="mt-8 border-t border-black/10 pt-6">
          <div className="text-sm font-medium text-gray-900">Billing & account</div>
          <p className="text-sm text-gray-600 mt-1">Coming soon.</p>
        </div>
      </div>
    </main>
  );
}
