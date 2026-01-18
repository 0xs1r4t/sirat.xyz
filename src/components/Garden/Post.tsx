import React from "react";

import ProgressBar from "@/components/Garden/ProgressBar";
import Heading from "@/components/Heading";
import LinkPreview from "@/components/Garden/LinkPreview";
import PostSidebar from "@/components/Garden/PostSidebar";

const Post = ({ post }: { post: Post }) => {
  return (
    <ProgressBar>
      <PostSidebar description={post.description} tocHtml={post.toc} />
      <article className="w-full">
        <Heading
          title={post.title}
          styles="flex items-center justify-center min-h-[calc(100vh-4rem)]"
        />
        <span className="p-4">{""}</span>
        <div
          dangerouslySetInnerHTML={{ __html: post.html }}
          className="text-foreground w-full max-w-full prose prose-fuchsia 
             lg:prose-lg lg:max-w-2xl xl:max-w-3xl mx-auto
             prose-headings:text-foreground 
             prose-headings:font-authentic-sans-condensed 
             prose-pre:font-monaco 
             prose-pre:border-2 
             prose-pre:border-muted-200 
             prose-a:transition-colors
             prose-a:duration-200"
        />
        <LinkPreview />
        <span aria-hidden="true" className="p-4">
          {""}
        </span>
      </article>
    </ProgressBar>
  );
};

export default Post;
