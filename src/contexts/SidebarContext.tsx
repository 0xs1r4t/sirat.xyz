"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/** Tracks left/right sidebar open state; closes the other on small screens. */
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const toggleLeft = () => {
    const width = window.innerWidth;
    const isLargeScreen = width >= 1280;

    if (!isLargeScreen && !leftOpen) {
      setRightOpen(false);
    }
    setLeftOpen(!leftOpen);
  };

  const toggleRight = () => {
    const width = window.innerWidth;
    const isLargeScreen = width >= 1280;

    if (!isLargeScreen && !rightOpen) {
      setLeftOpen(false);
    }
    setRightOpen(!rightOpen);
  };

  return (
    <SidebarContext.Provider
      value={{ leftOpen, rightOpen, toggleLeft, toggleRight }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

/** Reads the shared sidebar state; must be called under `SidebarProvider`. */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
