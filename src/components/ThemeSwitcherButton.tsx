"use client";

import { useEffect, useState } from "react";
import * as motion from "motion/react-client";

import { useTheme } from "next-themes";
import { Tooltip } from "@/components/Tooltip";
import { Icons } from "@/components/Icons";

const ThemeSwitcherButton = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes: Record<string, JSX.Element> = {
    "strawberry-matcha": <Icons.matcha />,
    "neopolitan-ice-cream": <Icons.iceCream />,
    "blueberry-lemon": <Icons.cheesecake />,
  };

  return (
    <div className="flex flex-col md:flex-row gap-1 top-0 right-0 absolute z-50">
      {Object.entries(themes).map(([key, value]) => (
        <Tooltip
          key={key}
          label={`switch the theme to ${key.replace("-", " ")}!`}
          placement="bottom"
        >
          <motion.button
            key={key}
            className="z-20 p-1.5 aspect-square self-end inline-flex justify-center items-center top-14 mt-2 mr-2 rounded-md bg-muted-100 border-2 border-muted-200 focus:border-2 focus:rounded-lg focus:border-muted-200 focus:ring-2 focus:ring-muted-200 focus:shadow-sm focus:shadow-muted-200 transition-all duration-500 ease-in-out"
            aria-label={`${key.replace("-", " ")} theme`}
            onClick={() => {
              setTheme(key);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1.2 }}
            whileFocus={{ scale: 1.1 }}
          >
            <span
            // className={`${mounted && theme == key ? "text-xl" : "text-lg"}`}
            >
              {value}
            </span>
          </motion.button>
        </Tooltip>
      ))}
    </div>
  );
};

export default ThemeSwitcherButton;
