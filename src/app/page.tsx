import React from "react";
import Link from "next/link";
import Heading from "@/components/Heading";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[75vh]">
      <Heading title="0XS1R4T" />
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
    </div>
  );
};

export default Home;
