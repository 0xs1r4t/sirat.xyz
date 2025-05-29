import React from "react";
import { cn } from "@/lib/utils";

const Heading = ({
  title,
  children,
  styles,
}: {
  title: string;
  children?: React.ReactNode;
  styles?: string;
}) => {
  return (
    <div
      aria-label="page title"
      className={cn(
        `text-6xl font-authentic-sans-condensed font-bold text-center p-4 pb-4 not-prose lg:text-7xl ${
          styles ? styles : ""
        }`
      )}
    >
      {title}
      {children ? children : <span aria-hidden="true">{""}</span>}
    </div>
  );
};

export default Heading;
