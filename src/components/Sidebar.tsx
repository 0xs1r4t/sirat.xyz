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
      <nav
        aria-label="sidebar"
        className={`flex flex-col fixed z-30 items-center justify-between top-16 left-2 py-1.5 lg:py-2 w-44 bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden transition-transform duration-500 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-48"}`}
        aria-hidden={!isOpen}
      >
        <SpotifyPlayer />
        <span aria-hidden="true">&nbsp;</span>
        <span aria-hidden="true">&nbsp;</span>

        {/* Navigation and Social Links */}
        <div className="flex flex-col flex-nowrap">
          <p>
            <Link
              aria-label="home"
              href="/"
              className="place-self-start cursor-pointer rounded-md hover:bg-muted-200 lg:text-lg px-1 py-0.5 transition-colors duration-300"
            >
              <span aria-hidden="true">{"🏡 "}</span>
              home
            </Link>
          </p>
          <p>
            <Link
              aria-label="garden"
              href="/garden"
              className="cursor-pointer rounded-md hover:bg-muted-200 lg:text-lg px-1 py-0.5 transition-colors duration-300"
            >
              <span aria-hidden="true">{"🌼 "}</span>
              garden
            </Link>
          </p>
          <p>
            <Link
              aria-label="graphics"
              href="/graphics"
              className="cursor-pointer rounded-md hover:bg-muted-200 lg:text-lg px-1 py-0.5 transition-colors duration-300"
            >
              <span aria-hidden="true">{"🎨 "}</span>
              graphics
            </Link>
          </p>
          <p>
            <Link
              aria-label="my github"
              href="https://github.com/0xs1r4t/"
              className="cursor-pointer flex flex-nowrap flex-row gap-2 items-center rounded-md hover:bg-muted-200 lg:text-lg w-min pl-2 pr-1 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.github className="w-3.5 h-3.5 lg:w-[18px] lg:h-[18px] mix-blend-overlay" />{" "}
              github
            </Link>
          </p>
          <p>
            <Link
              aria-label="my linkedin"
              href="https://www.linkedin.com/in/siratbaweja/"
              className="cursor-pointer flex flex-nowrap flex-row gap-2 items-center rounded-md hover:bg-muted-200 lg:text-lg w-min pl-2 pr-1 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.linkedin className="w-3.5 h-3.5 lg:w-[18px] lg:h-[18px] mix-blend-overlay" />{" "}
              linkedin
            </Link>
          </p>
        </div>
      </nav>
    </Fragment>
  );
};

export default Sidebar;
