import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkToc from "remark-toc";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";

import remarkYoutube from "@/lib/plugins/youtube";
import remarkPostLink from "@/lib/plugins/post-link";
import rehypeLinkPreview from "@/lib/plugins/link-preview";

const contentDirectory = path.join(process.cwd(), "content/garden");

export interface PostMetadata {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post extends PostMetadata {
  content: string;
  html: string;
  toc: string;
}

// Get all markdown files
export async function getAllPosts(): Promise<PostMetadata[]> {
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
          tags: data.tags || [],
          type: data.type,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as PostMetadata;
      }),
  );

  // Sort by createdAt in descending order (newest first)
  return posts.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Get only published posts
export async function getPublishedPosts(): Promise<PostMetadata[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.status === "published");
}

// Get post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const processedContent = await remark()
      .use(remarkGfm) // GitHub-flavored markdown
      .use(remarkToc, {
        heading: "table of contents|contents|toc",
        tight: true,
        ordered: true,
        maxDepth: 4,
      }) // Table of contents
      .use(remarkMath) // Parse math syntax
      .use(remarkPostLink) // Internal post links
      .use(remarkYoutube) // YouTube embeds
      .use(remarkRehype, { allowDangerousHtml: true }) // Convert to rehype and preserve HTML
      .use(rehypeSlug) // Add slugs to headings
      .use(rehypePrism, {
        ignoreMissing: true,
        showLineNumbers: true, // Enable line numbers for all code blocks
      }) // Syntax highlighting (rehype plugin)
      .use(rehypeKatex) // Render math with KaTeX
      .use(rehypeLinkPreview) // Link previews
      .use(rehypeStringify, { allowDangerousHtml: true }) // Convert to HTML string
      .process(content);

    const html = processedContent.toString();

    // Extract TOC from generated HTML
    // Extract TOC - it's an <h2> with id "table-of-contents" followed by an <ol>
    const tocMatch = html.match(
      /<h2 id="table-of-contents">Table of Contents<\/h2>\s*(<ol>[\s\S]*?<\/ol>)/,
    );
    const toc = tocMatch ? tocMatch[1] : "";

    return {
      slug: data.slug,
      title: data.title,
      description: data.description,
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
}

// Search posts by query
export async function searchPosts(query: string): Promise<PostMetadata[]> {
  const posts = await getPublishedPosts();
  const lowercaseQuery = query.toLowerCase();

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.description.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
}

// Filter by tag
export async function getPostsByTag(tag: string): Promise<PostMetadata[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}
