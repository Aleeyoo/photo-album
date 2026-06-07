import { animate } from "motion";
import {
  fetchConfig,
  fetchPosts,
  normalizePosts,
  isDev,
} from "./api";
import { buildMasonryLayout } from "./masonry";
import { createPool, activeMap, elToMediaItem, releaseElement } from "./pool";
import { renderVisibleItems, ViewState } from "./renderer";
import {
  LightboxState,
  openLightbox,
  closeLightbox,
  copyLightboxImage,
} from "./lightbox";
import { createFilter } from "./filter";
import type { MediaItem, Config } from "./types";

// DOM refs
const viewport = document.getElementById("viewport")!;
const grid = document.getElementById("grid")!;
const overlay = document.getElementById("lightbox-overlay")!;
const lightboxClose = document.getElementById("lightbox-close")!;
const lightboxCopy = document.getElementById("lightbox-copy")!;

// State
const cameraOffset = { x: 0, y: 0 };
const targetOffset = { x: 0, y: 0 };

const drag = { active: false, hasMoved: false };
const dragStartPos = { x: 0, y: 0 };
const prevMouse = { x: 0, y: 0 };

const lightboxState: LightboxState = {
  open: false,
  animating: false,
  item: null,
};

let allItems: MediaItem[] = [];

const view: ViewState = {
  cameraOffset,
  targetOffset,
  lightboxElement: null,
};

const DRAG_THRESHOLD = 5;
let channel = "";

function updateLightboxEl() {
  view.lightboxElement = lightboxState.item?.element || null;
}

// ── Input Handlers ──

function onMouseDown(e: MouseEvent) {
  if (lightboxState.open) return;
  drag.active = true;
  drag.hasMoved = false;
  dragStartPos.x = e.clientX;
  dragStartPos.y = e.clientY;
  prevMouse.x = e.clientX;
  prevMouse.y = e.clientY;
  viewport.classList.add("grabbing");
}

function onMouseMove(e: MouseEvent) {
  if (!drag.active) return;

  const d = Math.hypot(
    e.clientX - dragStartPos.x,
    e.clientY - dragStartPos.y
  );
  if (d > DRAG_THRESHOLD) drag.hasMoved = true;

  targetOffset.x -= e.clientX - prevMouse.x;
  targetOffset.y -= e.clientY - prevMouse.y;
  prevMouse.x = e.clientX;
  prevMouse.y = e.clientY;
}

function onMouseUp(e: MouseEvent) {
  const wasActive = drag.active;
  drag.active = false;
  viewport.classList.remove("grabbing");

  if (wasActive && !drag.hasMoved && !lightboxState.open) {
    const target = (e.target as HTMLElement).closest(
      ".grid-item"
    ) as HTMLElement | null;
    if (target) {
      const media = elToMediaItem.get(target);
      if (media) {
        updateLightboxEl();
        openLightbox(target, media, lightboxState, channel);
      }
    }
  }
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    prevMouse.x = e.touches[0].clientX;
    prevMouse.y = e.touches[0].clientY;
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 1) {
    e.preventDefault();
    targetOffset.x -= e.touches[0].clientX - prevMouse.x;
    targetOffset.y -= e.touches[0].clientY - prevMouse.y;
    prevMouse.x = e.touches[0].clientX;
    prevMouse.y = e.touches[0].clientY;
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  if (lightboxState.open) return;
  targetOffset.x += e.deltaX;
  targetOffset.y += e.deltaY;
}

function onWindowResize() {
  buildMasonryLayout(allItems);
  for (const [, entry] of activeMap) releaseElement(entry.poolEl);
  activeMap.clear();
  createPool(grid);
  renderVisibleItems(view);
}

// ── Animation Loop ──

function animateLoop() {
  requestAnimationFrame(animateLoop);

  const dx = targetOffset.x - cameraOffset.x;
  const dy = targetOffset.y - cameraOffset.y;

  if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
    cameraOffset.x += dx * 0.1;
    cameraOffset.y += dy * 0.1;
    renderVisibleItems(view);
  }
}

// ── Init ──

async function init() {
  try {
    let config: Config;

    if (isDev()) {
      config = {
        apiBaseUrl: "https://tg-api.aleeyoo.workers.dev",
        channel:
          (import.meta as any).env?.VITE_CHANNEL ?? "jinjinleedao",
      };
    } else {
      config = await fetchConfig();
    }

    channel = config.channel;
    console.log(`Config: api="${config.apiBaseUrl}", channel=${config.channel}`);

    const raw = await fetchPosts(config.apiBaseUrl, config.channel);
    const { items, tags } = normalizePosts(raw);
    allItems = items;

    console.log(`Loaded ${items.length} media items, ${tags.length} tags`);

    buildMasonryLayout(items);
    createPool(grid);
    renderVisibleItems(view);
    createFilter(tags, items, (filtered) => {
      allItems = filtered;
    }, view, grid);

    // Pre-warm Motion
    const warmup = document.createElement("div");
    warmup.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;";
    document.body.appendChild(warmup);
    animate(warmup as any, { opacity: [0, 1] }, { duration: 0.01 }).then(() =>
      warmup.remove()
    );
  } catch (e) {
    console.error("Failed to init:", e);
    grid.innerHTML = `<div style="color:#fff;text-align:center;padding:40px;">Failed to load data. Check console.</div>`;
    return;
  }

  // Event binding
  viewport.addEventListener("mousedown", onMouseDown);
  viewport.addEventListener("mousemove", onMouseMove);
  viewport.addEventListener("mouseup", onMouseUp);
  viewport.addEventListener("mouseleave", onMouseUp);
  viewport.addEventListener("wheel", onWheel, { passive: false });
  viewport.addEventListener("touchstart", onTouchStart, { passive: true });
  viewport.addEventListener("touchmove", onTouchMove, { passive: false });

  lightboxClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLightbox(lightboxState);
    updateLightboxEl();
  });
  lightboxCopy.addEventListener("click", (e) => {
    e.stopPropagation();
    copyLightboxImage(lightboxState);
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeLightbox(lightboxState);
      updateLightboxEl();
    }
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxState.open) {
      closeLightbox(lightboxState);
      updateLightboxEl();
    }
  });
  window.addEventListener("resize", onWindowResize);

  animateLoop();
}

init();
