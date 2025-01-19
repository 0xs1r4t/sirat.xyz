"use client";

import { Icons } from "@/components/Icons";
import { Tooltip } from "@/components/Tooltip";

interface PopOutButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  placement: "left" | "right";
  position?: "top" | "bottom";
  offset?: string;
}

const PopOutButton = ({
  isOpen,
  onToggle,
  placement,
  position = "top",
  offset = "4.5rem",
}: PopOutButtonProps) => {
  return (
    <Tooltip
      label={`click to ${isOpen ? "close" : "expand"} sidebar`}
      placement={placement}
    >
      <button
        onClick={onToggle}
        className={`fixed z-20 flex justify-center items-center p-1 aspect-square rounded-${
          placement === "right" ? "e" : "s"
        }-md bg-muted-100 border-2 border-muted-200 transition-all duration-500 ease-in-out
        ${position === "top" ? `top-[${offset}]` : `bottom-[${offset}]`}
        ${
          placement === "right"
            ? isOpen
              ? "left-[11.25rem]"
              : "left-0"
            : isOpen
            ? "right-[17.75rem]"
            : "right-0"
        }`}
      >
        <span
          aria-label="hidden"
          className={`${
            isOpen ? "rotate-0" : "rotate-180"
          } transition-transform duration-500 ease-in-out`}
        >
          <Icons.doubleChevron className="w-4 h-4 lg:w-5 lg:h-5" />
        </span>
      </button>
    </Tooltip>
  );
};

export default PopOutButton;
