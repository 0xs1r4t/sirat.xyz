"use client";

import React from "react";

import SpotifyPlayer from "@/components/Navigation/SpotifyPlayer";
import SocialLinks from "@/components/Navigation/SocialLinks";

interface NavbarContainerProps {
  isOpen: boolean;
}

const NavbarContainer = ({ isOpen }: NavbarContainerProps) => {
  return (
    <div
      aria-label="sidebar"
      className={`flex flex-col fixed z-30 items-center justify-between top-16 left-2 py-1.5 lg:py-2 w-44 bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden transition-transform duration-500 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-48"}`}
      aria-hidden={!isOpen}
    >
      <SpotifyPlayer />
      <SocialLinks />
    </div>
  );
};

export default NavbarContainer;
