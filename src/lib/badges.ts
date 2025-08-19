// no "use client" here; this is a pure data module

export type BadgeDef = {
  key: string;       // "onboarding", "level1"..."level20"
  label: string;     // human-friendly label
  icon: string;      // emoji icon
};

export const BADGE_DEFS: BadgeDef[] = [
  { key: "onboarding", label: "Onboarding", icon: "🚀" },

  { key: "level1",  label: "Self-Awareness",        icon: "🧭" },
  { key: "level2",  label: "Emotional Regulation",  icon: "🧘" },
  { key: "level3",  label: "Growth Mindset",        icon: "🌱" },
  { key: "level4",  label: "Focus & Attention",     icon: "🔦" },
  { key: "level5",  label: "Time Management",       icon: "⏱️" },
  { key: "level6",  label: "Habit Building",        icon: "🔁" },
  { key: "level7",  label: "Communication",         icon: "🗣️" },
  { key: "level8",  label: "Active Listening",      icon: "👂" },
  { key: "level9",  label: "Empathy",               icon: "💞" },
  { key: "level10", label: "Boundaries",            icon: "🚧" },
  { key: "level11", label: "Conflict Resolution",   icon: "⚖️" },
  { key: "level12", label: "Collaboration",         icon: "🤝" },
  { key: "level13", label: "Leadership",            icon: "🦁" },
  { key: "level14", label: "Decision-Making",       icon: "🔍" },
  { key: "level15", label: "Problem-Solving",       icon: "🧩" },
  { key: "level16", label: "Creativity",            icon: "🎨" },
  { key: "level17", label: "Resilience",            icon: "🛡️" },
  { key: "level18", label: "Stress Management",     icon: "😌" },
  { key: "level19", label: "Relationship Skills",   icon: "🧑‍🤝‍🧑" },
  { key: "level20", label: "Purpose & Values",      icon: "🌟" },
];

export const LEVEL_KEYS = BADGE_DEFS
  .filter(b => b.key.startsWith("level"))
  .map(b => b.key);
