import React from "react";
import Link from "next/link";

import { AuthenticSansCondensed } from "@/fonts/font-config";
import { cn } from "@/lib/utils";

const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center p-10">
      <h1>0XS1R4T</h1>
      {/* {className={cn(
          "text-5xl text-center font-bold",
          AuthenticSansCondensed.className
        )}} */}
      <Link aria-label="garden" href="/garden">
        digital garden <span aria-hidden="true">🌐🌼↗️</span>
      </Link>
    </main>
  );
};

export default Home;
