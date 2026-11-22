"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Icons } from "@/components/Icons";

const Breadcrumb = () => {
  const currentPath = usePathname();
  const [isMobile, setIsMobile] = useState(false);

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

  const segments = currentPath.split("/").filter(Boolean);

  const homeCrumb = isMobile ? (
    <Icons.home size={22} />
  ) : (
    <span className="flex flex-nowrap items-center">
      <Icons.home size={22} />
      &nbsp;home
    </span>
  );

  const crumbContent = (crumb: string, isLast: boolean) => {
    if (crumb === "garden") {
      return isMobile ? (
        <Icons.digiGarden size={22} />
      ) : (
        <span className="flex flex-nowrap items-center">
          <Icons.digiGarden size={22} />
          &nbsp;garden
        </span>
      );
    }

    if (crumb === "graphics") {
      return isMobile ? (
        <Icons.palette size={22} />
      ) : (
        <span className="flex flex-nowrap items-center">
          <Icons.palette size={22} />
          &nbsp;graphics
        </span>
      );
    }

    // Keep intermediate crumbs compact on mobile; show the current one.
    if (isMobile && !isLast) return "...";
    return crumb.replaceAll("-", " ");
  };

  let currentLink = "";

  return (
    <ol className="list-none inline-flex items-center gap-1 h-9 self-center mt-2 ml-2 p-1 rounded-md bg-muted-100 border-2 border-muted-200">
      <li>
        <Link
          href="/"
          aria-label="home"
          aria-current={currentPath === "/" ? "page" : undefined}
          className="cursor-pointer self-center inline-flex items-center hover:bg-highlight hover:rounded-md px-1 lg:text-lg"
        >
          {homeCrumb}
        </Link>
      </li>
      {segments.map((crumb, index) => {
        currentLink += `/${crumb}`;
        const isLast = index === segments.length - 1;
        const label = crumb.replaceAll("-", " ");

        return (
          <li key={currentLink} className="flex flex-row items-center">
            <Icons.singleChevron aria-hidden="true" />
            <Link
              href={currentLink}
              aria-label={label}
              aria-current={isLast ? "page" : undefined}
              className="cursor-pointer inline-block max-w-48 truncate align-middle hover:bg-highlight hover:rounded-md px-1 lg:text-lg"
            >
              {crumbContent(crumb, isLast)}
            </Link>
          </li>
        );
      })}
    </ol>
  );
};

export default Breadcrumb;
