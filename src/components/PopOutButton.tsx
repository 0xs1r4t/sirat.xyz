"use client";

import { motion } from "framer-motion";

import { Icons } from "@/components/Icons";
import { Tooltip } from "@/components/Tooltip";

interface PopOutButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  placement: "left" | "right";
  position: "top" | "bottom";
  offsetTop?: string;
  offsetBottom?: string;
  offsetRight?: string;
  offsetLeft?: string;
}

const PopOutButton = ({
  isOpen,
  onToggle,
  placement,
  position = "top",
  offsetTop = "4.5rem",
  offsetBottom = "4.5rem",
  offsetRight = "0rem", // Start close to right edge
  offsetLeft = "0rem", // Start close to left edge
}: PopOutButtonProps) => {
  // Calculate the open position based on sidebar width
  const leftSidebarWidth = "11.25rem"; // 180px
  const rightSidebarWidth = "11.5rem"; // 184px (44 * 4 + margin)

  return (
    <Tooltip
      label={`click to ${isOpen ? "close" : "expand"} sidebar`}
      placement={placement}
    >
      <motion.button
        onClick={onToggle}
        aria-label={`Click to ${isOpen ? "close" : "expand"} sidebar`}
        style={{
          top: position === "top" ? offsetTop : "auto",
          bottom: position === "bottom" ? offsetBottom : "auto",
          // Position from the correct side
          ...(placement === "left"
            ? { left: offsetLeft }
            : { right: offsetRight }),
        }}
        animate={
          isOpen
            ? {
                x:
                  placement === "left"
                    ? leftSidebarWidth
                    : `-${rightSidebarWidth}`,
                scale: 1.05,
                y: [0, -1, 0],
                transition: {
                  y: {
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                  },
                },
              }
            : { x: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 50,
          x: { type: "spring", duration: 0.5 },
        }}
        className={`fixed z-20 flex justify-center items-center p-1 aspect-square ${
          placement === "left" ? "rounded-e-md" : "rounded-s-md"
        } bg-muted-100 border-2 border-muted-200 transition-colors duration-200`}
      >
        <span
          aria-hidden="true"
          className={`${
            isOpen
              ? placement === "left"
                ? "rotate-0"
                : "rotate-180"
              : placement === "left"
                ? "rotate-180"
                : "rotate-0"
          } transition-transform duration-500 ease-in-out`}
        >
          <Icons.doubleChevron className="w-4 h-4 lg:w-5 lg:h-5" />
        </span>
      </motion.button>
    </Tooltip>
  );
};

export default PopOutButton;
