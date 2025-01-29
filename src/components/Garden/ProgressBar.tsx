"use client";

import { Fragment, ReactNode } from "react";
import { motion, useSpring, useScroll } from "motion/react";

const ProgressBar = (props: { children: ReactNode }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
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
          height: 10,
          originX: 0,
        }}
        className="bg-muted-100 border-t-2 border-t-muted-200"
      />
      {props.children}
    </Fragment>
  );
};

export default ProgressBar;
