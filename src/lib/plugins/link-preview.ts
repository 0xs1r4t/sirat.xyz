import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

const rehypeLinkPreview = () => {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a" && node.properties?.href) {
        const href = node.properties.href as string;

        // Only process external links (not internal /garden links)
        if (href.startsWith("http://") || href.startsWith("https://")) {
          try {
            const url = new URL(href);
            const domain = url.hostname;

            // Add favicon using Google's favicon service
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

            // Add data attributes for preview
            node.properties = {
              ...node.properties,
              "data-link-preview": href,
              "data-favicon": faviconUrl,
              className: "external-link",
            };
          } catch (e) {
            // Invalid URL, skip
          }
        } else {
          // Mark internal links
          node.properties = {
            ...node.properties,
            className: "internal-link",
          };
        }
      }
    });
  };
};

export default rehypeLinkPreview;
