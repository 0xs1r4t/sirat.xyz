"use client";

import React from "react";
import Heading from "@/components/Heading";
import { usePathname } from "next/navigation";

const NotFound = () => {
  const pathname: string = usePathname().split("/").join(" ");
  return (
    <div className="flex flex-col items-center justify-center h-[75vh]">
      <Heading title={`${pathname} not found :(`} />
    </div>
  );
};

export default NotFound;
