import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

const rehypePreTabindex = () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;
      node.properties = node.properties ?? {};
      node.properties.tabIndex = 0;
      // Only add aria-label if not already present
      if (!node.properties["aria-label"]) {
        // Try to get language from child <code> class (e.g. "language-cpp")
        const codeChild = node.children.find(
          (c): c is Element => c.type === "element" && c.tagName === "code",
        );
        const langClass = (codeChild?.properties?.className as string[])?.find(
          (c) => c.startsWith("language-"),
        );
        const lang = langClass
          ? langClass.replace("language-", "").toUpperCase()
          : "code";
        node.properties["aria-label"] = `${lang} code block`;
      }
    });
  };

export default rehypePreTabindex;
