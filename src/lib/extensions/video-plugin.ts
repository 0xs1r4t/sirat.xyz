import { createBlockRenderer, Plugin } from "@notion-render/client";
import type { VideoBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import "./styles.css";
// import "../../styles/filters.css";

// Optional configuration for future enhancements
type Config = Record<string, unknown>;

const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const videoBlockRenderer = (options: Config) =>
  createBlockRenderer<VideoBlockObjectResponse>(
    "video",
    async (data, renderer) => {
      const caption = await renderer.render(...data.video.caption);
      const url =
        data.video.type === "file"
          ? data.video.file.url
          : data.video.external.url;
      const youtubeId = getYouTubeVideoId(url);
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      console.log(origin);

      if (youtubeId) {
        return `
          <div class="video-container">
            <iframe
              src="https://www.youtube.com/embed/${youtubeId}?origin=${encodeURIComponent(
          origin
        )}"
              title="${caption}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              class="video-iframe"
            ></iframe>
          </div>
        `;
      }

      return `
        <video controls>
          <source src=${url} type="video/mp4" alt=${caption} />
          <p>
            Your browser doesn't support HTML video. Here is a
            <a href=${url} download=${url} alt=${caption}>link to the video</a> instead.
          </p>
        </video>
      `;
    }
  );

const videoPlugin: Plugin<Config> = (options) => ({
  renderers: [videoBlockRenderer(options)],
  extensions: [],
});

export default videoPlugin;
