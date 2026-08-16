"use client";

import React, { Fragment } from "react";
import PopOutButton from "@/components/PopOutButton";
import GardenControlsSidebarContainer from "@/components/Garden/GardenControlsSidebarContainer";
import { useSidebar } from "@/contexts/SidebarContext";
import type {
  GardenControlKey,
  GardenSliderState,
} from "@graphics/Garden/useGardenControls";

interface GardenControlsSidebarProps {
  sliderValues: GardenSliderState;
  onChange: (key: GardenControlKey, value: number) => void;
}

const GardenControlsSidebar = ({
  sliderValues,
  onChange,
}: GardenControlsSidebarProps) => {
  const { rightOpen, toggleRight } = useSidebar();

  return (
    <Fragment>
      <PopOutButton
        isOpen={rightOpen}
        onToggle={toggleRight}
        placement="right"
        position="top"
      />
      <GardenControlsSidebarContainer
        isOpen={rightOpen}
        sliderValues={sliderValues}
        onChange={onChange}
      />
    </Fragment>
  );
};

export default GardenControlsSidebar;
