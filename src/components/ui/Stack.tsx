import React from "react";

const Box = ({
  css,
  children,
}: {
  css?: string;
  children?: React.ReactNode;
}) => {
  css = css || "";
  return (
    <div
      className={`p-4 rounded-xl place-content-center border-2 dark:bg-neutral-900 bg-neutral-200 border-neutral-300 dark:border-neutral-800 ${css}`}
    >
      {children || "🌐"}
    </div>
  );
};

const Stack = () => {
  return (
    <div className="mt-10 w-full grid grid-rows-3 grid-cols-4 grid-flow-col gap-4">
      <Box css="row-span-3">01</Box>
      <Box css="col-span-2">02</Box>
      <Box css="row-span-2 col-span-2">03</Box>
      <Box css="row-span-2">04</Box>
      <Box>05</Box>
    </div>
  );
};

export default Stack;
