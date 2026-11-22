import React from "react";

const NoPostSummary = () => (
  <div className="text-center py-10">
    <h2 className="text-xl font-medium">
      No posts found! <span aria-hidden="true">🌱</span>
    </h2>
    <p className="text-foreground mt-2">Check back later for new content.</p>
  </div>
);

export default NoPostSummary;
