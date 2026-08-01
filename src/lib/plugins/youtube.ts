import { visit } from "unist-util-visit";
import type { Root, Paragraph, Link, Text, Parent } from "mdast";

// Fetch title from YouTube oEmbed — free, no API key needed
const fetchYouTubeTitle = async (videoId: string): Promise<string> => {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { next: { revalidate: 86400 } }, // cache for 24h (Next.js fetch cache)
    );
    if (!res.ok) return "YouTube video";
    const data = await res.json();
    return data.title ?? "YouTube video";
  } catch {
    return "YouTube video";
  }
};

const youtubeRegex =
  /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?$/;

// Extract all video IDs from tree (sync)
const extractVideoIds = (tree: Root): Map<string, string> => {
  const ids = new Map<string, string>(); // videoId → url
  visit(tree, "paragraph", (node: Paragraph) => {
    if (node.children.length !== 1) return;
    const child = node.children[0];
    const url =
      child.type === "link"
        ? (child as Link).url
        : child.type === "text"
          ? (child as Text).value.trim()
          : null;
    if (!url) return;
    const match = url.match(youtubeRegex);
    if (match) ids.set(match[1], url);
  });
  return ids;
};

// Build iframe HTML with accessible title
const buildIframe = (videoId: string, title: string): string => {
  const escapedTitle = title.replace(/"/g, "&quot;");
  const escapedCaption = title.replace(/</g, "&lt;");
  return `<figure>
    <div
      role="presentation"
      style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 2rem 0;"
    >
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        title="${escapedTitle}"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
    <figcaption>${escapedCaption}</figcaption>
  </figure>`;
};

// Async wrapper — call this before passing tree to remark
export const prefetchYouTubeTitles = async (
  tree: Root,
): Promise<Map<string, string>> => {
  const ids = extractVideoIds(tree);
  const titles = new Map<string, string>();
  await Promise.all(
    Array.from(ids.keys()).map(async (id) => {
      titles.set(id, await fetchYouTubeTitle(id));
    }),
  );
  return titles;
};

// Sync remark plugin — takes pre-fetched titles
const remarkYoutube = (titles: Map<string, string> = new Map()) => (tree: Root) => {
    visit(
      tree,
      "paragraph",
      (node: Paragraph, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || index === undefined) return;
        if (node.children.length !== 1) return;

        const child = node.children[0];
        const url =
          child.type === "link"
            ? (child as Link).url
            : child.type === "text"
              ? (child as Text).value.trim()
              : null;

        if (!url) return;
        const match = url.match(youtubeRegex);
        if (!match) return;

        const videoId = match[1];
        const title = titles.get(videoId) ?? "YouTube video";

        parent.children[index] = {
          type: "html",
          value: buildIframe(videoId, title),
        };
      },
    );
  };

export default remarkYoutube;
