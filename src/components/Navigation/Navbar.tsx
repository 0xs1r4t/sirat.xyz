"use client";

import React, { Fragment, useState } from "react";

import PopOutButton from "@/components/PopOutButton";
import MusicPlayerContainer from "@/components/Navigation/NavbarContainer";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <PopOutButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        placement="right"
        position="top"
      />
      <MusicPlayerContainer isOpen={isOpen} />
    </Fragment>
  );
};

export default Navbar;
