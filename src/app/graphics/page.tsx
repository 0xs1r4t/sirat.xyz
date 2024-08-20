import React from "react";
import { Snake } from "@/graphics/Snake";

const Canvas = () => {
  return (
    <main className="flex flex-col items-center justify-center px-10 w-full">
      <div className="overflow-hidden max-w-screen-sm max-h-screen-lg rounded-lg">
        <Snake />
      </div>
    </main>
  );
};

export default Canvas;
