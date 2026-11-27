import { MarkdownDoc, headingId } from "@/components/MarkdownDoc";

// One of the project's own docs as a hub page: the doc's name and its
// sections in the heading column, the text beside it (app/styles/behind.css,
// "A rendered doc"). The name is the file's own first heading and each
// section link is one of its own second-level headings, so nothing here is
// written twice. Below the two-column width the section list is not drawn:
// the doc reads top to bottom on a phone.
// A doc links its siblings by file name, which is right in the repository
// and a dead link on the site: /behind/DESIGN.md is no page. Each sibling
// has a tab here, so the link goes to the tab.
const SIBLING: Record<string, string> = {
  "DESIGN.md": "/behind/design-system",
  "PRODUCT.md": "/behind/product",
  "BRAND.md": "/behind/brand",
};
const toTabs = (md: string) =>
  md.replace(/\]\((DESIGN|PRODUCT|BRAND)\.md\)/g, (_, name) => `](${SIBLING[`${name}.md`]})`);

export function BehindDoc({ content }: { content: string }) {
  const lines = toTabs(content).split("\n");
  const first = lines.findIndex((l) => l.trim() !== "");
  const hasTitle = first !== -1 && lines[first].startsWith("# ");
  const title = hasTitle ? lines[first].slice(2).trim() : null;
  const body = hasTitle ? lines.slice(first + 1).join("\n") : lines.join("\n");

  // Second-level headings outside code fences.
  const sections: string[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    else if (!fenced && line.startsWith("## ")) sections.push(line.slice(3).trim());
  }

  return (
    <section className="bh-sec" data-ground="ink" aria-labelledby="doc-heading">
      <div className="wrap bh-doc-grid">
        <div className="bh-doc-side">
          <h2 id="doc-heading" className="d-statement">
            {title}
          </h2>
          {sections.length > 1 && (
            <nav aria-label={`${title}: sections`} className="bh-toc">
              {sections.map((s) => (
                <a key={s} href={`#${headingId(s)}`}>
                  {s}
                </a>
              ))}
            </nav>
          )}
        </div>
        <MarkdownDoc content={body} anchors className="bh-doc" />
      </div>
    </section>
  );
}
