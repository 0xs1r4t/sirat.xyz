import React, { Fragment } from "react";

import Heading from "@/components/Heading";

const Post = ({ post }: { post: Post }) => {
  return (
    <Fragment>
      <article>
        <Heading
          title={post.title}
          styles="flex items-center min-h-[calc(100vh-3rem)]"
        />
        <span className="p-4">{""}</span>
        <div
          dangerouslySetInnerHTML={{ __html: post.html }}
          className="text-foreground prose-headings:text-foreground prose prose-fuchsia lg:prose-lg prose-pre:border-2 prose-pre:border-muted-200"
        />
      </article>
      <span className="p-4">{""}</span>
    </Fragment>
  );
};

export default Post;
