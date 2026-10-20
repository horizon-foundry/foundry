import { createElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders one of the project's markdown docs, themed via .doc-prose (globals.css)
// in IBM Plex Serif. Raw HTML is not enabled, content is trusted project docs.
//
// Headings are shifted down one level (h1 -> h2, h2 -> h3, ...) because these
// docs render *inside* a page that already owns the single <h1>. This keeps one
// h1 per page and a valid heading order (WCAG 1.3.1 / 2.4.10). Visual styling is
// unchanged: .doc-prose styles h2/h3 to read as the doc's title/section.
const shift = {
  h1: "h2",
  h2: "h3",
  h3: "h4",
  h4: "h5",
  h5: "h6",
} as const;

// With `anchors`, each heading gets an id from its text, so a link can point
// into a long doc (the skill page's full SKILL.md is opened by such a link).
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function heading(level: keyof typeof shift, anchors: boolean) {
  return function H({ children }: { children?: ReactNode }) {
    const id = anchors ? headingId(textOf(children)) || undefined : undefined;
    return createElement(shift[level], { id }, children);
  };
}

// `className` adds a surface's own rules on top of .doc-prose (the skill page
// sets its heading offsets and sizes in app/styles/skill.css), so the shared
// look the Behind-the-Build pages use is never edited for one surface.
export function MarkdownDoc({
  content,
  anchors = false,
  className = "",
}: {
  content: string;
  anchors?: boolean;
  className?: string;
}) {
  return (
    <article className={`doc-prose ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: heading("h1", anchors),
          h2: heading("h2", anchors),
          h3: heading("h3", anchors),
          h4: heading("h4", anchors),
          h5: heading("h5", anchors),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
