import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

import Stack from "@/components/ui/Stack";
const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center p-10">
      <ThemeToggle />
      <h1>0XS1R4T</h1>
      <Link aria-label="garden" href="/garden">
        digital garden <span aria-hidden="true">🌐🌼↗️</span>
      </Link>
      <Stack />
    </main>
  );
};

export default Home;
