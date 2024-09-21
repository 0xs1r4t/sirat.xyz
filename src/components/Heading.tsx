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
      role="title"
      className={cn(
        `text-6xl font-bold text-center font-heading p-4 pb-4 not-prose lg:text-7xl ${
          styles ? styles : ""
        }`
      )}
    >
      {title}
      {children ? children : <span aria-label="hidden">{""}</span>}
    </div>
  );
};

export default Heading;
