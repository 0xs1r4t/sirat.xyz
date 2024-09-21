"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";

import { Icons } from "@/components/Icons";
import { Tooltip } from "@/components/Tooltip";
import SpotifyPlayer from "@/components/SpotifyPlayer";

const Sidebar = () => {
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
          className={`fixed z-20 flex justify-center items-center p-1 h-max top-14 rounded-e-md bg-muted-100 border-2 border-muted-200 transition-all duration-500 ease-in-out
          ${isOpen ? "left-[11.75rem]" : "left-0"}`}
        >
          <span
            aria-label="hidden"
            className={`${
              isOpen ? "rotate-0" : "rotate-180"
            } transition-transform duration-500 ease-in-out`}
          >
            <Icons.chevron className="w-4 h-4 lg:w-5 lg:h-5" />
          </span>
        </button>
      </Tooltip>

      {/* Sidebar navigation */}
      <nav
        aria-label="sidebar"
        className={`flex flex-col fixed z-30 items-center justify-between top-12 left-4 py-1.5 lg:py-2 w-44 max-h-96 min-h-[85%] bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden transition-transform duration-500 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-48"}`}
        aria-hidden={!isOpen}
      >
        <SpotifyPlayer />
        <div
          className={`flex flex-col transition-opacity duration-500 ease-in-out delay-150 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Navigation Links */}
          <p>
            <Link
              aria-label="home"
              href="/"
              className="cursor-pointer rounded-md hover:bg-muted-200 lg:text-lg px-1 py-0.5 transition-colors duration-500"
            >
              <span aria-hidden="true">{"🏡 "}</span>
              home
            </Link>
          </p>
          <p>
            <Link
              aria-label="garden"
              href="/garden"
              className="cursor-pointer rounded-md hover:bg-muted-200 lg:text-lg px-1 py-0.5 transition-colors duration-500"
            >
              <span aria-hidden="true">{"🌼 "}</span>
              garden
            </Link>
          </p>
          <p>
            <Link
              aria-label="graphics"
              href="/graphics"
              className="cursor-pointer rounded-md hover:bg-muted-200 lg:text-lg px-1 py-0.5 transition-colors duration-500"
            >
              <span aria-hidden="true">{"🎨 "}</span>
              graphics
            </Link>
          </p>
        </div>
      </nav>
    </Fragment>
  );
};

export default Sidebar;
