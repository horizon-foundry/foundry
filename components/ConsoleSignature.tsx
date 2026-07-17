"use client";

import { useEffect } from "react";

// A quiet reward for the curious: developers open the console, so leave them
// something product-specific (not AI-slop filler). Logged once per load.
export function ConsoleSignature() {
  useEffect(() => {
    const label = "color:#d99a2e;font-weight:600"; // the forge glow
    const dim = "color:#8b94a4";
    const bone = "color:#e8ecf0";
    console.log(
      "%cFoundry%c  a Horizon Foundry suite\n" +
        "%cSkills that keep an AI-built codebase honest as it grows.\n\n" +
        "%c/production-audit%c  a pre-launch audit that ends in a verdict\n" +
        "%cmake install%c     install the suite\n\n" +
        "%cForging What's Next.",
      "color:#e8ecf0;font-weight:700;font-size:13px",
      dim,
      bone,
      label,
      dim,
      label,
      dim,
      dim,
    );
  }, []);

  return null;
}
