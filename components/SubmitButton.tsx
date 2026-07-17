"use client";

import { useFormStatus } from "react-dom";

// Server-action submit with a pending state: the magic-link request is a real
// network round-trip, and a button that stays inert reads as broken. Disabled
// while pending also prevents double submission (double emails burn the
// free-tier send quota fast).
export function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="press min-h-11 w-full border border-line-strong bg-bone px-3 py-2.5 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
