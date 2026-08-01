import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges class names, resolving conflicting Tailwind utilities (later wins). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Sets the active theme via the `data-theme` attribute on `<html>`. */
export const switchTheme = (theme: string) => {
  document.querySelector("html")?.setAttribute("data-theme", theme);
};
