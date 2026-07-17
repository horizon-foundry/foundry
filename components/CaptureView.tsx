"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Fires one analytics event when the page actually renders in the browser.
// Client-side on purpose: a server-component capture would also fire on link
// prefetch and inflate the funnel. No-ops when analytics is not initialized.
export function CaptureView({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  useEffect(() => {
    if (!posthog.__loaded) return;
    posthog.capture(event, properties);
    // Intentionally fire-once per mount; properties are stable per page view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
