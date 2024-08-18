import React from "react";
import Dates from "@/components/Garden/Dates";
// import Tags from "@/components/Garden/Tags";

const Post = ({ post }: { post: Post }) => {
  return (
    <article className="prose prose-fuchsia dark:prose-invert lg:prose-lg">
      <h1>{post.title}</h1>
      {/* <p>{post.description}</p>
        <Tags tags={post.tags} /> */}
      <Dates created_at={post.created_at} updated_at={post.updated_at} />
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
};

export default Post;
