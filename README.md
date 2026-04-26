# Gallery

基于 **GitHub Pages + Decap CMS** 的轻量静态相册。

## 功能

- 静态相册首页
- 图片分类筛选
- 关键词搜索
- 图片详情预览
- Decap CMS 管理后台：`/admin/`
- 图片和数据都存放在 GitHub 仓库中

## 推荐 GitHub Pages 设置

进入仓库：

```text
Settings → Pages → Build and deployment
```

设置为：

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

保存后访问：

```text
https://apexcheng.github.io/gallery/
```

## 管理后台

后台地址：

```text
https://apexcheng.github.io/gallery/admin/
```

注意：Decap CMS 使用 GitHub 后端时，需要 OAuth 鉴权服务。GitHub Pages 本身只能托管静态文件，不能直接提供 OAuth 服务。

推荐二选一：

1. 使用 Netlify Identity + Git Gateway 只做后台鉴权，前台仍然放 GitHub Pages。
2. 自建 Decap GitHub OAuth Proxy，例如 Cloudflare Worker / Vercel / Netlify Function。

当前 `admin/config.yml` 已按 GitHub 后端预配置，如使用 OAuth Proxy，需要补充：

```yml
backend:
  name: github
  repo: apexcheng/gallery
  branch: main
  base_url: https://你的-oauth-proxy域名
  auth_endpoint: auth
```

## 内容结构

```text
/data/photos.json       # 相册数据
/assets/images/         # 图片目录
/admin/                 # Decap CMS 管理后台
```

## 添加照片

通过 Decap CMS 后台添加，或手动编辑：

```text
data/photos.json
```

字段示例：

```json
{
  "title": "贵州风景",
  "category": "travel",
  "image": "/gallery/assets/images/sample-1.jpg",
  "thumb": "/gallery/assets/images/sample-1.jpg",
  "desc": "旅行照片",
  "date": "2026-04-26",
  "featured": true
}
```
