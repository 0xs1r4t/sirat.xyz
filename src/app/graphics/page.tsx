import React from "react";
import Link from "next/link";
import { Trail } from "@/sketches/Trail";

const Canvas = () => {
  return (
    <main className="flex flex-col items-center justify-between p-10">
      <Link aria-label="home" href="/">
        🏡
      </Link>
      <div className="relative w-full max-h-96 overflow-hidden ">
        <Trail />
      </div>
    </main>
  );
};

export default Canvas;
