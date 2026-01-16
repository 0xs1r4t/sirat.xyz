"use client";

import React, { useEffect, useRef, useState } from "react";
import { LazyMotion } from "motion/react";
import * as m from "motion/react-m";

const loadFeatures = () =>
  import("@/lib/features/max").then((res) => res.default);

const Name = () => {
  const constraintsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <LazyMotion features={loadFeatures}>
      <m.span ref={constraintsRef}>
        <m.div
          aria-label="page title"
          className="font-that-that-new-pixel italic text-center text-7xl text-muted-200 text-stroke-muted-thick glow-text not-prose sm:text-9xl"
          initial={isMobile ? false : { opacity: 0, scale: 0 }}
          animate={isMobile ? false : { opacity: 1, scale: 1 }}
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
        </m.div>
      </m.span>
    </LazyMotion>
  );
};

export default Name;
