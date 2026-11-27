import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BehindNav } from "@/components/BehindNav";
import "../styles/behind.css";

// The hub's frame, in the dark instrument's grammar: a Slate head under the
// pinned Ink header (the h1, the lead and the four tabs), then the tab's own
// page, which opens on Ink. The current tab is Ink too, so it and its page
// read as one piece. Each page states the ground of each of its sections.
export default function BehindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" data-ground="ink">
        <section
          className="bh-head"
          data-ground="slate"
          aria-labelledby="behind-heading"
        >
          <div className="wrap">
            <div className="bh-head-grid">
              <h1 id="behind-heading" className="d-h2">
                How this was made
              </h1>
              <p className="t-lead">
                The project&apos;s own curated artifacts, rendered in product:
                the overview, the design system, the review philosophy, and
                the brand.
              </p>
            </div>
            <BehindNav />
          </div>
        </section>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
