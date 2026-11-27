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
      className="btn ul-submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
