import { visit } from "unist-util-visit";
import type { Root, Paragraph, Link, Text } from "mdast";

const remarkYoutube = () => {
  return (tree: Root) => {
    visit(
      tree,
      "paragraph",
      (node: Paragraph, index: number | undefined, parent: any) => {
        if (!parent || index === undefined) return;

        // Check if paragraph contains only one child (link or text)
        if (node.children.length !== 1) return;

        const child = node.children[0];
        let url: string | null = null;

        // Handle link nodes
        if (child.type === "link") {
          url = (child as Link).url;
        }
        // Handle text nodes (bare URLs)
        else if (child.type === "text") {
          url = (child as Text).value.trim();
        }

        if (!url) return;

        // Match YouTube URLs
        const youtubeRegex =
          /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?$/;
        const match = url.match(youtubeRegex);

        if (match) {
          const videoId = match[1];

          // Replace with HTML node
          parent.children[index] = {
            type: "html",
            value: `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 2rem 0;">
              <iframe 
                src="https://www.youtube.com/embed/${videoId}" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
              ></iframe>
            </div>`,
          };
        }
      }
    );
  };
};

export default remarkYoutube;
