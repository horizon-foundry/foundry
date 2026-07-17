import { MarkdownDoc } from "@/components/MarkdownDoc";
import { readDoc, stripSection } from "@/lib/docs";

export const metadata = { title: "Product" };

export default function ProductDoc() {
  // Public projection: PRODUCT.md opens with the frame (intent, unconfirmed
  // assumptions, open findings, and the security-frame specifics), which the
  // document skill's section-level rule marks internal-by-default. The public
  // product tab renders the present-tense truth sections only; the frame stays
  // in the gated internal portal (the repo).
  const content = stripSection(readDoc("PRODUCT.md"), "The frame");
  return <MarkdownDoc content={content} />;
}
