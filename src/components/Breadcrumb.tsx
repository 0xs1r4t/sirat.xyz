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
        isMobile && index < array.length - 1
          ? ".."
          : crumb == "garden"
          ? "🌼 garden"
          : crumb == "graphics"
          ? "🎨 graphics"
          : crumb == "not-found"
          ? "404 :("
          : crumb.replace(/-/g, " ");
      console.log(pathCrumb);

      return (
        <div aria-label={`follow the crumb to "${crumb}"`} key={crumb}>
          <span>&nbsp;{"/"}&nbsp;</span>
          <Link
            href={currentLink}
            className="cursor-pointer hover:bg-muted-100 hover:rounded-md px-1 py-0.5 lg:text-lg"
          >
            {pathCrumb}
          </Link>
        </div>
      );
    });

  return (
    <div aria-label="breadcrumb" className="flex flex-wrap p-2">
      <Link
        href="/"
        className="cursor-pointer hover:bg-muted-100 hover:rounded-md px-1 lg:text-lg"
      >
        <span>{homeCrumb}</span>
      </Link>
      {crumbs}
    </div>
  );
};

export default Breadcrumb;
