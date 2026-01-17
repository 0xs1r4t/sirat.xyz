"use client";

import { useEffect, useState } from "react";

const LinkPreview = () => {
  const [mountedLinks, setMountedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log("LinkPreview component mounted");

    const links =
      document.querySelectorAll<HTMLAnchorElement>(".external-link");
    console.log("Found external links:", links.length);

    links.forEach((link, index) => {
      const linkId = `link-${index}-${link.href}`;

      if (mountedLinks.has(linkId)) {
        console.log(`Link ${index} already processed, skipping`);
        return;
      }

      // Clean up any old nodes
      const textNodes = Array.from(link.childNodes).filter(
        (node) =>
          node.nodeType === Node.TEXT_NODE && node.textContent?.includes("🔗")
      );
      textNodes.forEach((node) => node.remove());

      if (link.querySelector("img[data-link-favicon]")) {
        console.log(`Favicon already exists for link ${index}, skipping`);
        setMountedLinks((prev) => new Set(prev).add(linkId));
        return;
      }

      console.log(`Processing link ${index}:`, link.href);

      const domain = new URL(link.href).hostname;

      let faviconUrl;
      if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
        faviconUrl = "https://www.youtube.com/favicon.ico";
      } else {
        faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      }

      console.log(`Favicon URL for link ${index}:`, faviconUrl);

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
        margin-right: 4px;
        vertical-align: text-bottom;
      `;

      let imageLoaded = false;
      let fallbackAttempted = false;

      const tryFallback = () => {
        if (!fallbackAttempted) {
          fallbackAttempted = true;
          console.log(`Trying Google fallback for ${link.href}`);
          favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

          // Give Google 1 second, then check if it worked
          setTimeout(() => {
            if (!imageLoaded || favicon.naturalWidth <= 1) {
              console.log(`Using custom icon for ${link.href}`);
              useCustomIcon();
            }
          }, 1000);
        }
      };

      const useCustomIcon = () => {
        favicon.remove();

        const iconContainer = document.createElement("span");
        iconContainer.className = "inline-block mr-1";
        iconContainer.style.cssText = `
          display: inline-block !important;
          width: 16px !important;
          height: 16px !important;
          margin-right: 4px;
          vertical-align: text-bottom;
        `;
        iconContainer.innerHTML = `
          <img 
            src="/icons/pixel/LINK.svg" 
            alt="" 
            width="16" 
            height="16"
            class="blend-link"
            style="display: inline-block !important; width: 16px !important; height: 16px !important;"
          />
        `;

        link.insertBefore(iconContainer, link.firstChild);
        console.log(`Inserted custom icon for link ${index}`);
      };

      favicon.onerror = () => {
        console.error(`Failed to load favicon for ${link.href}`);
        tryFallback();
      };

      favicon.onload = () => {
        console.log(
          `Favicon loaded for ${link.href} - Width: ${favicon.naturalWidth}, Height: ${favicon.naturalHeight}`
        );

        // Check if it's actually a valid image (not a 404 placeholder)
        if (favicon.naturalWidth <= 1 || favicon.naturalHeight <= 1) {
          console.warn(`Favicon loaded but appears blank for ${link.href}`);
          tryFallback();
        } else {
          imageLoaded = true;
          console.log(`Successfully loaded favicon for ${link.href}`);
        }
      };

      link.insertBefore(favicon, link.firstChild);
      console.log(`Inserted favicon for link ${index}`);
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
              `/api/link-preview?url=${encodeURIComponent(url)}`
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
          } catch (e) {
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
