"use client";

import React, { memo } from "react";

import type { GardenControlKey } from "@graphics/Garden/useGardenControls";

interface GardenSliderRowProps {
  fieldKey: GardenControlKey;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (key: GardenControlKey, value: number) => void;
}

const decimalsForStep = (step: number) => {
  const s = step.toString();
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
};

/**
 * One control row. Memoized + takes `fieldKey` (rather than a pre-bound
 * per-row callback) so the sidebar's `onChange` prop can stay referentially
 * stable — otherwise every slider drag would re-render all 19 rows instead
 * of just the one that changed.
 */
const GardenSliderRow = memo(function GardenSliderRow({
  fieldKey,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: GardenSliderRowProps) {
  return (
    <div className="flex flex-col gap-0.5 py-1">
      <div className="flex items-center justify-between text-sm leading-snug">
        <span>{label}</span>
        <span className="tabular-nums text-muted-200">
          {value.toFixed(decimalsForStep(step))}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(fieldKey, Number(e.target.value))}
        className="w-full accent-muted-200"
      />
    </div>
  );
});

export default GardenSliderRow;
