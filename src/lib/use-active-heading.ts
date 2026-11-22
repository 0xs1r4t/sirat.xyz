"use client";

import { useEffect } from "react";

const HEADING_SELECTOR =
  "article h2, article h3, article h4, article h5, article h6";
const TOC_LINK_SELECTOR = ".toc-sidebar a";
const ACTIVE_CLASS = "toc-active";

/**
 * Highlights the table-of-contents link matching whichever article heading
 * is currently in view. Queries the document rather than taking a ref
 * because the article and the sidebar are rendered by separate components.
 */
export const useActiveHeading = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const headings = document.querySelectorAll(HEADING_SELECTOR);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          document.querySelectorAll(TOC_LINK_SELECTOR).forEach((link) => {
            link.classList.remove(ACTIVE_CLASS);
          });
          document
            .querySelector(`${TOC_LINK_SELECTOR}[href="#${entry.target.id}"]`)
            ?.classList.add(ACTIVE_CLASS);
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [enabled]);
};
