"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { Icons } from "@/components/Icons";
import { Tooltip } from "@/components/Tooltip";

interface PopOutButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  placement: "left" | "right";
  /** Stable accessible name, e.g. "Site sidebar". */
  label: string;
  /** id of the panel this button controls, when mounted. */
  controlsId?: string;
}

const PopOutButton = ({
  isOpen,
  onToggle,
  placement,
  label,
  controlsId,
}: PopOutButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hadFocusInside = useRef(false);

  // Track whether focus entered the panel, and return it to the toggle if
  // the panel closes while it (or the document body) still has focus.
  useEffect(() => {
    if (!isOpen || !controlsId) return;

    const panel = document.getElementById(controlsId);
    if (!panel) return;

    const onFocusIn = () => {
      hadFocusInside.current = true;
    };
    panel.addEventListener("focusin", onFocusIn);
    return () => panel.removeEventListener("focusin", onFocusIn);
  }, [isOpen, controlsId]);

  useEffect(() => {
    if (isOpen) {
      hadFocusInside.current = false;
      return;
    }
    if (!hadFocusInside.current) return;

    const active = document.activeElement;
    const panel = controlsId ? document.getElementById(controlsId) : null;
    const focusWasLost = active === document.body || panel?.contains(active);

    hadFocusInside.current = false;
    if (focusWasLost) buttonRef.current?.focus();
  }, [isOpen, controlsId]);

  // Slide distance when open: panel width (w-44 = 11rem) + a 0.25rem tuck,
  // so the button ends up hidden 4px behind the panel's edge instead of
  // sitting flush against it — two independent borders meeting exactly
  // edge-to-edge (0 overlap) render as a doubled line at high DPR; tucked
  // under, only the panel's border is visible. Left and right used to
  // differ (11.25rem vs 11.5rem) for no real reason — that's exactly why
  // only one side looked right.
  const sidebarWidth = "11.25rem"; // 180px

  return (
    <Tooltip
      label={`click to ${isOpen ? "close" : "open"} ${label.toLowerCase()}`}
      placement={placement}
    >
      <motion.button
        ref={buttonRef}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={isOpen ? controlsId : undefined}
        aria-label={label}
        animate={
          isOpen
            ? {
                x:
                  placement === "left"
                    ? sidebarWidth
                    : `-${sidebarWidth}`,
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
        className={`fixed z-20 flex justify-center items-center w-9 h-9 ${
          placement === "left" ? "rounded-e-md" : "rounded-s-md"
        } bg-muted-100 border-2 border-muted-200 transition-colors duration-200
        bottom-4 sm:bottom-auto sm:top-18
        ${placement === "left" ? "left-0" : "right-0"}`}
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
          <Icons.doubleChevron className="w-5 h-5" />
        </span>
      </motion.button>
    </Tooltip>
  );
};

export default PopOutButton;
