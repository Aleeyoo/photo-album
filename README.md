# 相册

一个无限平移的瀑布流相册，用于浏览 Telegram 频道的图片和视频，支持标签筛选。

基于 [twitter-bookmarks-grid](https://github.com/destefanis/twitter-bookmarks-grid) 的前端渲染方案重写，配合 [tg-api](https://github.com/Aleeyoo/tg-api) 后端使用。

## 快速开始

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建后静态文件输出到 `dist/` 目录，可直接部署到任何静态托管服务。

## 一键部署到 Cloudflare Pages

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aleeyoo/photo-album)

点击上方按钮，按提示操作即可完成部署。

部署后需在 Cloudflare 项目仪表板中设置环境变量：

| 变量 | 说明 |
|---|---|
| `API_BASE_URL` | tg-api 地址 |

无需重新构建，修改后刷新即生效。

### 手动部署

```bash
npm run build
npm install -g wrangler
wrangler pages deploy dist/
```

部署产物为 `dist/` 目录下的静态文件：`index.html` + CSS + JS。

## 工作原理

- 纯数据计算瀑布流布局，约 500 个 DOM 元素循环使用 — 平滑无限平移
- Lightbox 使用 Motion One 弹性动画，打开时加载完整图片/视频
- 右上角标签下拉筛选，数据来自 API
- 路径参数驱动：`/频道名` 浏览频道，`/频道名/标签` 按标签筛选

## 依赖

- [Motion One](https://motion.dev/) — lightbox 动画
- [Vite](https://vitejs.dev/) — 构建工具
- [tg-api](https://github.com/Aleeyoo/tg-api) — 后端 API

## 项目引用

- 原始前端项目: [twitter-bookmarks-grid](https://github.com/destefanis/twitter-bookmarks-grid)
- 后端 API 项目: [tg-api](https://github.com/Aleeyoo/tg-api)

## 许可

MIT
