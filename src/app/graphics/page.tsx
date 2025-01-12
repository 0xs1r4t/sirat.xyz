import React from "react";
import { Snake } from "@/graphics/Snake";

const SnakeCanvas = () => {
  return (
    <div className="overflow-hidden max-h-[90svh] md:max-h-[85vh] w-full mx-2 mt-2 md:mx-4 md:mt-4 rounded-lg">
      <Snake />
    </div>
  );
};

export default SnakeCanvas;
