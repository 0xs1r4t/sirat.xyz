"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";

import { Icons } from "@/components/Icons";
import { Tooltip } from "@/components/Tooltip";

type NavNames = "home" | "garden" | "graphics" | "linkedin" | "github";

interface NavInfo {
  link: string;
  type: "internal" | "external";
  icon: JSX.Element | string;
}

const navLinks: Record<NavNames, NavInfo> = {
  home: {
    link: "/",
    type: "internal",
    icon: <Icons.home size={36} />,
  },
  garden: { link: "/garden", type: "internal", icon: "🌼" },
  graphics: {
    link: "/graphics",
    type: "internal",
    icon: <Icons.palette size={36} />,
  },
  linkedin: {
    link: "https://www.linkedin.com/in/siratbaweja/",
    type: "external",
    icon: <Icons.linkedin size={36} />,
  },
  github: {
    link: "https://github.com/0xs1r4t/",
    type: "external",
    icon: (
      <Icons.github className="w-[36px] h-[36px] hover:mix-blend-overlay" />
    ),
  },
};

// Navigation and Social Links

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      {/* Button to toggle the sidebar */}
      <Tooltip
        label={`click to ${isOpen ? "close" : "expand"} sidebar`}
        placement="left"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed z-20 flex justify-center items-center p-1 aspect-square bottom-4 rounded-s-md bg-muted-100 border-2 border-muted-200 transition-all duration-500 ease-in-out
            ${isOpen ? "right-[17.75rem]" : "right-0"}`}
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

      {/* Navigation bar */}
      <nav
        className={`flex flex-row justify-around fixed z-30 w-[17.5rem] items-center bottom-2 right-2 py-1.5 lg:py-2 bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden transition-transform duration-500 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-72"}`}
        aria-hidden={!isOpen}
      >
        {Object.entries(navLinks).map(([key, value]) => (
          <span
            key={key}
            className="text-4xl rounded-md hover:bg-muted-200 transition-colors duration-300"
          >
            <Link
              aria-label={key}
              href={value.link}
              className="cursor-pointer"
              target={value.type === "external" ? "_blank" : "_self"}
              rel={value.type === "external" ? "noopener noreferrer" : ""}
            >
              {value.icon}
            </Link>
          </span>
        ))}
      </nav>
    </Fragment>
  );
};

export default Navbar;
