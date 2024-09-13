"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import SpotifyPlayer from "@/components/SpotifyPlayer";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      {/* Button to toggle the sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-20 flex justify-center items-center p-1 h-max top-14 rounded-e-md bg-muted-100 border-2 border-muted-200 transition-all duration-500 ease-in-out
          ${isOpen ? "left-[10.75rem]" : "left-0"}`}
      >
        <span
          aria-label="hidden"
          className={`${
            isOpen ? "rotate-0" : "rotate-180"
          } transition-transform duration-300 ease-in-out`}
        >
          <Icons.chevron />
        </span>
      </button>

      {/* Sidebar navigation */}
      <nav
        aria-label="sidebar"
        className={`flex flex-col fixed z-30 items-center justify-between top-12 left-4 p-2 w-40 min-h-96 max-h-[90%] bg-muted-100 border-2 border-muted-200 rounded-lg overflow-y-scroll transition-transform duration-500 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-44"}`}
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
              className="cursor-pointer hover:bg-muted-200 hover:rounded-md px-1 py-0.5 transition-colors duration-300"
            >
              <span aria-hidden="true">{"🏡 "}</span>
              home
            </Link>
          </p>
          <p>
            <Link
              aria-label="garden"
              href="/garden"
              className="cursor-pointer hover:bg-muted-200 hover:rounded-md px-1 py-0.5 transition-colors duration-300"
            >
              <span aria-hidden="true">{"🌼 "}</span>
              garden
            </Link>
          </p>
          <p>
            <Link
              aria-label="graphics"
              href="/graphics"
              className="cursor-pointer hover:bg-muted-200 hover:rounded-md px-1 py-0.5 transition-colors duration-300"
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
