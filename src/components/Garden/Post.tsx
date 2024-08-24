import React from "react";

import Heading from "@/components/Heading";
// import Tags from "@/components/Garden/Tags";

// import "./Post.styles.css";

const Post = ({ post }: { post: Post }) => {
  return (
    <article className="max-w-[65ch] text-foreground prose dark:prose-invert prose-fuchsia lg:prose-lg prose-pre:border-2 prose-pre:border-muted-200">
      <Heading title={post.title} />
      {/* <p>{post.description}</p>
          <Tags tags={post.tags} /> */}
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
};

export default Post;
