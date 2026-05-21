import { visit } from "unist-util-visit";
import type { Root, Element, Text } from "hast";
import * as fs from "fs";
import * as path from "path";

const rehypeExcalidraw = () => {
  return async (tree: Root) => {
    const nodes: { node: Element; index: number; parent: any }[] = [];

    visit(tree, "element", (node: Element, index, parent: any) => {
      if (!parent || index === undefined) return;
      if (node.tagName !== "pre") return;

      const codeEl = node.children?.[0] as Element;
      if (!codeEl || codeEl.tagName !== "code") return;

      const className = (codeEl.properties?.className as string[]) ?? [];
      if (!className.includes("language-excalidraw")) return;

      nodes.push({ node, index, parent });
    });

    // process async after collecting (visit isn't async-safe inline)
    await Promise.all(
      nodes.map(async ({ node, index, parent }) => {
        const codeEl = node.children?.[0] as Element;
        const filename = (codeEl.children?.[0] as Text)?.value?.trim();
        if (!filename) return;

        const filePath = path.join(process.cwd(), "public", filename);

        if (!fs.existsSync(filePath)) {
          parent.children[index] = errorNode(
            `⚠️ Excalidraw file not found: ${filename}`,
          );
          return;
        }

        try {
          const excalidrawToSvg = (await import("excalidraw-to-svg")).default;
          const raw = fs.readFileSync(filePath, "utf-8");
          const data = JSON.parse(raw);
          const svgEl = await excalidrawToSvg(data);
          const svgString = svgEl.outerHTML;

          parent.children[index] = {
            type: "element",
            tagName: "figure",
            properties: {
              className: [
                "not-prose",
                "my-8",
                "overflow-x-auto",
                "rounded-lg",
                "border-2",
                "border-muted-200",
                "p-4",
                "[&_svg]:w-full",
                "[&_svg]:h-auto",
                "[&_svg]:bg-transparent",
              ].join(" "),
            },
            children: [{ type: "raw", value: svgString }],
          };
        } catch (e) {
          parent.children[index] = errorNode(
            `⚠️ Failed to render Excalidraw diagram: ${filename}`,
          );
        }
      }),
    );
  };
};

function errorNode(message: string): Element {
  return {
    type: "element",
    tagName: "p",
    properties: {
      className:
        "font-monaco text-sm text-red-500 border border-red-300 rounded p-2",
    },
    children: [{ type: "text", value: message }],
  };
}

export default rehypeExcalidraw;
