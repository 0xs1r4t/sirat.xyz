"use client";

import { useEffect } from "react";

const PREVIEW_DELAY_MS = 500;

interface PreviewData {
  image?: string;
  title?: string;
  description?: string;
}

const removeLegacyLinkEmoji = (link: HTMLAnchorElement) => {
  const textNodes = Array.from(link.childNodes).filter(
    (node) =>
      node.nodeType === Node.TEXT_NODE && node.textContent?.includes("🔗"),
  );
  textNodes.forEach((node) => node.remove());
};

const insertFavicon = (link: HTMLAnchorElement, domain: string) => {
  if (link.querySelector("img[data-link-favicon]")) return;

  const favicon = document.createElement("img");
  favicon.alt = "";
  favicon.setAttribute("data-link-favicon", "true");
  favicon.className = "inline-block mr-1";
  favicon.width = 16;
  favicon.height = 16;
  favicon.style.cssText = `
    display: inline-block !important;
    width: 16px !important;
    height: 16px !important;
    margin: 0 4px 0 0 !important;
    vertical-align: middle !important;
    position: relative;
    top: -1px;
  `;
  favicon.src =
    domain.includes("youtube.com") || domain.includes("youtu.be")
      ? "https://www.youtube.com/favicon.ico"
      : `https://icons.duckduckgo.com/ip3/${domain}.ico`;

  let imageLoaded = false;
  let fallbackAttempted = false;

  const insertCustomIcon = () => {
    favicon.remove();

    const iconContainer = document.createElement("span");
    iconContainer.className = "inline-block mr-1";
    iconContainer.style.cssText = `
      display: inline-block !important;
      width: 16px !important;
      height: 16px !important;
      margin-right: 4px;
      vertical-align: middle !important;
      position: relative;
      top: -1px;
    `;
    iconContainer.innerHTML = `
      <img
        src="/icons/pixel/LINK/LINK.svg"
        alt=""
        width="16"
        height="16"
        class="blend-link"
        style="display: inline-block !important; width: 16px !important; height: 16px !important; vertical-align: middle !important;"
      />
    `;

    link.insertBefore(iconContainer, link.firstChild);
  };

  const tryFallback = () => {
    if (fallbackAttempted) return;
    fallbackAttempted = true;
    favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

    // Give Google 1 second, then check if it worked.
    window.setTimeout(() => {
      if (!imageLoaded || favicon.naturalWidth <= 1) {
        insertCustomIcon();
      }
    }, 1000);
  };

  favicon.onerror = tryFallback;
  favicon.onload = () => {
    if (favicon.naturalWidth <= 1 || favicon.naturalHeight <= 1) {
      tryFallback();
    } else {
      imageLoaded = true;
    }
  };

  link.insertBefore(favicon, link.firstChild);
};

const buildPreview = (): HTMLDivElement => {
  const tooltip = document.createElement("div");
  tooltip.className = `absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2
    bg-background border-2 border-muted-200 rounded-lg p-3 w-80 shadow-lg
    transition-opacity duration-200 z-50`;
  tooltip.style.opacity = "1";
  // Supplemental visual preview; keep it out of the link's accessible name.
  tooltip.setAttribute("aria-hidden", "true");

  const loading = document.createElement("div");
  loading.className = "text-sm font-bold text-foreground mb-1";
  loading.textContent = "Loading preview...";
  tooltip.append(loading);

  return tooltip;
};

const renderPreview = (
  tooltip: HTMLDivElement,
  data: PreviewData | null,
  url: string,
) => {
  tooltip.replaceChildren();

  if (data?.image && /^https?:\/\//.test(data.image)) {
    const image = document.createElement("img");
    image.src = data.image;
    image.alt = "";
    image.className = "w-full h-36 object-cover rounded mb-2 bg-muted-100";
    tooltip.append(image);
  }

  const title = document.createElement("div");
  title.className = "text-sm font-bold text-foreground mb-1 line-clamp-2";
  title.textContent = data?.title || url;

  const description = document.createElement("div");
  description.className =
    "text-xs text-foreground opacity-80 line-clamp-3";
  description.textContent = data?.description || "";

  tooltip.append(title, description);
};

const LinkPreview = () => {
  useEffect(() => {
    const links =
      document.querySelectorAll<HTMLAnchorElement>(".external-link");
    const cleanups: Array<() => void> = [];

    links.forEach((link) => {
      let linkUrl: URL;
      try {
        linkUrl = new URL(link.href);
      } catch {
        return;
      }

      removeLegacyLinkEmoji(link);
      insertFavicon(link, linkUrl.hostname);

      let tooltip: HTMLDivElement | null = null;
      let tooltipTimeout: number | undefined;

      const hidePreview = () => {
        window.clearTimeout(tooltipTimeout);
        tooltip?.remove();
        tooltip = null;
      };

      const showPreview = () => {
        window.clearTimeout(tooltipTimeout);

        tooltipTimeout = window.setTimeout(async () => {
          const url = link.getAttribute("data-link-preview");
          if (!url) return;

          const tip = buildPreview();
          tooltip = tip;
          link.style.position = "relative";
          link.appendChild(tip);

          try {
            const response = await fetch(
              `/api/link-preview?url=${encodeURIComponent(url)}`,
            );
            if (!response.ok || tooltip !== tip) return;

            const data = (await response.json()) as PreviewData | null;
            renderPreview(tip, data, url);
          } catch {
            if (tooltip !== tip) return;

            tip.replaceChildren();
            const fallback = document.createElement("div");
            fallback.className = "text-sm text-foreground";
            fallback.textContent = url;
            tip.append(fallback);
          }
        }, PREVIEW_DELAY_MS);
      };

      link.addEventListener("mouseenter", showPreview);
      link.addEventListener("mouseleave", hidePreview);
      link.addEventListener("focus", showPreview);
      link.addEventListener("blur", hidePreview);

      cleanups.push(() => {
        link.removeEventListener("mouseenter", showPreview);
        link.removeEventListener("mouseleave", hidePreview);
        link.removeEventListener("focus", showPreview);
        link.removeEventListener("blur", hidePreview);
        hidePreview();
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
};

export default LinkPreview;
