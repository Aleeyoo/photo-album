import type { MediaItem } from "./types";

export const GAP = 18;
export const COLS = 5;
export const POOL_SIZE = 500;
export const BUFFER = 600;

export interface LayoutItem {
  key: string;
  media: MediaItem;
  x: number;
  y: number;
  w: number;
  h: number;
}

export let colWidth = 0;
export let totalWidth = 0;
export let maxColHeight = 0;
export let layoutItems: LayoutItem[] = [];

export function buildMasonryLayout(items: MediaItem[]) {
  const vw = window.innerWidth;
  const gap = GAP;

  colWidth = Math.floor((vw - gap) / COLS);
  // Dynamic columns: fewer items = fewer columns, centered
  const actualCols = Math.min(items.length || 1, COLS);
  totalWidth = colWidth * actualCols;
  const offsetX = (vw - totalWidth) / 2;

  const colHeights = new Array(actualCols).fill(0);
  const columns: {
    media: MediaItem;
    x: number;
    y: number;
    w: number;
    h: number;
  }[][] = Array.from({ length: actualCols }, () => []);

  for (const media of items) {
    let minCol = 0;
    for (let c = 1; c < actualCols; c++) {
      if (colHeights[c] < colHeights[minCol]) minCol = c;
    }

    const aspect = media.width / media.height;
    const itemW = colWidth - gap;
    const itemH = itemW / aspect;

    const x = offsetX + minCol * colWidth + gap / 2;
    const y = colHeights[minCol] + gap / 2;

    columns[minCol].push({ media, x, y, w: itemW, h: itemH });
    colHeights[minCol] += itemH + gap;
  }

  maxColHeight = Math.max(...colHeights);

  layoutItems = [];
  for (let col = 0; col < actualCols; col++) {
    for (let row = 0; row < columns[col].length; row++) {
      const item = columns[col][row];
      layoutItems.push({
        key: `${col}-${row}`,
        ...item,
      });
    }
  }
}
