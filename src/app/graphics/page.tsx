"use client";

import React, { useEffect } from "react";
// import { Snake } from "@/graphics/Snake";

const SnakeCanvas = () => {
  useEffect(() => {
    //adds class when component mounts
    document.body.classList.add("overflow-hidden");

    // removes class when component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="-z-50 overflow-hidden max-h-[90svh] md:max-h-[85vh] w-full mx-2 mt-2 md:mx-4 md:mt-4 rounded-lg">
      {/* <Snake /> */}
    </div>
  );
};

export default SnakeCanvas;
