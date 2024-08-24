"use client";

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

  const hue = useTransform(scrollYProgress, [0, 1], [0.95, 1]); //[290, 306]

  const progressBarColor = (alpha: number) => {
    // return `hsl(${hue}, 84%, 61%)`; // hue = 292
    return `rgba(31, 41, 55, ${alpha})`;
  };

  return (
    <motion.div
      className="fixed w-full top-0 right-0 h-1 origin-top-right bg-muted-100"
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
