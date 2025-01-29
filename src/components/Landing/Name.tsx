import React from "react";
import * as motion from "motion/react-client";

const Name = () => {
  return (
    <motion.div
      aria-label="page title"
      className="relative font-name pl-1.5 pt-0.5 italic text-center text-7xl text-foreground text-stroke-3 text-stroke-foreground not-prose sm:text-9xl sm:pl-2.5 sm:pt-1"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
      }}
    >
      0xS1R4T
      <span className="absolute top-0 left-0 w-full text-muted-200 text-stroke-foreground text-stroke-1 sm:text-stroke-1 sm:text-stroke-foreground">
        0xS1R4T
      </span>
    </motion.div>
  );
};

export default Name;
