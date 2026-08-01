import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkToc from "remark-toc";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import type { Root } from "mdast";

import remarkPostLink from "@/lib/plugins/post-link";
import rehypeLinkPreview from "@/lib/plugins/link-preview";
import rehypeExcalidraw from "@/lib/plugins/excalidraw";
import remarkYoutube, { prefetchYouTubeTitles } from "@/lib/plugins/youtube";
import rehypePreTabindex from "@/lib/plugins/pre-tabindex";

const contentDirectory = path.join(process.cwd(), "content/garden");

/** Frontmatter fields for a garden post, without its body content. */
export interface PostMetadata {
  slug: string;
  title: string;
  description: string;
  background?: string;
  tags: string[];
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** A fully-rendered post: frontmatter plus processed HTML and table of contents. */
export interface Post extends PostMetadata {
  content: string;
  html: string;
  toc: string;
}

/** Reads every post's frontmatter, newest first. */
export const getAllPosts = async (): Promise<PostMetadata[]> => {
  const fileNames = fs.readdirSync(contentDirectory);

  // Use Promise.all to handle async operations
  const posts = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map(async (fileName) => {
        const fullPath = path.join(contentDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data } = matter(fileContents);

        return {
          slug: data.slug,
          title: data.title,
          description: data.description,
          background: data.background,
          tags: data.tags || [],
          type: data.type,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as PostMetadata;
      }),
  );

  // Sort by createdAt in descending order (newest first)
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/** {@link getAllPosts}, filtered to `status === "published"`. */
export const getPublishedPosts = async (): Promise<PostMetadata[]> => {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.status === "published");
};

/** Loads and fully renders one post's markdown to HTML, or null if it doesn't exist. */
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Pre-parse tree to extract video IDs, fetch titles in parallel
    const tree = remark().use(remarkGfm).parse(content);
    const youtubeTitles = await prefetchYouTubeTitles(tree as unknown as Root);

    const processedContent = await remark()
      .use(remarkGfm) // GitHub-flavored markdown
      .use(remarkToc, {
        heading: "table of contents|contents|toc",
        tight: true,
        ordered: true,
        minDepth: 2,
        maxDepth: 6,
      }) // Table of contents
      .use(remarkMath) // Parse math syntax
      .use(remarkPostLink) // Internal post links
      .use(remarkYoutube, youtubeTitles) // YouTube embeds
      .use(remarkRehype, { allowDangerousHtml: true }) // Convert to rehype and preserve HTML
      .use(rehypeSlug) // Add slugs to headings
      .use(rehypePrism, {
        ignoreMissing: true,
        showLineNumbers: true, // Enable line numbers for all code blocks
      }) // Syntax highlighting (rehype plugin)
      .use(rehypePreTabindex) // Add tabindex and aria-label to pre elements
      .use(rehypeKatex) // Render math with KaTeX
      .use(rehypeLinkPreview) // Link previews
      .use(rehypeExcalidraw) // Excalidraw diagrams
      .use(rehypeStringify, { allowDangerousHtml: true }) // Convert to HTML string
      .process(content);

    const html = processedContent.toString();

    // Extract TOC from generated HTML
    // Extract TOC - it's an <h2> with id "table-of-contents" followed by an <ol>
    const tocMatch = html.match(
      /<h2 id="table-of-contents">Table of Contents<\/h2>\s*(<ol>[\s\S]*<\/ol>)/,
    );
    const toc = tocMatch ? tocMatch[1] : "";

    return {
      slug: data.slug,
      title: data.title,
      description: data.description,
      background: data.background,
      tags: data.tags || [],
      type: data.type,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      content,
      html,
      toc,
    } as Post;
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
};

/** Case-insensitive search over published posts' title, description, and tags. */
export const searchPosts = async (query: string): Promise<PostMetadata[]> => {
  const posts = await getPublishedPosts();
  const lowercaseQuery = query.toLowerCase();

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.description.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
};

/** Published posts carrying the given tag (case-insensitive). */
export const getPostsByTag = async (tag: string): Promise<PostMetadata[]> => {
  const posts = await getPublishedPosts();
  return posts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
};
