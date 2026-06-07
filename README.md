# 相册

一个无限平移的瀑布流相册，用于浏览 Telegram 频道中的图片和视频，支持标签筛选。

基于 [twitter-bookmarks-grid](https://github.com/destefanis/twitter-bookmarks-grid) 的前端渲染方案重写，配合 [tg-api](https://github.com/Aleeyoo/tg-api) 后端使用。

## 目录

- [在线体验](#在线体验)
- [部署](#部署)
- [开发](#开发)
- [工作原理](#工作原理)
- [技术栈](#技术栈)
- [相关项目](#相关项目)

## 在线体验

https://photo.aleeyoo.com

## 部署

### 一键部署

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aleeyoo/photo-album)

点击上方按钮，按提示操作即可完成部署。

### CLI 部署

```bash
# 1. 安装依赖并构建
npm install
npm run build

# 2. 登录 Cloudflare（如未登录）
npx wrangler login

# 3. 部署到 Pages
npx wrangler pages deploy dist
```

### 设置环境变量

部署完成后，在 Cloudflare Dashboard → 项目设置 → 环境变量中添加：

| 变量 | 说明 |
|------|------|
| `API_BASE_URL` | [tg-api](https://github.com/Aleeyoo/tg-api) 的部署地址 |

修改变量后无需重新构建，刷新页面即生效。

## 开发

```bash
npm install
npm run dev
```

启动后默认在 `http://localhost:5173` 访问。开发环境通过 `VITE_API_URL` 环境变量指定 API 地址，否则通过 `/api/config` 端点获取。

## 构建

```bash
npm run build
```

静态文件输出到 `dist/` 目录，可直接部署到任何静态托管服务。

## 工作原理

### 瀑布流

- 纯前端数据计算瀑布流布局，不依赖第三方布局库
- 约 500 个 DOM 元素循环使用，实现平滑无限滚动
- 以 Telegram 频道为维度浏览，路径 `/频道名` 或 `/频道名/标签`

### Lightbox

- 点击图片/视频打开 Lightbox 查看大图
- 使用 [Motion](https://motion.dev/) 弹性动画
- 支持图片复制到剪贴板

### 标签筛选

- 右上角标签下拉菜单，数据来自 API
- URL 路径反映当前筛选状态，支持分享

## 技术栈

- **运行时**: TypeScript
- **构建**: Vite
- **动画**: Motion
- **部署**: Cloudflare Pages + Pages Functions
- **后端 API**: [tg-api](https://github.com/Aleeyoo/tg-api)

## 相关项目

- [twitter-bookmarks-grid](https://github.com/destefanis/twitter-bookmarks-grid) — 原始前端项目，本项目的设计参考来源
- [tg-api](https://github.com/Aleeyoo/tg-api) — 后端 API，提供 Telegram 频道数据

## 许可

MIT
