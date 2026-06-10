import { animate } from "motion";
import {
  fetchPosts,
  normalizePosts,
  fetchChannels,
  fetchApiBaseUrl,
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
import type { MediaItem } from "./types";
import { parsePath } from "./router";

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

  const d = Math.hypot(e.clientX - dragStartPos.x, e.clientY - dragStartPos.y);
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
    const target = (e.target as HTMLElement).closest(".grid-item") as HTMLElement | null;
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

// ── Channel List Page ──

function renderChannelList(apiBaseUrl: string) {
  grid.innerHTML = "";

  const container = document.createElement("div");
  container.style.cssText =
    "display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:24px;padding:40px;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;";

  const title = document.createElement("h1");
  title.textContent = "Photo Album";
  title.style.cssText = "font-size:28px;font-weight:600;letter-spacing:-0.02em;";

  const subtitle = document.createElement("p");
  subtitle.textContent = "选择频道浏览";
  subtitle.style.cssText = "font-size:16px;opacity:0.6;margin-top:-12px;";

  container.appendChild(title);
  container.appendChild(subtitle);

  const listEl = document.createElement("div");
  listEl.style.cssText = "display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:600px;";

  fetchChannels(apiBaseUrl).then((channels) => {
    if (channels.length > 0) {
      for (const ch of channels) {
        const a = document.createElement("a");
        a.href = `/${ch}`;
        a.textContent = ch;
        a.style.cssText =
          "padding:12px 24px;background:rgba(255,255,255,0.08);border-radius:100px;color:#fff;text-decoration:none;font-size:15px;transition:background 0.2s;";
        a.onmouseenter = () => (a.style.background = "rgba(255,255,255,0.15)");
        a.onmouseleave = () => (a.style.background = "rgba(255,255,255,0.08)");
        listEl.appendChild(a);
      }
    }

    // Manual input for any channel
    const inputWrap = document.createElement("div");
    inputWrap.style.cssText = "display:flex;gap:8px;margin-top:8px;width:100%;max-width:320px;";

    const input = document.createElement("input");
    input.placeholder = "或输入频道名...";
    input.style.cssText =
      "flex:1;padding:10px 16px;border-radius:100px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;";

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        location.href = `/${encodeURIComponent(input.value.trim())}`;
      }
    });

    inputWrap.appendChild(input);
    container.appendChild(listEl);
    container.appendChild(inputWrap);
    input.focus();
  });

  grid.appendChild(container);
}

// ── Channel Load ──

async function loadChannel(ch: string, apiBaseUrl: string, initialTag?: string) {
  channel = ch;
  document.title = `${ch} — Photo Album`;
  grid.innerHTML = `<div class="loading-indicator" style="color:#fff;text-align:center;padding:40px;">Loading ${ch}...</div>`;

  try {
    const allPosts: any[] = [];
    const seenIds = new Set<string>();
    let cursor: string | undefined;

    while (true) {
      const raw = await fetchPosts(apiBaseUrl, ch, cursor);
      const posts = raw.posts ?? [];
      if (posts.length === 0) break;

      for (const post of posts) {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          allPosts.push(post);
        }
      }
      cursor = posts[posts.length - 1].id;
    }

    const { items, tags } = normalizePosts({ posts: allPosts }, apiBaseUrl);
    allItems = items;

    console.log(`Loaded ${items.length} media items from ${allPosts.length} posts, ${tags.length} tags`);

    buildMasonryLayout(items);
    createPool(grid);
    renderVisibleItems(view);

    // Create filter — if initialTag matches a real tag, apply it
    createFilter(tags, items, (filtered) => {
      allItems = filtered;
    }, view, grid, initialTag && tags.includes(initialTag) ? initialTag : undefined);
  } catch (e) {
    console.error("Failed to load channel:", e);
    grid.innerHTML = `<div style="color:#fff;text-align:center;padding:40px;">
      <p>无法加载频道 "${ch}"</p>
      <a href="/" style="color:rgba(255,255,255,0.6);display:block;margin-top:16px;">返回频道列表</a>
    </div>`;
  }
}

// ── Init ──

async function init() {
  const apiBaseUrl = await fetchApiBaseUrl();
  console.log(`API base URL: ${apiBaseUrl}`);

  const { channel: ch, tag } = parsePath();
  console.log(`Path: channel="${ch}", tag="${tag}"`);

  if (!ch) {
    // Root path — show channel list
    renderChannelList(apiBaseUrl);
    return;
  }

  // Channel path — load grid
  await loadChannel(ch, apiBaseUrl, tag);

  // ── Event Binding (shared by all views) ──

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
