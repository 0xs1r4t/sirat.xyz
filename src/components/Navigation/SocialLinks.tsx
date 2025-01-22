import Link from "next/link";
import { Fragment } from "react";

import { Icons } from "@/components/Icons";

type NavNames = "home" | "garden" | "graphics" | "linkedin" | "github";

interface NavInfo {
  name: NavNames;
  link: string;
  type: "internal" | "external";
  icon: JSX.Element | string;
}

const navLinks: Record<NavNames, NavInfo> = {
  home: {
    name: "home",
    link: "/",
    type: "internal",
    icon: <Icons.home size={20} />,
  },
  garden: {
    name: "garden",
    link: "/garden",
    type: "internal",
    icon: <Icons.digiGarden size={20} />,
  },
  graphics: {
    name: "graphics",
    link: "/graphics",
    type: "internal",
    icon: <Icons.palette size={20} />,
  },
  github: {
    name: "github",
    link: "https://github.com/0xs1r4t/",
    type: "external",
    icon: <Icons.link size={20} />,
  },
  linkedin: {
    name: "linkedin",
    link: "https://www.linkedin.com/in/siratbaweja/",
    type: "external",
    icon: <Icons.link size={20} />,
  },
};

const SocialLinks = () => {
  return (
    <Fragment>
      {Object.entries(navLinks).map(([key, value]) => (
        <span
          key={key}
          className="text-lg rounded-md hover:bg-muted-200 transition-colors duration-300"
        >
          <Link
            aria-label={key}
            href={value.link}
            className="inline-flex items-center mx-1 cursor-pointer"
            target={value.type === "external" ? "_blank" : "_self"}
            rel={value.type === "external" ? "noopener noreferrer" : ""}
          >
            {value.icon}&nbsp;{value.name}
          </Link>
        </span>
      ))}
    </Fragment>
  );
};

export default SocialLinks;
