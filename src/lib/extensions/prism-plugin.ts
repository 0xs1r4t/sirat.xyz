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
        <div>
            <pre><code class="language-${language}">${highlightedCode}</code></pre>
            ${
              data.code.caption.length > 1
                ? `<legend>${await renderer.render(
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
