import Link from "next/link";
export default function StartQuizButton() {
  return (
    <Link
      href="/onboarding"
      className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 font-semibold shadow transition-all duration-150 hover:shadow-md hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      aria-label="Start"
    >
      Start
    </Link>
  );
}
