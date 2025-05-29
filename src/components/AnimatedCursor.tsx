"use client";

import useAnimatedCursor from "@/lib/use-animated-cursor";

const starFrames = [
  "/cursors/small-star/0001.PNG",
  "/cursors/small-star/0002.PNG",
  "/cursors/small-star/0003.PNG",
  "/cursors/small-star/0004.PNG",
];

const AnimatedCursor = () => {
  useAnimatedCursor(starFrames, 150);
  return null;
};

export default AnimatedCursor;
