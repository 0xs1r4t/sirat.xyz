import React, { Fragment } from "react";

import Heading from "@/components/Heading";

const Post = ({ post }: { post: Post }) => {
  return (
    <Fragment>
      <article>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)]">
          <Heading title={post.title} />
        </div>
        <span className="p-4">{""}</span>
        <div
          dangerouslySetInnerHTML={{ __html: post.html }}
          className="text-foreground prose dark:prose-invert prose-fuchsia lg:prose-lg prose-pre:border-2 prose-pre:border-muted-200 prose-pre:font-code"
        />
      </article>
      <span className="p-4">{""}</span>
    </Fragment>
  );
};

export default Post;
