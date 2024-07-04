import React from "react";
import { PastelDreams } from "@/sketches/PastelDreams";

const Canvas = () => {
  return (
    <div className="relative w-3/5 h-full overflow-hidden rounded-md">
      <PastelDreams></PastelDreams>
    </div>
  );
};

export default Canvas;
