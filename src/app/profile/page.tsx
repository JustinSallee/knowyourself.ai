"use client";
import { useEffect, useState } from "react";
import { loadProfile, saveProfile } from "@/lib/profile";
import Link from "next/link";

const AVATARS = ["🦊","🐼","🐻","🐯","🦁","🐶","🐱","🐧","🐸","🦉"];

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setName((p as any).displayName || "");
      setAvatar((p as any).avatar || AVATARS[0]);
    }
  }, []);

  function save() {
    saveProfile({ displayName: name.trim() || undefined, avatar });
    alert("Saved!");
  }

  return (
    <main className="min-h-dvh grid place-items-center">
      <div className="rounded-2xl bg-white p-8 shadow max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
        <p className="mt-2 text-gray-700">
          Pick a display name and an avatar. Billing & account settings will live here later.
        </p>

        <label className="block mt-6 text-sm font-medium text-gray-900">Display name</label>
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="e.g., Jordan"
          className="mt-2 w-full rounded-xl border border-black/10 p-3 outline-none focus:ring-2 focus:ring-black"
        />

        <div className="mt-6">
          <div className="text-sm font-medium text-gray-900">Avatar</div>
          <div className="mt-3 grid grid-cols-5 gap-3">
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={()=>setAvatar(a)}
                className={`text-2xl aspect-square rounded-xl border p-3 transition ${
                  avatar === a ? "border-gray-900 bg-gray-50" : "border-black/10 hover:bg-gray-50"
                }`}
                aria-label={`Choose avatar ${a}`}
              >
                <span>{a}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={save} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-gray-900 text-white font-semibold">Save</button>
          <Link href="/chat" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 border border-black/10 font-semibold">Back to chat</Link>
        </div>
      </div>
    </main>
  );
}
