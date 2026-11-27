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
      <button type="submit" className="rp-link">
        Sign out
      </button>
    </form>
  );
}
