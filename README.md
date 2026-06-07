# 相册

一个无限平移的瀑布流相册，用于浏览 Telegram 频道的图片和视频，支持标签筛选。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 配置

创建 `.env` 文件（参考 `.env.example`）：

```
VITE_API_URL=https://your-api.workers.dev
VITE_CHANNEL=channel-name
```

## 部署

```bash
npm run build
wrangler pages deploy dist/
```

在 Cloudflare Pages 仪表板中设置 `API_BASE_URL` 和 `CHANNEL` 环境变量，无需重新构建。

## 工作原理

- 纯数据计算瀑布流布局，约 500 个 DOM 元素循环使用 — 平滑无限平移
- Lightbox 使用 Motion One 弹性动画，打开时加载完整图片/视频
- 右上角标签下拉筛选，数据来自 API

## 依赖

- [Motion One](https://motion.dev/) — lightbox 动画
- [Vite](https://vitejs.dev/) — 构建工具

## 许可

MIT
