"use client";

import React, { Fragment, useState } from "react";

import { Icons } from "@/components/Icons";
import { Tooltip } from "@/components/Tooltip";
import SpotifyPlayer from "@/components/SpotifyPlayer";

const MusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      {/* Button to toggle the sidebar */}
      <Tooltip
        label={`click to ${isOpen ? "close" : "expand"} sidebar`}
        placement="right"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed z-20 flex justify-center items-center p-1 aspect-square top-[4.5rem] rounded-e-md bg-muted-100 border-2 border-muted-200 transition-all duration-500 ease-in-out
          ${isOpen ? "left-[11.25rem]" : "left-0"}`}
        >
          <span
            aria-label="hidden"
            className={`${
              isOpen ? "rotate-0" : "rotate-180"
            } transition-transform duration-500 ease-in-out`}
          >
            <Icons.doubleChevron className="w-4 h-4 lg:w-5 lg:h-5" />
          </span>
        </button>
      </Tooltip>

      {/* Sidebar navigation */}
      <div
        aria-label="sidebar"
        className={`flex flex-col fixed z-30 items-center justify-between top-16 left-2 py-1.5 lg:py-2 w-44 bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden transition-transform duration-500 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-48"}`}
        aria-hidden={!isOpen}
      >
        <SpotifyPlayer />
      </div>
    </Fragment>
  );
};

export default MusicPlayer;
