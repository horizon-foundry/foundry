"use client";

import { useSyncExternalStore } from "react";

// The address a visitor asked for, on the 404 page's readout. The 404 is
// prerendered once for every missing address, so the server cannot know the
// path: the server HTML carries none, and the browser adds its own after
// hydration. It follows the status in the readout, so its arrival moves
// nothing that was already there.
const subscribe = () => () => {};

export function RequestedPath() {
  const path = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => null,
  );
  if (!path) return null;
  return <span className="readout-detail">{path}</span>;
}
