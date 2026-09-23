"use client";

import posthog from "posthog-js";

// Sign-out posts to /auth/signout (POST-only; prefetch must not end a
// session). Before submitting, drop the analytics identity so a shared
// browser does not keep attributing events to the signed-out user.
export function SignOutButton() {
  return (
    <form
      action="/auth/signout"
      method="post"
      onSubmit={() => {
        if (posthog.__loaded) posthog.reset();
      }}
    >
      <button
        type="submit"
        /* active:text-bone, not only hover: this is the one .press call site with
           no border and no plate, so the reduced-motion border acknowledgement in
           globals.css cannot reach it, and a hover state confirms pointing rather
           than pressing and never matches a keyboard activation at all. Measured
           before this: holding Space on the focused button produced a
           pixel-identical frame under reduced motion. */
        className="press font-mono text-xs uppercase tracking-wide text-bone-faint transition-colors hover:text-bone active:text-bone"
      >
        Sign out
      </button>
    </form>
  );
}
