import React from "react";

const Heading = ({ title }: { title: string }) => {
  return (
    <div
      role="title"
      className="text-5xl font-bold text-center uppercase font-heading p-4 pb-4 not-prose"
    >
      {title}
    </div>
  );
};

export default Heading;
