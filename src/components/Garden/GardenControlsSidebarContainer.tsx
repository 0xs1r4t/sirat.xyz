"use client";

import React from "react";
import { AnimatePresence, LazyMotion } from "motion/react";
import * as m from "motion/react-m";

import GardenSliderRow from "@/components/Garden/GardenSliderRow";
import {
  GARDEN_CONTROL_SECTIONS,
  type GardenControlKey,
  type GardenSliderState,
} from "@graphics/Garden/useGardenControls";

const loadFeatures = () =>
  import("@/lib/features/min").then((res) => res.default);

interface GardenControlsSidebarContainerProps {
  isOpen: boolean;
  sliderValues: GardenSliderState;
  onChange: (key: GardenControlKey, value: number) => void;
}

const GardenControlsSidebarContainer = ({
  isOpen,
  sliderValues,
  onChange,
}: GardenControlsSidebarContainerProps) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <LazyMotion features={loadFeatures}>
        <m.div
          aria-label="garden controls sidebar"
          initial={{ x: 192, scaleX: 0.5 }}
          animate={{
            x: 0,
            scaleX: 1,
            y: [0, -1, 0],
            transition: {
              y: { repeat: Infinity, duration: 1, ease: "easeInOut" },
            },
          }}
          exit={{ x: 192, scaleX: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 50,
            x: { type: "spring", duration: 0.5 },
            scaleX: { type: "spring", duration: 0.5 },
          }}
          className="flex flex-col fixed z-30 top-16 right-2 py-1.5 lg:py-2 w-44 max-h-[calc(100vh-5rem)] bg-muted-100 border-2 border-muted-200 rounded-lg overflow-hidden"
          aria-hidden={!isOpen}
        >
          {/* Single scroll region for the whole panel — sections are short
              (2-5 sliders each), unlike PostSidebar's arbitrary-length TOC,
              so one scrollbar with sticky headers stacking as you pass them
              reads better than six near-empty independent scroll boxes. */}
          <div className="flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
            {GARDEN_CONTROL_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="flex flex-col border-b-2 border-muted-200 shrink-0 last:border-b-0"
              >
                <h3 className="sticky top-0 text-2xl italic font-bold font-that-that-new-pixel px-3 pt-2 pb-1 bg-muted-100 z-10 shrink-0">
                  {section.title}
                </h3>
                <div className="px-3 pb-2 flex flex-col gap-1">
                  {section.fields.map((field) => (
                    <GardenSliderRow
                      key={field.key}
                      fieldKey={field.key}
                      label={field.label}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={sliderValues[field.key]}
                      onChange={onChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </LazyMotion>
    )}
  </AnimatePresence>
);

export default GardenControlsSidebarContainer;
