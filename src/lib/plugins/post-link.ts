import { visit } from "unist-util-visit";
import type { Root, Text, Parent } from "mdast";

/**
 * Remark plugin to convert [[post-slug]] into internal links
 * Usage: [[about-this-digital-garden]]
 */

const remarkPostLink = () => {
  return (tree: Root) => {
    visit(
      tree,
      "text",
      (node: Text, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || index === undefined) return;

        const text = node.value;
        const regex = /\[\[([^\]]+)\]\]/g;
        let match;
        const newNodes: any[] = [];
        let lastIndex = 0;

        while ((match = regex.exec(text)) !== null) {
          const slug = match[1];

          // Add text before the link
          if (match.index > lastIndex) {
            newNodes.push({
              type: "text",
              value: text.slice(lastIndex, match.index),
            });
          }

          // Add the link
          newNodes.push({
            type: "link",
            url: `/garden/${slug}`,
            title: null,
            children: [{ type: "text", value: slug.replace(/-/g, " ") }],
          });

          lastIndex = regex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < text.length) {
          newNodes.push({
            type: "text",
            value: text.slice(lastIndex),
          });
        }

        // Replace the node if we found matches
        if (newNodes.length > 0) {
          parent.children.splice(index, 1, ...newNodes);
        }
      }
    );
  };
};

export default remarkPostLink;
