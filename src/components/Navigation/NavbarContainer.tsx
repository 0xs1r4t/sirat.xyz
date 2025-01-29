"use client";

import React from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

import SpotifyPlayer from "@/components/Navigation/SpotifyPlayer";
import SocialLinks from "@/components/Navigation/SocialLinks";

interface NavbarContainerProps {
  isOpen: boolean;
}

const NavbarContainer = ({ isOpen }: NavbarContainerProps) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          aria-label="sidebar"
          initial={{ x: -192, scaleX: 0.5 }} // -48 * 4 = -192
          animate={{ x: 0, scaleX: 1 }}
          exit={{ x: -192, scaleX: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 50,
            x: { duration: 0.25 },
            scaleX: { duration: 0.3 },
          }}
          className={`flex flex-col fixed z-30 items-center justify-between top-16 left-2 py-1.5 lg:py-2 w-44 bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden`}
          aria-hidden={!isOpen}
        >
          <SpotifyPlayer />
          <SocialLinks />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavbarContainer;
