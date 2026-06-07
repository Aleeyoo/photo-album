import { POOL_SIZE } from "./masonry";
import type { MediaItem } from "./types";

export const activeMap = new Map<
  string,
  { poolEl: HTMLElement; layoutItem: any; screenX: number; screenY: number }
>();
export const elToMediaItem = new WeakMap<HTMLElement, MediaItem>();

export function createPool(grid: HTMLElement) {
  grid.innerHTML = "";
  activeMap.clear();

  for (let i = 0; i < POOL_SIZE; i++) {
    const el = document.createElement("div");
    el.className = "grid-item";
    el.style.display = "none";
    el.innerHTML = `<img src="" alt="" loading="lazy" decoding="async">`;
    grid.appendChild(el);
  }
}

export function acquireElement(): HTMLElement | null {
  const parent = document.getElementById("grid");
  if (!parent) return null;
  const children = parent.children;
  for (let i = 0; i < children.length; i++) {
    const el = children[i] as HTMLElement;
    if (el.style.display === "none") {
      el.style.display = "";
      return el;
    }
  }
  return null;
}

export function releaseElement(el: HTMLElement) {
  el.style.display = "none";
  el.style.visibility = "";
  const img = el.querySelector("img");
  if (img) {
    img.src = "";
    img.alt = "";
  }
  el.classList.remove("grid-item-video");
}
