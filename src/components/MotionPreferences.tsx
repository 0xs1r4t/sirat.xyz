"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/** Applies the OS reduced-motion preference to every Motion animation. */
const MotionPreferences = ({ children }: { children: ReactNode }) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
);

export default MotionPreferences;
