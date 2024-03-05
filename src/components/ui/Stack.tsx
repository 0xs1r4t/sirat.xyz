import React from "react";

const Box = ({
  height,
  children,
}: {
  height: number;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={`mb-4 h-${height} self-stretch rounded-xl border-2 border-neutral-400/10 bg-neutral-100 p-4 dark:bg-neutral-900`}
    >
      {children || "🌐"}
    </div>
  );
};

const Stack = () => {
  return (
    <div className="m-10 w-full flex gap-4">
      <div className="flex-1">
        <Box height={24}>hello world.</Box>
        <Box height={32} />
        <Box height={32} />
        <Box height={16} />
        <Box height={16} />
      </div>
      <div className="flex-1">
        <Box height={32} />
        <Box height={40} />
        <Box height={56} />
      </div>
      <div className="flex-1">
        <Box height={64} />
        <Box height={32} />
        <Box height={32} />
      </div>
    </div>
  );
};

export default Stack;
