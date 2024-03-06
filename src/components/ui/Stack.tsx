import React from "react";

const Box = ({
  row,
  col,
  children,
}: {
  row?: number;
  col?: number;
  children?: React.ReactNode;
}) => {
  row ||= 1;
  col ||= 1;
  return (
    <div
      className={`row-span-${row} col-span-${col} rounded-xl border-2 border-neutral-400/10 bg-neutral-100 p-4 dark:bg-neutral-900`}
    >
      {children || "🌐"}
    </div>
  );
};

const Stack = () => {
  return (
    <div className="w-full mt-10 grid auto-rows-[192px] grid-cols-3 gap-4">
      <Box row={2}>hello world.</Box>
      <Box />
      <Box />
      <Box col={2} />
      <Box col={2} />
      <Box />
    </div>
  );
};

export default Stack;
