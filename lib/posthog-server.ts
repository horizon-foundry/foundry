import "server-only";
import { PostHog } from "posthog-node";

/*
  Server-side PostHog capture for the funnel stages that happen in server
  actions and route handlers (see CLAUDE.md "Instrumentation" for the event
  plan; capture code conforms to that table).

  Reliability posture: flushAt 1 / flushInterval 0 sends each event
  immediately (Fly machines auto-stop when idle, so buffered events could be
  lost), and callers never await the send in a request path. Env-gated: no key
  means no client and every helper no-ops; analytics being down must never
  break sign-in.
*/

let client: PostHog | null | undefined;

function getClient(): PostHog | null {
  if (client !== undefined) return client;
  const key = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  client = key
    ? new PostHog(key, {
        host: "https://us.i.posthog.com",
        flushAt: 1,
        flushInterval: 0,
      })
    : null;
  return client;
}

export function captureServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): void {
  getClient()?.capture({ distinctId, event, properties });
}

// Merges a pre-auth identity (the email that requested the magic link) into
// the authenticated user id, so the intent stage joins the funnel.
export function aliasServer(distinctId: string, alias: string): void {
  getClient()?.alias({ distinctId, alias });
}
