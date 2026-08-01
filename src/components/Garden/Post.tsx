import React from "react";

import ProgressBar from "@/components/Garden/ProgressBar";
import Heading from "@/components/Heading";
import LinkPreview from "@/components/Garden/LinkPreview";
import PostSidebar from "@/components/Garden/PostSidebar";

import ExcalidrawTheme from "@/components/Garden/plugins/ExcalidrawTheme";

const Post = ({ post }: { post: Post }) => (
    <ProgressBar>
      <PostSidebar description={post.description} tocHtml={post.toc} />
      <article className="w-full min-w-0 xl:mx-48">
        <Heading
          title={post.title}
          background={post.background}
          styles="flex items-center justify-center min-h-[calc(100vh-4rem)]
        w-screen relative left-1/2 -translate-x-1/2"
          post
        />

        <div className="px-4 py-6 mx-auto max-w-2xl xl:max-w-3xl">
          <div
            dangerouslySetInnerHTML={{ __html: post.html }}
            suppressHydrationWarning
            className="text-foreground w-full prose lg:prose-lg
                       prose-headings:text-foreground
                       prose-headings:font-authentic-sans-condensed
                       prose-h2:text-6xl
                       prose-h3:text-5xl
                       prose-h4:text-4xl
                       prose-h5:text-3xl
                       prose-h6:text-2xl
                       prose-pre:font-monaco
                       prose-pre:border-2
                       prose-pre:border-muted-200
                       prose-a:transition-colors
                       prose-a:duration-200"
          />
          <ExcalidrawTheme />
          <LinkPreview />
        </div>
      </article>
    </ProgressBar>
  );

export default Post;
