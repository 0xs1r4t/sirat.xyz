import React, { Fragment } from "react";

import Heading from "@/components/Heading";

const Post = ({ post }: { post: Post }) => {
  return (
    <Fragment>
      <article className="fixed flex flex-col items-center top-10 bottom-0 pb-4 px-4 w-full overflow-y-auto">
        <Heading
          title={post.title}
          styles="flex items-center min-h-[calc(100vh-3rem)]"
        />
        <span className="p-4">{""}</span>
        <div
          dangerouslySetInnerHTML={{ __html: post.html }}
          className="text-foreground prose dark:prose-invert prose-fuchsia lg:prose-lg prose-pre:border-2 prose-pre:border-muted-200"
        />
      </article>
      <span className="p-4">{""}</span>
    </Fragment>
  );
};

export default Post;
