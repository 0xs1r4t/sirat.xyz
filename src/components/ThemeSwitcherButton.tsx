"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";
import { Tooltip } from "@/components/Tooltip";
import { Icons } from "@/components/Icons";
import type { Theme } from "@/lib/themes";

const ThemeSwitcherButton = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes: Record<Theme, React.ReactNode> = {
    "strawberry-matcha": <Icons.matcha />,
    "neopolitan-ice-cream": <Icons.iceCream />,
    "blueberry-lemon": <Icons.cheesecake />,
  };

  return (
    <div
      role="group"
      aria-label="theme"
      className="flex flex-col md:flex-row gap-1 top-0 right-0 absolute z-50"
    >
      {Object.entries(themes).map(([key, value]) => (
        <Tooltip
          key={key}
          label={`switch the theme to ${key.replaceAll("-", " ")}!`}
          placement="bottom"
        >
          {/* No scale anywhere here on purpose — a static w-9 h-9 box is
              required to stay pixel-identical to PopOutButton at all
              times, not just at rest. The idle bob is position-only
              (animate-bob, globals.css) so it can't change the measured
              size either. Plain <button>, not motion.button: once scale
              was the only framer-motion-driven property, a CSS keyframe
              covers what's left without pulling the dependency back in. */}
          <button
            key={key}
            className={`z-20 w-9 h-9 self-end inline-flex justify-center items-center top-14 mt-2 mr-2 rounded-md bg-muted-100 border-2 border-muted-200
            ${mounted && theme === key ? "ring-2 ring-offset-0 ring-link animate-bob" : ""}
            transition duration-200 ease-out
            hover:drop-shadow-muted-200 hover:drop-shadow-[0_0_2px]
            focus:border-2 focus:rounded-lg focus:border-muted-200 focus:ring-2 focus:ring-link focus:drop-shadow-muted-200 focus:drop-shadow-[0_0_2px]`}
            aria-label={`${key.replaceAll("-", " ")} theme`}
            aria-pressed={mounted && theme === key}
            onClick={() => {
              setTheme(key);
            }}
          >
            {value}
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default ThemeSwitcherButton;
