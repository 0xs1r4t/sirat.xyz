import React from "react";

import ProgressBar from "@/components/Garden/ProgressBar";
import Heading from "@/components/Heading";
import LinkPreview from "@/components/Garden/LinkPreview";
import PostSidebar from "@/components/Garden/PostSidebar";

import ExcalidrawTheme from "@/components/Garden/plugins/ExcalidrawTheme";

// const Post = ({ post }: { post: Post }) => {
//   return (
//     <ProgressBar>
//       <PostSidebar description={post.description} tocHtml={post.toc} />
//       <article className="w-[100vw] xl:mr-48 xl:ml-48">
//         <Heading
//           title={post.title}
//           background={post.background}
//           styles="flex items-center justify-center min-h-[calc(100vh-4rem)]"
//           post
//         />
//         <span className="p-4">{""}</span>
//         <div
//           dangerouslySetInnerHTML={{ __html: post.html }}
//           suppressHydrationWarning
//           className="text-foreground w-full max-w-full prose
//              lg:prose-lg lg:max-w-2xl xl:max-w-3xl mx-auto
//              prose-headings:text-foreground
//              prose-headings:font-authentic-sans-condensed
//              prose-pre:font-monaco
//              prose-pre:border-2
//              prose-pre:border-muted-200
//              prose-a:transition-colors
//              prose-a:duration-200
//              "
//         />
//         <ExcalidrawTheme />
//         <LinkPreview />
//         <span aria-hidden="true" className="p-4">
//           {""}
//         </span>
//       </article>
//     </ProgressBar>
//   );
// };

const Post = ({ post }: { post: Post }) => {
  return (
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
};

export default Post;
