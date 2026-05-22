import { visit } from "unist-util-visit";
import type { Root, Element, Text } from "hast";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = process.env.NEXT_PUBLIC_ROOT || process.cwd();

function stripSvgDimensions(svg: string): string {
  return svg.replace(/\s+width="[^"]*"/, "").replace(/\s+height="[^"]*"/, "");
}

const rehypeExcalidraw = () => {
  return async (tree: Root) => {
    const nodes: { node: Element; index: number; parent: any }[] = [];

    visit(tree, "element", (node: Element, index, parent: any) => {
      if (!parent || index === undefined) return;
      if (node.tagName !== "pre") return;

      const codeEl = node.children?.[0] as Element;
      if (!codeEl || codeEl.tagName !== "code") return;

      const classNames = (codeEl.properties?.className as string[]) ?? [];
      const isExcalidraw = classNames.some(
        (c) => c === "language-excalidraw" || c === "excalidraw",
      );
      if (!isExcalidraw) return;

      nodes.push({ node, index, parent });
    });

    if (nodes.length === 0) return;

    await Promise.all(
      nodes.map(async ({ node, index, parent }) => {
        const codeEl = node.children?.[0] as Element;

        let filename = "";
        visit(codeEl, "text", (t: Text) => {
          filename += t.value;
        });
        filename = filename.trim().replace(/^\//, "");

        if (!filename) {
          parent.children[index] = errorNode(
            "⚠️ Excalidraw: no filename provided",
          );
          return;
        }

        const lightPath = path.join(
          PROJECT_ROOT,
          "public",
          `${filename}-light.svg`,
        );
        const darkPath = path.join(
          PROJECT_ROOT,
          "public",
          `${filename}-dark.svg`,
        );

        if (!fs.existsSync(lightPath) || !fs.existsSync(darkPath)) {
          parent.children[index] = errorNode(
            `⚠️ Excalidraw SVGs not found: ${filename}-light.svg / ${filename}-dark.svg`,
          );
          return;
        }

        try {
          const lightSvg = stripSvgDimensions(
            fs.readFileSync(lightPath, "utf-8"),
          );
          const darkSvg = stripSvgDimensions(
            fs.readFileSync(darkPath, "utf-8"),
          );

          parent.children[index] = {
            type: "element",
            tagName: "figure",
            properties: {
              className: ["excalidraw-embed", "not-prose"],
              style:
                "margin: 2rem 0; border-radius: 0.5rem; border: 1px solid var(--color-border); padding: 1rem; overflow-x: auto;",
            },
            children: [
              {
                type: "element",
                tagName: "div",
                properties: {
                  className: ["excalidraw-light"],
                  style: "width: 100%;",
                },
                children: [{ type: "raw", value: lightSvg }],
              },
              {
                type: "element",
                tagName: "div",
                properties: {
                  className: ["excalidraw-dark"],
                  style: "display: none; width: 100%;",
                },
                children: [{ type: "raw", value: darkSvg }],
              },
            ],
          };
        } catch (e) {
          console.error("Excalidraw embed error:", e);
          parent.children[index] = errorNode(`⚠️ Failed to embed: ${filename}`);
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
      style:
        "color: red; font-family: monospace; font-size: 0.875rem; border: 1px solid red; border-radius: 0.25rem; padding: 0.5rem;",
    },
    children: [{ type: "text", value: message }],
  };
}

export default rehypeExcalidraw;
