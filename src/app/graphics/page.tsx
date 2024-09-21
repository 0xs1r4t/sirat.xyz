import React from "react";
import { Snake } from "@/graphics/Snake";
import { Fragment } from "react";

const Canvas = () => {
  return (
    <Fragment>
      <div className="overflow-hidden max-h-[85svh] w-full mx-2 mt-2 rounded-lg">
        <Snake />
      </div>
    </Fragment>
  );
};

export default Canvas;
