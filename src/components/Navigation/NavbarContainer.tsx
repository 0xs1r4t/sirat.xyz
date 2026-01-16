"use client";

import React from "react";
import { AnimatePresence, LazyMotion } from "motion/react";
import * as m from "motion/react-m";

import SpotifyPlayer from "@/components/Navigation/SpotifyPlayer";
import SocialLinks from "@/components/Navigation/SocialLinks";

const loadFeatures = () =>
  import("@/lib/features/min").then((res) => res.default);

interface NavbarContainerProps {
  isOpen: boolean;
}

const NavbarContainer = ({ isOpen }: NavbarContainerProps) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <LazyMotion features={loadFeatures}>
          <m.div
            aria-label="sidebar"
            initial={{ x: -192, scaleX: 0.5 }} // -48 * 4 = -192
            animate={{
              x: 0,
              scaleX: 1,
              y: [0, -1, 0],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 1,
                  ease: "easeInOut",
                },
              },
            }}
            exit={{ x: -192, scaleX: 0.5 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 50,
              x: { type: "spring", duration: 0.5 },
              scaleX: { type: "spring", duration: 0.5 },
            }}
            className={`flex flex-col fixed z-30 items-center justify-between top-16 left-2 py-1.5 lg:py-2 w-44 bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden`}
            aria-hidden={!isOpen}
          >
            <SpotifyPlayer />
            <SocialLinks />
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>
  );
};

export default NavbarContainer;
