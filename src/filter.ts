import type { MediaItem } from "./types";
import { buildMasonryLayout } from "./masonry";
import { activeMap, createPool, releaseElement } from "./pool";
import { renderVisibleItems, ViewState } from "./renderer";

export function createFilter(
  tags: string[],
  allItems: MediaItem[],
  setItems: (items: MediaItem[]) => void,
  view: ViewState,
  grid: HTMLElement,
  initialTag?: string
) {
  let activeTag = initialTag ?? "All";
  let isTransitioning = false;

  // Create pill
  const pill = document.createElement("div");
  pill.id = "folder-pill";
  pill.className = "folder-pill";
  pill.innerHTML = `<span id="folder-pill-label">${activeTag}</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="3,4.5 6,7.5 9,4.5"/></svg>`;
  document.body.appendChild(pill);

  // Create dropdown
  const dropdown = document.createElement("div");
  dropdown.id = "folder-dropdown";
  dropdown.className = "folder-dropdown";
  document.body.appendChild(dropdown);

  function buildDropdown() {
    dropdown.innerHTML = "";
    const options = ["All", ...tags];
    for (const name of options) {
      const item = document.createElement("button");
      item.className =
        "folder-dropdown-item" + (name === activeTag ? " active" : "");
      item.textContent = name;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        applyFilter(name);
        dropdown.classList.remove("open");
      });
      dropdown.appendChild(item);
    }
  }

  pill.addEventListener("click", (e) => {
    e.stopPropagation();
    buildDropdown();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
  });

  // If initial tag set, apply filter immediately
  if (initialTag && tags.includes(initialTag)) {
    setTimeout(() => {
      applyFilter(initialTag);
    }, 50);
  }

  function applyFilter(tag: string) {
    if (isTransitioning || tag === activeTag) return;
    isTransitioning = true;
    activeTag = tag;

    const label = document.getElementById("folder-pill-label");
    if (label) label.textContent = tag;

    // Update URL
    const channel = location.pathname.split("/").filter(Boolean)[0];
    const newPath = tag === "All" ? `/${channel}` : `/${channel}/${encodeURIComponent(tag)}`;
    history.pushState(null, "", newPath);

    // Animate out
    grid.style.transition = "opacity 0.2s ease";
    grid.style.opacity = "0";

    setTimeout(() => {
      const filtered =
        tag === "All"
          ? allItems
          : allItems.filter((m) => m.tags.includes(tag));

      setItems(filtered);

      view.cameraOffset.x = 0;
      view.cameraOffset.y = 0;
      view.targetOffset.x = 0;
      view.targetOffset.y = 0;

      for (const [, entry] of activeMap) {
        releaseElement(entry.poolEl);
      }
      activeMap.clear();

      buildMasonryLayout(filtered);
      createPool(grid);
      renderVisibleItems(view);

      void grid.offsetHeight;
      grid.style.transition = "opacity 0.3s ease";
      grid.style.opacity = "1";

      setTimeout(() => {
        grid.style.transition = "";
        isTransitioning = false;
      }, 300);
    }, 250);
  }
}
