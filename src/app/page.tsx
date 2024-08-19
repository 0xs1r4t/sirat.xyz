import React from "react";
import Link from "next/link";

const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center px-10">
      <h1>0XS1R4T</h1>
      <p>
        <Link
          aria-label="garden"
          href="/garden"
          className="cursor-pointer text-lg hover:bg-muted-100 hover:rounded-md px-1 py-0.5"
        >
          <span aria-hidden="true">{"🌼 "}</span>
          digital garden
        </Link>{" "}
      </p>
      <p>
        <Link
          aria-label="graphics"
          href="/graphics"
          className="cursor-pointer text-lg hover:bg-muted-100 hover:rounded-md px-1 py-0.5"
        >
          <span aria-hidden="true">{"🎨 "}</span>visual experiments
        </Link>{" "}
      </p>
    </main>
  );
};

export default Home;
