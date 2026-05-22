"use client";

import { useEffect } from "react";

const DARK_THEMES = ["blueberry-lemon"];

export default function ExcalidrawTheme() {
  useEffect(() => {
    function syncTheme() {
      const isDark = DARK_THEMES.some((t) =>
        document.documentElement.classList.contains(t),
      );
      document.querySelectorAll(".excalidraw-light").forEach((el) => {
        (el as HTMLElement).style.display = isDark ? "none" : "";
      });
      document.querySelectorAll(".excalidraw-dark").forEach((el) => {
        (el as HTMLElement).style.display = isDark ? "" : "none";
      });
    }

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
