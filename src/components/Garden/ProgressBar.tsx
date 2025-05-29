"use client";

import { Fragment, ReactNode } from "react";
import { motion, useSpring, useScroll } from "motion/react";

const ProgressBar = (props: { children: ReactNode }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 50,
    restDelta: 0.001,
  });

  return (
    <Fragment>
      <motion.div
        id="scroll-indicator"
        style={{
          scaleX,
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
          zIndex: 50,
        }}
        className="bg-linear-to-r/increasing from-violet-300 via-lime-200 to-violet-300"
      />
      {props.children}
    </Fragment>
  );
};

export default ProgressBar;
