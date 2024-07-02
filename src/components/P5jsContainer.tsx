"use client";

import React, { useEffect, useRef } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import p5Types from "p5";

const P5jsContainer: P5jsContainer = ({ sketch }) => {
  const [isMounted, setIsMounted] = useIsMounted();
  const parentRef = useRef<P5jsContainerRef>(null);

  useEffect(() => {
    if (!isMounted) return;

    let p5instance: p5Types;
    const initP5 = async () => {
      try {
        const p5 = (await import("p5")).default;
        new p5((p) => {
          if (!parentRef.current) return;
          sketch(p, parentRef.current);
          p5instance = p;
        });
      } catch (error) {
        console.log(error);
      }
    };

    initP5();

    return () => {
      p5instance.remove();
    };
  }, [isMounted, sketch, parentRef]);

  return (
    <div className="m-2" ref={parentRef}></div>
  );
};

export default P5jsContainer;
