import Link from "next/link";
import { NAV, SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RequestedPath } from "@/components/RequestedPath";

// The 404, as the instrument would report it: the heading, then a readout in
// the Ink well a command sits in (the status, and the address that was asked
// for), the way home, and the three pages that do exist as ruled rows with
// their addresses. Slate under the Ink header, like every page's opening.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="fstate" data-ground="slate">
        <div className="wrap">
          <h1 className="d-title">No finding here.</h1>
          <div className="fstate-grid">
            <div>
              <p className="readout">
                <span>404 · not found</span>
                <RequestedPath />
              </p>
              <Link href="/" className="btn">
                Home
              </Link>
            </div>
            <nav aria-label="Pages">
              <ul className="rows" role="list">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="row-link">
                      <span className="row-name">{item.label}</span>
                      <span className="row-meta">{item.href}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
