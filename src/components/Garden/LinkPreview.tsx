"use client";

import { useEffect, useState } from "react";

const LinkPreview = () => {
  const [mountedLinks, setMountedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const links =
      document.querySelectorAll<HTMLAnchorElement>(".external-link");

    links.forEach((link, index) => {
      const linkId = `link-${index}-${link.href}`;

      if (mountedLinks.has(linkId)) {
        return;
      }

      // Clean up any old nodes
      const textNodes = Array.from(link.childNodes).filter(
        (node) =>
          node.nodeType === Node.TEXT_NODE && node.textContent?.includes("🔗"),
      );
      textNodes.forEach((node) => node.remove());

      if (link.querySelector("img[data-link-favicon]")) {
        setMountedLinks((prev) => new Set(prev).add(linkId));
        return;
      }

      const domain = new URL(link.href).hostname;

      let faviconUrl;
      if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
        faviconUrl = "https://www.youtube.com/favicon.ico";
      } else {
        faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      }

      const favicon = document.createElement("img");
      favicon.src = faviconUrl;
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
        if (!fallbackAttempted) {
          fallbackAttempted = true;
          favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

          // Give Google 1 second, then check if it worked
          setTimeout(() => {
            if (!imageLoaded || favicon.naturalWidth <= 1) {
              insertCustomIcon();
            }
          }, 1000);
        }
      };

      favicon.onerror = () => {
        tryFallback();
      };

      favicon.onload = () => {
        // Check if it's actually a valid image (not a 404 placeholder)
        if (favicon.naturalWidth <= 1 || favicon.naturalHeight <= 1) {
          console.warn(`Favicon loaded but appears blank for ${link.href}`);
          tryFallback();
        } else {
          imageLoaded = true;
        }
      };

      link.insertBefore(favicon, link.firstChild);
      setMountedLinks((prev) => new Set(prev).add(linkId));

      let tooltipTimeout: NodeJS.Timeout;
      let tooltip: HTMLDivElement | null = null;

      link.addEventListener("mouseenter", () => {
        tooltipTimeout = setTimeout(async () => {
          const url = link.getAttribute("data-link-preview");
          if (!url) return;

          tooltip = document.createElement("div");
          tooltip.className = `
            absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2 
            bg-background border-2 border-muted-200 rounded-lg 
            p-3 w-80 shadow-lg transition-opacity duration-200 z-50
          `;
          tooltip.style.opacity = "1";

          tooltip.innerHTML = `
            <div class="text-sm font-bold text-foreground mb-1">Loading preview...</div>
          `;
          link.style.position = "relative";
          link.appendChild(tooltip);

          try {
            const response = await fetch(
              `/api/link-preview?url=${encodeURIComponent(url)}`,
            );
            if (response.ok) {
              const data = await response.json();
              if (tooltip) {
                tooltip.innerHTML = `
                  ${
                    data.image
                      ? `
                    <img 
                      src="${data.image}" 
                      class="w-full h-36 object-cover rounded mb-2 bg-muted-100" 
                      alt="Preview" 
                    />
                  `
                      : ""
                  }
                  <div class="text-sm font-bold text-foreground mb-1 line-clamp-2">
                    ${data.title || url}
                  </div>
                  <div class="text-xs text-foreground opacity-80 line-clamp-3">
                    ${data.description || ""}
                  </div>
                `;
              }
            }
          } catch {
            if (tooltip) {
              tooltip.innerHTML = `
                <div class="text-sm text-foreground">${url}</div>
              `;
            }
          }
        }, 500);
      });

      link.addEventListener("mouseleave", () => {
        clearTimeout(tooltipTimeout);
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }
      });
    });
  }, [mountedLinks]);

  return null;
};

export default LinkPreview;
