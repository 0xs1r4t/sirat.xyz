import { createBlockRenderer, Plugin } from "@notion-render/client";
import type { CodeBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import Prism from "prismjs";

// Languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";

// Styles
import "prismjs/themes/prism-tomorrow.css";

// Optional configuration for future enhancements
type Config = Record<string, unknown>;

const codeBlockRenderer = (options: Config) =>
  createBlockRenderer<CodeBlockObjectResponse>(
    "code",
    async (data, renderer) => {
      // Render the rich text content from Notion
      const code = await renderer.render(...data.code.rich_text);

      // Use PrismJS to highlight the code based on the language
      const language = Prism.languages[data.code.language]
        ? data.code.language
        : "markup"; // Fallback to 'markup' if language is not supported

      const highlightedCode = Prism.highlight(
        code,
        Prism.languages[language],
        language
      );

      return `
        <div class="code-block-container">
          <button
            onclick="navigator.clipboard.writeText(this.parentElement.querySelector('code').innerText)"
            class="copy-button"
            aria-label="copy code block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" class="not-prose">
              <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z" />
                <path d="M4.012 16.737A2 2 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1" />
              </g>
            </svg>

          </button>
          <pre><code class="code-block-container language-${language}">${highlightedCode}</code></pre>
          ${
            data.code.caption.length > 1
              ? `<legend class="code-block-caption">${await renderer.render(
                  ...data.code.caption
                )}</legend>`
              : ""
          }
        </div>
      `;
    }
  );

// Define the PrismJS plugin for notion-render
const prismPlugin: Plugin<Config> = (options) => ({
  renderers: [codeBlockRenderer(options)],
  extensions: [],
});

export default prismPlugin;
