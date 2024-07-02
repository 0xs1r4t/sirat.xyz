import React from "react";
import P5jsContainer from "@/components/P5jsContainer";
import { pastelDreams } from "@/sketches/pastel-dreams";

const Canvas = () => {
  return (
    <div>
      <P5jsContainer sketch={pastelDreams} />
    </div>
  );
};

export default Canvas;
