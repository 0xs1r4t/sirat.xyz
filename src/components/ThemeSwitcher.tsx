"use client";

import { switchTheme } from "@/lib/utils";
import { Tooltip } from "@/components/Tooltip";

const ThemeSwitcher = () => {
  return (
    <Tooltip label="try out a different theme!" placement="left">
      <div className="flex gap-1">
        <button
          aria-label="neopolitan ice cream theme"
          className="z-20 p-1.5 aspect-square self-end inline-flex justify-center items-center top-14 mt-2 mr-2 rounded-md bg-muted-100 border-2 border-muted-200 focus:border-2 focus:rounded-lg focus:border-muted-200 focus:ring-2 focus:ring-muted-200 focus:shadow-sm focus:shadow-muted-200 transition-all duration-500 ease-in-out"
          onClick={() => switchTheme("neopolitan-ice-cream")}
        >
          <span aria-label="hidden">🍥</span>
        </button>
        <button
          aria-label="strawberry matcha theme"
          className="z-20 p-1.5 aspect-square self-end inline-flex justify-center items-center top-14 mt-2 mr-2 rounded-md bg-muted-100 border-2 border-muted-200 focus:border-2 focus:rounded-lg focus:border-muted-200 focus:ring-2 focus:ring-muted-200 focus:shadow-sm focus:shadow-muted-200 transition-all duration-500 ease-in-out"
          onClick={() => switchTheme("strawberry-matcha")}
        >
          <span aria-label="hidden">🧋</span>
        </button>
        <button
          aria-label="blueberry lemon theme"
          className="z-20 p-1.5 aspect-square self-end inline-flex justify-center items-center top-14 mt-2 mr-2 rounded-md bg-muted-100 border-2 border-muted-200 focus:border-2 focus:rounded-lg focus:border-muted-200 focus:ring-2 focus:ring-muted-200 focus:shadow-sm focus:shadow-muted-200 transition-all duration-500 ease-in-out"
          onClick={() => switchTheme("blueberry-lemon")}
        >
          <span aria-label="hidden">🫐</span>
        </button>
      </div>
    </Tooltip>
  );
};

export default ThemeSwitcher;
