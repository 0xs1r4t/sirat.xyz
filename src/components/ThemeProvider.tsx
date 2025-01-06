"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

export default ThemeProvider;
