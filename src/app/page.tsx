import React, { Fragment } from "react";
import Link from "next/link";

import Heading from "@/components/Heading";

const Home = () => {
  return (
    <Fragment>
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
    </Fragment>
  );
};

export default Home;
