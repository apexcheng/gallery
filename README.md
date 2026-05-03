# Gallery

基于 **GitHub Pages + Decap CMS** 的轻量静态相册。

## 功能

- 静态相册首页
- 图片分类筛选
- 关键词搜索
- 图片详情预览
- Decap CMS 管理后台：`/admin/`
- 图片和数据都存放在 GitHub 仓库中
- 上传原图后，GitHub Actions 自动生成压缩缩略图

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

当前 `admin/config.yml` 已按 GitHub 后端和 Cloudflare Worker OAuth Proxy 配置。

## 添加照片

通过 Decap CMS 后台添加照片时，只需要填写：

```text
标题
分类
图片
描述
日期
是否精选
```

不需要手动上传缩略图。

保存发布后，GitHub Actions 会自动：

```text
读取 data/photos.json
找到没有 thumb 的本地上传图片
生成压缩缩略图到 assets/images/thumbs/
把 thumb 自动回填到 data/photos.json
提交 Generate compressed thumbnails
```

前台卡片会优先使用 `thumb`，详情大图继续使用原图 `image`。

## 内容结构

```text
/data/photos.json              # 相册数据
/assets/images/uploads/        # 原图上传目录
/assets/images/thumbs/         # 自动生成的压缩缩略图
/admin/                        # Decap CMS 管理后台
/scripts/generate_thumbnails.py # 缩略图生成脚本
```

字段示例：

```json
{
  "title": "贵州风景",
  "category": "travel",
  "image": "/gallery/assets/images/uploads/sample.jpg",
  "thumb": "/gallery/assets/images/thumbs/sample.jpg",
  "desc": "旅行照片",
  "date": "2026-04-26",
  "featured": true
}
```
