"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Stitches the browser to the authenticated identity: the Supabase user id is
// THE distinct id (CLAUDE.md Instrumentation). Rendered by the /reports layout
// only when a visitor is signed in. No-ops when analytics is not initialized.
export function PostHogIdentify({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  useEffect(() => {
    if (!posthog.__loaded) return;
    posthog.identify(userId, { email });
  }, [userId, email]);

  return null;
}
