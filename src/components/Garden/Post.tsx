import React from "react";

import ProgressBar from "@/components/Garden/ProgressBar";
import Heading from "@/components/Heading";

const Post = ({ post }: { post: Post }) => {
  return (
    <ProgressBar>
      <article className="w-full">
        <Heading
          title={post.title}
          styles="flex items-center justify-center min-h-[calc(100vh-4rem)]"
        />
        <span className="p-4">{""}</span>
        <div
          dangerouslySetInnerHTML={{ __html: post.html }}
          className="text-foreground max-w-full min-w-fit prose prose-fuchsia lg:prose-lg prose-headings:text-foreground prose-headings:font-authentic-sans-condensed prose-pre:font-monaco prose-pre:border-2 prose-pre:border-muted-200 prose-pre:max-w-full prose-pre:min-w-0 prose-pre:w-full prose-pre:overflow-x-auto"
        />
        <span aria-hidden="true" className="p-4">
          {""}
        </span>
      </article>
    </ProgressBar>
  );
};

export default Post;
