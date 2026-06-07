import { animate } from "motion";
import type { MediaItem, TextBlock, ReplyBlock, LinkPreviewBlock } from "./types";

const DRAG_THRESHOLD = 5;

const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const animateValue = (
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number) => void,
  onDone?: () => void,
  easing: (t: number) => number = easeInOutQuart
) => {
  const start = performance.now();
  const tick = (now: number) => {
    const elapsed = Math.min((now - start) / duration, 1);
    const eased = easing(elapsed);
    onUpdate(from + (to - from) * eased);
    if (elapsed < 1) requestAnimationFrame(tick);
    else if (onDone) onDone();
  };
  requestAnimationFrame(tick);
};

export interface LightboxState {
  open: boolean;
  animating: boolean;
  item: {
    element: HTMLElement;
    media: MediaItem;
    _startX: number;
    _startY: number;
    _startW: number;
    _startH: number;
    _endX: number;
    _endY: number;
    _endW: number;
    _endH: number;
  } | null;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildContentBlocks(media: MediaItem): DocumentFragment | null {
  const post = media.post;
  if (!post?.blocks) return null;

  const frag = document.createDocumentFragment();
  const textBlocks: TextBlock[] = [];
  let replyBlock: ReplyBlock | null = null;
  let linkBlock: LinkPreviewBlock | null = null;

  for (const block of post.blocks) {
    if (block.type === "text") textBlocks.push(block as TextBlock);
    else if (block.type === "reply" && !replyBlock) replyBlock = block as ReplyBlock;
    else if (block.type === "link_preview" && !linkBlock) linkBlock = block as LinkPreviewBlock;
  }

  // Reply block (shown first)
  if (replyBlock) {
    const replyEl = document.createElement("div");
    replyEl.className = "lightbox-reply-block";
    replyEl.innerHTML = `<div class="reply-label">Replying to</div>${escapeHtml(replyBlock.text)}`;
    frag.appendChild(replyEl);
  }

  // Text blocks (max 3)
  const displayTexts = textBlocks.slice(0, 3);
  for (const tb of displayTexts) {
    const textEl = document.createElement("div");
    textEl.className = "lightbox-text-block";
    textEl.innerHTML = tb.html;
    frag.appendChild(textEl);
  }

  // Link preview card
  if (linkBlock) {
    const linkEl = document.createElement("a");
    linkEl.className = "lightbox-link-preview-card";
    linkEl.href = linkBlock.url;
    linkEl.target = "_blank";
    linkEl.rel = "noopener";
    linkEl.innerHTML = `<div class="lp-site">${escapeHtml(linkBlock.siteName)}</div><div class="lp-title">${escapeHtml(linkBlock.title)}</div>${linkBlock.description ? `<div class="lp-desc">${escapeHtml(linkBlock.description)}</div>` : ""}`;
    frag.appendChild(linkEl);
  }

  return frag.childNodes.length > 0 ? frag : null;
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

export function openLightbox(
  el: HTMLElement,
  media: MediaItem,
  state: LightboxState,
  channel: string
) {
  if (state.open || state.animating) return;

  state.animating = true;
  state.open = true;

  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = vw * 0.7;
  const maxH = vh * 0.7;

  const aspectRatio = rect.width / rect.height;
  let targetW: number, targetH: number;
  if (maxW / maxH > aspectRatio) {
    targetH = maxH;
    targetW = targetH * aspectRatio;
  } else {
    targetW = maxW;
    targetH = targetW / aspectRatio;
  }

  const startX = rect.left;
  const startY = rect.top;
  const startW = rect.width;
  const startH = rect.height;
  const endX = (vw - targetW) / 2;
  const endY = (vh - targetH) / 2;

  el.style.visibility = "hidden";

  const clone = el.cloneNode(true) as HTMLElement;
  clone.classList.add("lightbox-active");
  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.width = `${startW}px`;
  clone.style.height = `${startH}px`;
  clone.style.display = "";
  clone.style.visibility = "visible";
  clone.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
  clone.style.zIndex = "101";
  clone.style.pointerEvents = "none";
  clone.style.willChange = "transform, width, height";
  clone.style.overflow = "hidden";
  clone.style.borderRadius = "24px";

  // Layer high-res content on top
  if (media.type === "image") {
    clone.innerHTML = `<img src="${media.src}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:24px;opacity:1;">`;
  } else if (media.type === "video") {
    const video = document.createElement("video");
    video.src = media.src;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:24px;z-index:2;opacity:0;transition:opacity 0.3s ease;";
    video.addEventListener("playing", () => {
      video.style.opacity = "1";
    }, { once: true });
    video.addEventListener("error", () => {
      video.remove();
      addFallback(clone, media, channel);
    });
    video.addEventListener("click", (e) => e.stopPropagation());
    clone.innerHTML = "";
    clone.appendChild(video);
  }

  document.body.appendChild(clone);

  const overlay = document.getElementById("lightbox-overlay");
  overlay?.classList.add("active");

  // Build content blocks from post
  const contentEl = buildContentBlocks(media);

  // Update info panel
  const titleEl = document.getElementById("lightbox-title");
  const linkEl = document.getElementById("lightbox-link") as HTMLAnchorElement | null;
  const infoEl = document.getElementById("lightbox-info");

  // Insert content blocks before title in the info panel
  const contentContainer = infoEl?.querySelector(".lightbox-content-blocks");
  if (contentContainer) {
    contentContainer.innerHTML = "";
    if (contentEl) contentContainer.appendChild(contentEl);
  }

  if (titleEl) {
    if (contentEl) {
      // Text blocks already show content; hide title to avoid duplication
      titleEl.style.display = "none";
    } else {
      titleEl.style.display = "";
      titleEl.textContent =
        media.title.length > 120
          ? media.title.substring(0, 120) + "…"
          : media.title;
    }
  }
  if (linkEl) {
    const postUrl = `https://t.me/s/${channel}/${media.postId}`;
    linkEl.href = postUrl;
    linkEl.textContent = formatDate(media.datetime) || "View on Telegram";
  }
  if (infoEl) {
    infoEl.style.top = `${endY + targetH + 16}px`;
  }

  // Copy button visibility
  const copyBtn = document.getElementById("lightbox-copy");
  if (copyBtn) {
    copyBtn.style.display = media.type === "image" ? "" : "none";
    copyBtn.classList.remove("copied");
  }

  // Store for close animation
  state.item = {
    element: el,
    media,
    _startX: startX,
    _startY: startY,
    _startW: startW,
    _startH: startH,
    _endX: endX,
    _endY: endY,
    _endW: targetW,
    _endH: targetH,
  };

  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const baseDuration = 0.45;
  const springDuration = baseDuration + Math.min(distance / 2000, 0.25);
  const springTransition = {
    type: "spring" as const,
    duration: springDuration,
    bounce: 0.15,
  };

  animate(
    clone,
    {
      width: [`${startW}px`, `${targetW}px`],
      height: [`${startH}px`, `${targetH}px`],
      transform: [
        `translate3d(${startX}px, ${startY}px, 0)`,
        `translate3d(${endX}px, ${endY}px, 0)`,
      ],
    },
    springTransition
  ).then(() => {
    state.animating = false;
  });
}

function addFallback(container: HTMLElement, media: MediaItem, channel: string) {
  const playBtn = document.createElement("button");
  playBtn.className = "lightbox-play-btn";
  playBtn.innerHTML = `<span class="play-pill visible"><img src="assets/play-icon.svg" class="play-pill-icon" alt=""><span>Play on Telegram</span></span>`;
  playBtn.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;z-index:2;pointer-events:auto;";
  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.open(`https://t.me/s/${channel}/${media.postId}`, "_blank");
  });
  container.appendChild(playBtn);
}

