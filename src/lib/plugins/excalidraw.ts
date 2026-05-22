// excalidraw.ts
import { visit } from "unist-util-visit";
import type { Root, Element, Text } from "hast";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = process.env.NEXT_PUBLIC_ROOT || process.cwd();
const DARK_THEMES = ["blueberry-lemon"];

function stripSvgDimensions(svg: string): string {
  return svg.replace(/\s+width="[^"]*"/, "").replace(/\s+height="[^"]*"/, "");
}

const THEME_SCRIPT = `<script>
(function() {
  var DARK_THEMES = ["blueberry-lemon"];

  function syncTheme() {
    var isDark = DARK_THEMES.some(function(t) {
      return document.documentElement.classList.contains(t);
    });
    document.querySelectorAll('.excalidraw-light').forEach(function(el) {
      el.style.display = isDark ? 'none' : '';
    });
    document.querySelectorAll('.excalidraw-dark').forEach(function(el) {
      el.style.display = isDark ? '' : 'none';
    });
  }

  // Run immediately for figures already in the DOM
  syncTheme();

  // Watch for theme class changes on <html>
  new MutationObserver(syncTheme).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ['class'] }
  );

  // Watch for figures not yet parsed when this script ran
  new MutationObserver(function(mutations) {
    var isDark = DARK_THEMES.some(function(t) {
      return document.documentElement.classList.contains(t);
    });
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        [node].concat(Array.from(node.querySelectorAll('.excalidraw-light, .excalidraw-dark'))).forEach(function(el) {
          if (el.classList.contains('excalidraw-light')) el.style.display = isDark ? 'none' : '';
          if (el.classList.contains('excalidraw-dark'))  el.style.display = isDark ? '' : 'none';
        });
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>`;

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
      nodes.map(async ({ node, index, parent }, i) => {
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
              // Script injected once, before the first figure only
              ...(i === 0 ? [{ type: "raw", value: THEME_SCRIPT }] : []),
              {
                type: "element",
                tagName: "div",
                properties: {
                  className: ["excalidraw-light"],
                  // default visible; syncTheme will hide if dark on load
                  style: "width: 100%;",
                },
                children: [{ type: "raw", value: lightSvg }],
              },
              {
                type: "element",
                tagName: "div",
                properties: {
                  className: ["excalidraw-dark"],
                  // hidden by default; syncTheme shows if dark on load
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
