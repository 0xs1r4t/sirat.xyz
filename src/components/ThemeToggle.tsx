"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Tooltip } from "@/components/Tooltip";
import { Icons } from "@/components/Icons";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <Tooltip label={`switch themes`} placement="left">
        <button
          aria-label="toggle dark/light theme"
          className="z-20 p-1.5 flex justify-center items-center top-14 mt-2 mr-2 rounded-md bg-muted-100 border-2 border-muted-200 transition-all duration-500 ease-in-out"
        >
          <Icons.spinner className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </Tooltip>
    );

  if (resolvedTheme === "dark") {
    return (
      <Tooltip label={`switch to a light theme`} placement="left">
        <button
          aria-label="light theme"
          className="z-20 p-1.5 flex justify-center items-center top-14 mt-2 mr-2 rounded-md bg-muted-100 border-2 border-muted-200 transition-all duration-500 ease-in-out"
          onClick={() => setTheme("light")}
        >
          <span aria-label="hidden">
            <Icons.sun className="w-4 h-4 lg:w-5 lg:h-5" />
          </span>
        </button>
      </Tooltip>
    );
  }
  if (resolvedTheme === "light") {
    return (
      <Tooltip label={`switch to a dark theme`} placement="left">
        <button
          aria-label="dark theme"
          className="z-20 p-1.5 flex justify-center items-center top-14 mt-2 mr-2 rounded-md bg-muted-100 border-2 border-muted-200 transition-all duration-500 ease-in-out"
          onClick={() => setTheme("dark")}
        >
          <span aria-label="hidden">
            <Icons.moon className="w-4 h-4 lg:w-5 lg:h-5" />
          </span>
        </button>
      </Tooltip>
    );
  }
};

export default ThemeToggle;
