import React from "react";
import { Snake } from "@/graphics/Snake";
import { Fragment } from "react";

const Canvas = () => {
  return (
    <Fragment>
      <div className="overflow-hidden aspect-square max-w-[95vw] max-h-[86svh] mt-2 rounded-lg">
        <Snake />
      </div>
    </Fragment>
  );
};

export default Canvas;
