"use client";

import hljsPlugin from "@notion-render/hljs-plugin";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

// type ScrollingAnimationProps = {
//   children: React.ReactNode;
// };

const ProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 50,
  });

  const hue = useTransform(scrollYProgress, [0, 1], [291, 293]); //[290, 306]

  const progressBarColor = (hue: number) => {
    return `hsl(${hue}, 84%, 61%)`; // hue = 292
  };

  return (
    <motion.div
      className="fixed w-full top-0 left-0 h-2 origin-left"
      animate={{
        backgroundColor: progressBarColor(hue.get()),
      }}
      style={{
        scaleX: scaleX,
      }}
    />
  );
};

export default ProgressBar;
