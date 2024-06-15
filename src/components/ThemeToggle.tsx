"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <button aria-label="toggle dark/light theme">🔦</button>;

  if (resolvedTheme === "dark") {
    return <button onClick={() => setTheme("light")}>🏙️</button>;
  }
  if (resolvedTheme === "light") {
    return <button onClick={() => setTheme("dark")}>🌃</button>;
  }
};

export default ThemeToggle;
