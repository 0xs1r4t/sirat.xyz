"use client";

import React, { useRef } from "react";
import * as motion from "motion/react-client";

const Name = () => {
  const constraintsRef = useRef(null);

  return (
    <motion.span ref={constraintsRef}>
      <motion.div
        aria-label="page title"
        className="font-that-that-new-pixel italic text-center text-7xl text-muted-200 text-stroke-muted-thick glow-text not-prose sm:text-9xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
        style={{ touchAction: "none" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        whileDrag={{ scale: 0.9 }}
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
      >
        0xS1R4T
      </motion.div>
    </motion.span>
  );
};

export default Name;
