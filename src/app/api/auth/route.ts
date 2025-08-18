// app/quiz/page.tsx
import { requireSessionOrRedirect } from '@/lib/auth-helpers';

export default async function QuizPage() {
  await requireSessionOrRedirect('/signin?next=/quiz');
  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Smartness Score</h1>
      <p className="text-base">Quiz content goes here. Wire up your questions and state.</p>
    </main>
  );
}
