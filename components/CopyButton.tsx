"use client";

import { useState } from "react";
import posthog from "posthog-js";

// A minimal copy-to-clipboard control for command blocks. Keyboard reachable,
// gives a brief confirmation, and degrades to inert text if the clipboard API
// is unavailable. Mono and understated to match the instrument brand.
// When `analytics` is set, a successful copy fires install_copied (the
// adoption funnel's intent stage; see CLAUDE.md Instrumentation).
export function CopyButton({
  text,
  label = "commands",
  analytics,
}: {
  text: string;
  label?: string;
  analytics?: { command_kind: string; surface: string };
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      if (analytics && posthog.__loaded) {
        posthog.capture("install_copied", analytics);
      }
    } catch {
      // Clipboard blocked (insecure context, denied permission): no-op, the
      // commands are still visible and selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
      className="min-h-11 min-w-11 shrink-0 rounded-sm border border-line px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint transition-colors hover:border-line-strong hover:text-bone-dim"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
