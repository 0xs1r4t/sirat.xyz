import React from "react";
import { Trail } from "@/sketches/Trail";

const Canvas = () => {
  return (
    <main className="flex flex-col items-center justify-between px-10">
      <div className="m-10 aspect-square overflow-hidden max-h-[75vh] max-w-[75vw] rounded-lg">
        <Trail />
      </div>
    </main>
  );
};

export default Canvas;
