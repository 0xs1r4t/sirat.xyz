"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import SpotifyPlayer from "@/components/Navigation/SpotifyPlayer";
import SocialLinks from "@/components/Navigation/SocialLinks";

interface NavbarContainerProps {
  isOpen: boolean;
}

const NavbarContainer = ({ isOpen }: NavbarContainerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          aria-label="sidebar"
          initial={{ x: -192, opacity: 0 }} // -48 * 4 = -192
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -192, opacity: 0.75 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40,
            opacity: { duration: 0.2 },
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
