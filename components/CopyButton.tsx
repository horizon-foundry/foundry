"use client";

import { useState } from "react";
import posthog from "posthog-js";

// A minimal copy-to-clipboard control for command blocks. Keyboard reachable,
// gives a brief confirmation, and degrades to inert text if the clipboard API
// is unavailable.
// When `analytics` is set, a successful copy fires install_copied (the
// adoption funnel's intent stage; see CLAUDE.md Instrumentation).
//
// Two looks. `joined` is the control on the edge of a command field
// (.cmd-copy in globals.css): a filled box in the field's text color. The
// default is the older bordered chip, for the pages the rebrand has not
// reached.
export function CopyButton({
  text,
  label = "commands",
  analytics,
  joined = false,
}: {
  text: string;
  label?: string;
  analytics?: { command_kind: string; surface: string };
  joined?: boolean;
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
      className={
        joined
          ? "cmd-copy"
          : "min-h-11 min-w-11 shrink-0 border border-ledger px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-wide text-fg-2 transition-colors hover:border-fg hover:text-fg"
      }
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
