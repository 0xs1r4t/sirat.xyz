"use client";

import React, { useEffect } from "react";
import { AnimatePresence, LazyMotion } from "motion/react";
import * as m from "motion/react-m";

const loadFeatures = () =>
  import("@/lib/features/min").then((res) => res.default);

interface PostSidebarContainerProps {
  isOpen: boolean;
  description: string;
  tocHtml: string;
}

const PostSidebarContainer = ({
  isOpen,
  description,
  tocHtml,
}: PostSidebarContainerProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const headings = document.querySelectorAll(
      "article h2, article h3, article h4, article h5, article h6",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document
              .querySelectorAll(".toc-sidebar a")
              .forEach((l) => l.classList.remove("toc-active"));
            const active = document.querySelector(
              `.toc-sidebar a[href="#${entry.target.id}"]`,
            );
            active?.classList.add("toc-active");
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <LazyMotion features={loadFeatures}>
          <m.div
            aria-label="post sidebar"
            initial={{ x: 192, scaleX: 0.5 }}
            animate={{
              x: 0,
              scaleX: 1,
              y: [0, -1, 0],
              transition: {
                y: { repeat: Infinity, duration: 1, ease: "easeInOut" },
              },
            }}
            exit={{ x: 192, scaleX: 0.5 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 50,
              x: { type: "spring", duration: 0.5 },
              scaleX: { type: "spring", duration: 0.5 },
            }}
            className="flex flex-col fixed z-30 top-16 right-2 py-1.5 lg:py-2 w-44 max-h-[calc(100vh-5rem)] bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden"
            aria-hidden={!isOpen}
          >
            {/* Description */}
            <div className="flex flex-col border-b-2 border-muted-200 max-h-[38%] min-h-[80px]">
              <h3 className="sticky top-0 text-2xl italic font-bold font-that-that-new-pixel px-3 pt-2 pb-1 bg-muted-100 z-10 shrink-0">
                about
              </h3>
              <div className="px-3 pb-2 overflow-y-auto overflow-x-hidden">
                <p className="text-sm leading-snug">{description}</p>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
              <h3 className="sticky top-0 text-2xl italic font-bold font-that-that-new-pixel px-3 pt-2 pb-1 bg-muted-100 z-10 shrink-0">
                contents
              </h3>
              <div className="px-3 pb-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <div
                  className="toc-sidebar text-sm leading-snug"
                  dangerouslySetInnerHTML={{ __html: tocHtml }}
                />
              </div>
            </div>
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>
  );
};

export default PostSidebarContainer;
