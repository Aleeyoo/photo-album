import { layoutItems, totalWidth, maxColHeight, BUFFER } from "./masonry";
import {
  activeMap,
  acquireElement,
  releaseElement,
  elToMediaItem,
} from "./pool";
import type { MediaItem } from "./types";

export interface ViewState {
  cameraOffset: { x: number; y: number };
  targetOffset: { x: number; y: number };
  lightboxElement: HTMLElement | null;
}

export function renderVisibleItems(view: ViewState) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const buf = BUFFER;

  const lightboxEl = view.lightboxElement;
  const camX = view.cameraOffset.x;
  const camY = view.cameraOffset.y;

  const minCullX = Math.min(camX, view.targetOffset.x);
  const maxCullX = Math.max(camX, view.targetOffset.x);
  const minCullY = Math.min(camY, view.targetOffset.y);
  const maxCullY = Math.max(camY, view.targetOffset.y);

  const startTileX = Math.floor((minCullX - buf) / totalWidth);
  const endTileX = Math.floor((maxCullX + vw + buf) / totalWidth);
  const startTileY = Math.floor((minCullY - buf) / maxColHeight);
  const endTileY = Math.floor((maxCullY + vh + buf) / maxColHeight);

  const visibleThisFrame = new Set<string>();

  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i];

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const worldX = item.x + tx * totalWidth;
        const worldY = item.y + ty * maxColHeight;

        const sx = worldX - camX;
        const sy = worldY - camY;

        const txs = worldX - view.targetOffset.x;
        const tys = worldY - view.targetOffset.y;

        const visibleAtCam =
          sx + item.w >= -buf &&
          sx <= vw + buf &&
          sy + item.h >= -buf &&
          sy <= vh + buf;
        const visibleAtTarget =
          txs + item.w >= -buf &&
          txs <= vw + buf &&
          tys + item.h >= -buf &&
          tys <= vh + buf;

        if (!visibleAtCam && !visibleAtTarget) continue;

        const visKey = `${item.key}_${tx}_${ty}`;
        visibleThisFrame.add(visKey);

        const existing = activeMap.get(visKey);
        if (existing) {
          if (existing.poolEl !== lightboxEl) {
            existing.poolEl.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
          }
          existing.screenX = sx;
          existing.screenY = sy;
        } else {
          const el = acquireElement();
          if (!el) continue;

          const media = item.media;

          if (media.type === "video") {
            if (media.poster) {
              el.innerHTML = `<img src="${media.poster}" alt="" loading="lazy" decoding="async" onerror="this.parentElement.classList.add('grid-item-video-fallback')">`;
            } else {
              el.innerHTML = `<div class="video-placeholder"></div>`;
            }
            el.classList.add("grid-item-video");
          } else {
            // Image card
            const img = el.querySelector("img");
            if (img) {
              if (img.src !== media.src) {
                img.src = media.src;
                img.alt = media.title.substring(0, 60);
              }
            } else {
              el.innerHTML = `<img src="${media.src}" alt="${media.title.substring(0, 60)}" loading="lazy" decoding="async">`;
            }
          }

          // Round video cards
          if (media.isRound) {
            el.classList.add("grid-item-round");
          } else {
            el.classList.remove("grid-item-round");
          }

          el.style.width = `${item.w}px`;
          el.style.height = `${item.h}px`;
          el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;

          elToMediaItem.set(el, media);
          activeMap.set(visKey, {
            poolEl: el,
            layoutItem: item,
            screenX: sx,
            screenY: sy,
          });
        }
      }
    }
  }

  // Release elements no longer visible
  for (const [visKey, entry] of activeMap) {
    if (!visibleThisFrame.has(visKey) && entry.poolEl !== lightboxEl) {
      releaseElement(entry.poolEl);
      elToMediaItem.delete(entry.poolEl);
      activeMap.delete(visKey);
    }
  }
}
