import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

// A figure in the site's frame grammar: a head with a caption at each end, the
// figure itself, and an optional figcaption. It is the frame that licenses a
// report excerpt's hue on a marketing page (DESIGN.md, the report-excerpt
// exception), so a frame holds a real excerpt or is captioned as illustrative.
// `reveal` makes the frame arm its own once-on-entry reveal (Reveal.tsx).
export function Frame({
  left,
  right,
  caption,
  reveal = false,
  className = "",
  style,
  children,
}: {
  left: ReactNode;
  right?: ReactNode;
  caption?: ReactNode;
  reveal?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const body = (
    <>
      <div className="frame-head">
        <span>{left}</span>
        {right != null && <span>{right}</span>}
      </div>
      {children}
      {caption != null && <figcaption>{caption}</figcaption>}
    </>
  );
  const classes = `frame ${className}`.trim();
  return reveal ? (
    <Reveal as="figure" className={classes} style={style}>
      {body}
    </Reveal>
  ) : (
    <figure className={classes} style={style}>
      {body}
    </figure>
  );
}
