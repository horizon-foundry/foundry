import posthog from "posthog-js";

// Client-side PostHog bootstrap (Next runs this file once in the browser
// before the app hydrates). Env-gated: without the key this is a no-op and
// posthog-js calls elsewhere are guarded, so local dev and tests send nothing.
// NEXT_PUBLIC_POSTHOG_KEY is inlined at build time (set via fly.toml build
// args for the Docker build); a phc key is public by design.
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: "https://us.i.posthog.com",
    defaults: "2025-05-24",
    // No injected external scripts (remote config, recorder, surveys): we use
    // none of those features, the injection caused a React hydration mismatch
    // by inserting a script where the JSON-LD sits, and dropping it keeps the
    // CSP surface to event capture only. Revisit if replay/surveys are wanted.
    disable_external_dependency_loading: true,
  });
}