export function closeLightbox(state: LightboxState) {
  if (!state.open || state.animating || !state.item) return;

  state.animating = true;
  const { element: el } = state.item;

  // Pause video if playing
  const lightboxClone = document.querySelector(".lightbox-active") as HTMLElement | null;
  const video = lightboxClone?.querySelector("video");
  if (video) video.pause();

  const overlay = document.getElementById("lightbox-overlay");
  overlay?.classList.remove("active");

  // Immediately unlock state so mouse/touch drag works
  el.style.visibility = "";
  state.open = false;
  const prevItem = state.item;
  state.item = null;

  const originalRect = el.getBoundingClientRect();
  const endX = originalRect.left;
  const endY = originalRect.top;
  const endW = originalRect.width;
  const endH = originalRect.height;

  const fromX = prevItem._endX;
  const fromY = prevItem._endY;
  const fromW = prevItem._endW;
  const fromH = prevItem._endH;

  const closeTransition = { type: "spring" as const, duration: 0.4, bounce: 0 };

  if (lightboxClone) {
    animate(
      lightboxClone,
      {
        width: [`${fromW}px`, `${endW}px`],
        height: [`${fromH}px`, `${endH}px`],
        transform: [
          `translate3d(${fromX}px, ${fromY}px, 0)`,
          `translate3d(${endX}px, ${endY}px, 0)`,
        ],
      },
      closeTransition
    ).then(() => {
      lightboxClone.remove();
      state.animating = false;
    });
  } else {
    state.animating = false;
  }
}

export async function copyLightboxImage(state: LightboxState) {
  if (!state.item?.media || state.item.media.type !== "image") return;

  const imgUrl = state.item.media.src;
  try {
    const resp = await fetch(imgUrl);
    const blob = await resp.blob();

    const canvas = document.createElement("canvas");
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    URL.revokeObjectURL(img.src);

    const pngBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": pngBlob }),
    ]);

    const copyIcon = document.querySelector(".lightbox-copy-icon");
    const checkIcon = document.querySelector(".lightbox-check-icon");
    const springIn = { type: "spring" as const, duration: 0.2, bounce: 0.25 };
    const springOut = { type: "spring" as const, duration: 0.15, bounce: 0 };

    if (copyIcon) animate(copyIcon as any, { opacity: 0, scale: 0.5 }, springOut);
    if (checkIcon) animate(checkIcon as any, { opacity: 1, scale: 1 }, springIn);

    setTimeout(() => {
      if (checkIcon) animate(checkIcon as any, { opacity: 0, scale: 0.5 }, springOut);
      if (copyIcon) animate(copyIcon as any, { opacity: 1, scale: 1 }, springIn);
    }, 1000);
  } catch (err) {
    console.error("Failed to copy image:", err);
  }
}
