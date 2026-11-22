"use client";

import React, { Fragment } from "react";

import PopOutButton from "@/components/PopOutButton";
import MusicPlayerContainer from "@/components/Navigation/NavbarContainer";
import { useSidebar } from "@/contexts/SidebarContext";

const Navbar = () => {
  const { leftOpen, toggleLeft } = useSidebar();

  return (
    <Fragment>
      <PopOutButton
        isOpen={leftOpen}
        onToggle={toggleLeft}
        placement="left"
        label="Site sidebar"
        controlsId="site-sidebar"
      />
      <MusicPlayerContainer isOpen={leftOpen} />
    </Fragment>
  );
};

export default Navbar;
