import React from "react";

import ProgressBar from "@/components/Garden/ProgressBar";
import Heading from "@/components/Heading";

const Post = ({ post }: { post: Post }) => {
  return (
    <ProgressBar>
      <article className="w-full">
        <Heading
          title={post.title}
          styles="flex items-center min-h-[calc(100vh-4.5rem)]"
        />
        <span className="p-4">{""}</span>
        <div
          dangerouslySetInnerHTML={{ __html: post.html }}
          className="text-foreground max-w-full min-w-fit prose prose-fuchsia lg:prose-lg prose-headings:text-foreground prose-pre:border-2 prose-pre:border-muted-200"
        />
        <span aria-hidden="true" className="p-4">
          {""}
        </span>
      </article>
    </ProgressBar>
  );
};

export default Post;
