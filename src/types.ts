export interface Config {
  apiBaseUrl: string;
  channel: string;
}

export interface Post {
  id: string;
  title: string;
  datetime: string;
  blocks: Block[];
  tags: string[];
  reactions: any[];
}

export type Block =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | ReplyBlock
  | LinkPreviewBlock;

export interface TextBlock {
  id: string;
  type: "text";
  html: string;
  plain: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  src: string;
  proxy: string;
  width: number;
  height: number;
}

export interface VideoBlock {
  id: string;
  type: "video";
  src: string;
  proxy: string;
  width: number;
  height: number;
  isRound: boolean;
}

export interface ReplyBlock {
  id: string;
  type: "reply";
  postId: string;
  text: string;
}

export interface LinkPreviewBlock {
  id: string;
  type: "link_preview";
  url: string;
  title: string;
  description: string;
  siteName: string;
}

export interface MediaItem {
  type: "image" | "video";
  src: string;
  width: number;
  height: number;
  title: string;
  tags: string[];
  datetime: string;
  postId: string;
  blockId: string;
  isRound: boolean;
}
