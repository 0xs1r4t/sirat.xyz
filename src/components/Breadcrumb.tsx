"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const Breadcrumb = () => {
  const currentPath = usePathname();
  let currentLink = "";

  // {title ? title : crumb.replace("-", " ")}

  const crumbs = currentPath
    .split("/")
    .filter((crumb) => crumb !== "")
    .map((crumb) => {
      currentLink += `/${crumb}`;

      return (
        <div aria-label={`follow the crumb to "${crumb}"`} key={crumb}>
          <span>&nbsp;{"/"}&nbsp;</span>
          <Link
            href={currentLink}
            className="cursor-pointer hover:bg-muted-100 hover:rounded-md px-1 py-0.5"
          >
            {crumb == "garden"
              ? "🌼 garden"
              : crumb == "graphics"
              ? "🎨 graphics"
              : crumb == "not-found"
              ? "404 :("
              : crumb.replace("-", " ")}
          </Link>
        </div>
      );
    });

  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap p-2">
      <Link
        href="/"
        className="cursor-pointer hover:bg-muted-100 hover:rounded-md px-1"
      >
        <span>🏡&nbsp;home</span>
      </Link>
      {crumbs}
    </nav>
  );
};

export default Breadcrumb;
