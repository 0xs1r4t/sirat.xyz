"use client";

import React from "react";
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
            className="flex flex-col fixed z-30 top-16 right-2 py-1.5 lg:py-2 w-44 max-h-[calc(100vh-5rem)] bg-muted-100 border-2 border-muted-200 rounded-lg overflow-y-auto overflow-x-hidden"
            aria-hidden={!isOpen}
          >
            {/* Description */}
            <div className="flex flex-col border-b-2 pb-2 border-muted-200 max-h-[40%] min-h-[100px] overflow-y-auto overflow-x-hidden">
              <h3 className="text-2xl font-that-that-new-pixel px-3 pt-2 pb-1 top-0 underline underline-offset-4 bg-muted-100 z-10">
                About
              </h3>
              <div className="px-3 pb-2 flex-1">
                <p className="text-lg leading-tight">{description}</p>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <h3 className="text-2xl font-that-that-new-pixel px-3 pt-2 pb-1 top-0 underline underline-offset-4 bg-muted-100 z-10">
                Contents
              </h3>
              <div className="px-3 pb-2 flex-1">
                <div
                  className="toc-sidebar text-lg leading-tight"
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
