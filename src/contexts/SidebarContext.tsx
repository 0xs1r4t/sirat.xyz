"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type SidebarType = "left" | "right" | null;

interface SidebarContextType {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
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
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
