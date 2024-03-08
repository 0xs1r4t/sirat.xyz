"use client";

import React from "react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <span>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        🔦
      </button>
      {/* <button
        className="m-2 p-1 rounded-md text-2xl bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
        onClick={() => setTheme("system")}
      >
        💾
      </button> */}
    </span>
  );
};

export default ThemeToggle;
