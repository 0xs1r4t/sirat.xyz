import React from "react";
import Link from "next/link";

const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center p-10">
      <h1>0XS1R4T</h1>
      <p>
        <Link aria-label="garden" href="/garden" className="underline">
          digital garden
        </Link>{" "}
        <span aria-hidden="true">🌐🌼↗️</span>
      </p>
      <p>
        <Link aria-label="graphics" href="/graphics" className="underline">
          visual experiments
        </Link>{" "}
        <span aria-hidden="true">🎨🖌️🖼️</span>
      </p>
      <p>a work in progress 🪛🖥️🔖</p>
    </main>
  );
};

export default Home;
