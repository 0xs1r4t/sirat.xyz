import React from "react";
// import Tags from "@/components/Tags";

const Blog = ({ blog }: { blog: Blog }) => {
  return (
    <article className="prose prose-neutral dark:prose-invert lg:prose-xl">
      <h1>{blog.title}</h1>
      {/* <p>{blog.description}</p>
        <Tags tags={blog.tags} /> */}
      <div dangerouslySetInnerHTML={{ __html: blog.html }} />
    </article>
  );
};

export default Blog;
