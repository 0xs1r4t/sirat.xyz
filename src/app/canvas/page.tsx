import React from "react";
import { PastelDreams } from "@/sketches/PastelDreams";

const Canvas = () => {
  if (typeof window !== "undefined") {
    return (
      <main className="flex flex-col items-center justify-between p-10">
        <div className="relative rounded-md w-full h-1/2 overflow-hidden ">
          <PastelDreams />
        </div>
      </main>
    );
  } else {
    return (
      <main className="flex flex-col items-center justify-between p-10">
        <div className="relative rounded-md w-full h-1/2 overflow-hidden ">
          <div>The sketch is not loading. Please refresh the page</div>
        </div>
      </main>
    );
  }
};

export default Canvas;
