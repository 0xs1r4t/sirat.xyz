import React from "react";
import Link from "next/link";
import Heading from "@/components/Heading";
import { Icons } from "@/components/Icons";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[75vh]">
      <Heading title="0XS1R4T" />
      <p>
        <Link
          aria-label="garden"
          href="/garden"
          className="cursor-pointer flex flex-nowrap items-center text-lg lg:text-xl hover:bg-muted-100 hover:rounded-md px-1 py-0.5"
        >
          <span aria-hidden="true">
            <Icons.digiGarden size={22} />
          </span>
          &nbsp;digital garden
        </Link>{" "}
      </p>
      <p>
        <Link
          aria-label="graphics"
          href="/graphics"
          className="cursor-pointer flex flex-nowrap items-center text-lg lg:text-xl hover:bg-muted-100 hover:rounded-md px-1 py-0.5"
        >
          <span aria-hidden="true">
            <Icons.palette size={22} />
          </span>
          &nbsp;visual experiments
        </Link>{" "}
      </p>
    </div>
  );
};

export default Home;
