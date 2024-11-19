"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const Breadcrumb = () => {
  const currentPath = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  let currentLink = "";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const homeCrumb = isMobile ? "🏡" : "🏡 home";
  const crumbs = currentPath
    .split("/")
    .filter((crumb) => crumb !== "")
    .map((crumb, index, array) => {
      currentLink += `/${crumb}`;

      const pathCrumb =
        crumb == "garden"
          ? isMobile
            ? "🌼"
            : "🌼 garden"
          : crumb == "graphics"
          ? isMobile
            ? "🎨"
            : "🎨 graphics"
          : isMobile && index < array.length - 1
          ? ".."
          : crumb.replace(/-/g, " ");
      console.log(pathCrumb);

      return (
        <div aria-label={`follow the crumb to "${crumb}"`} key={crumb}>
          <button className="flex flex-row gap-1" role="button">
            <span aria-label="hidden" className="self-center">
              &nbsp;{`/`}
            </span>
            <Link
              href={currentLink}
              className="cursor-pointer hover:bg-muted-200 hover:rounded-md px-1 lg:text-lg"
            >
              {pathCrumb}
            </Link>
          </button>
        </div>
      );
    });

  return (
    <div
      aria-label="breadcrumb"
      className="inline-flex self-center mt-2 ml-2 p-1 rounded-md bg-muted-100 border-2 border-muted-200"
      role="group"
    >
      <Link
        href="/"
        className="cursor-pointer self-center hover:bg-muted-200 hover:rounded-md px-1 lg:text-lg"
      >
        <span>{homeCrumb}</span>
      </Link>
      {crumbs}
    </div>
  );
};

export default Breadcrumb;
