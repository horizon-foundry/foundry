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

function heading(level: keyof typeof shift) {
  return function H({ children }: { children?: ReactNode }) {
    return createElement(shift[level], null, children);
  };
}

export function MarkdownDoc({ content }: { content: string }) {
  return (
    <article className="doc-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: heading("h1"),
          h2: heading("h2"),
          h3: heading("h3"),
          h4: heading("h4"),
          h5: heading("h5"),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
