# 站点信息架构改造方案 v2.0
# 适用于 ciallo0721-cmd.top — 纯静态站 / GitHub Pages

生成时间：2026-06-15
作者：塔菲（永雏塔菲_bot）

---

## 目录

1. [现状分析](#1-现状分析)
2. [新信息架构设计](#2-新信息架构设计)
3. [URL 迁移映射表](#3-url-迁移映射表)
4. [旧链接兼容方案（Redirect）](#4-旧链接兼容方案redirect)
5. [GA4 埋点统一设计](#5-ga4-埋点统一设计)
6. [SEO & URL 规范修复](#6-seo--url-规范修复)
7. [实施步骤建议](#7-实施步骤建议)

---

## 1. 现状分析

### 当前目录结构（精简版）

```
/
├── index.html              ← 首页
├── wz.html                 ← 文章列表（旧）
├── 1.html ~ 10.html        ← 根目录文章（旧，应并入 /blog/）
├── blog/
│   ├── index.html          ← 文章列表（新）
│   ├── 1/ ~ 23/            ← 博客文章
│   ├── manga-1/
│   ├── pdf-1/
│   └── video-1/            ← ⚠️ 实验页面，混在 blog/ 里
├── moeface/                ← 🟩 应用（AI人脸识别）
├── mood-tracker/           ← 🟩 应用（情绪追踪）
├── tools/                  ← 🟩 工具集（4个工具）
│   ├── anime-color-analyzer/
│   ├── renpy-template-generator/
│   ├── vtuber-name-generator/
│   └── vtuber-personality-test/
├── wiki/                   ← 🟦 百科（可归为 blog 或独立）
├── 91/ bjqy/ fors/ LAIDB/ zmdspp/  ← 🟩 Ren'Py 游戏应用
├── arg/ cs2/ dkdfj/        ← 🟨 实验页面
├── vid/                    ← 🟨 视频实验
├── linjiayi/               ← 🟦 个人页面（可归为 blog）
└── wz/                     ← ⚠️ 空目录（与 wz.html 冲突）
```

### 核心问题总结

| 问题 | 说明 |
|------|------|
| URL 不统一 | `/wz` `/wz/` `/blog/` 混用；根目录还有 `1.html` 等旧文章 |
| GA4 无法区分类型 | 所有页面都是 `page_view`，无法区分文章/应用/实验 |
| 应用页被误分析 | `moeface/` 等应用页应走事件埋点，不应走普通 PV |
| SEO 重复路径风险 | `/wz` 和 `/wz/` 可能被当成两个 URL |
| 无统一 IA | 新增页面时不知道放哪个目录 |

---

## 2. 新信息架构设计

### 设计原则

1. **按内容类型分层**：博客 / 应用 / 实验 三大类
2. **GitHub Pages 友好**：不使用任何服务端功能
3. **可扩展**：未来新增应用 / 实验，直接放对应目录
4. **旧链接全兼容**：所有旧 URL 都有 redirect 兜底

### 新目录结构

```
/
├── index.html                  ← 首页（内容类型：landing）
│
├── blog/                       ← 🟦 博客内容（所有文章集中）
│   ├── index.html              ← 文章列表页
│   ├── 1/ ... 23/              ← 原有博客文章
│   ├── manga-1/
│   ├── pdf-1/
│   ├── linjiayi/               ← 从根目录移入
│   └── [未来文章]/
│
├── app/                        ← 🟩 应用类页面（核心新增）
│   ├── index.html              ← 应用列表/入口页（可选）
│   ├── moeface/                ← 从 /moeface/ 移入
│   ├── mood-tracker/           ← 从 /mood-tracker/ 移入
│   ├── 91/                     ← Ren'Py 游戏统一归入 app/games/
│   ├── bjqy/
│   ├── fors/
│   ├── LAIDB/
│   ├── zmdspp/
│   └── tools/                  ← 从 /tools/ 移入（或保持独立）
│       ├── index.html
│       ├── anime-color-analyzer/
│       ├── renpy-template-generator/
│       ├── vtuber-name-generator/
│       └── vtuber-personality-test/
│
├── exp/                        ← 🟨 实验页面（核心新增）
│   ├── index.html              ← 实验列表页（可选）
│   ├── video-1/                ← 从 /blog/video-1/ 移入
│   ├── arg/
│   ├── cs2/
│   ├── dkdfj/
│   └── vid/
│
├── wiki/                       ← 🟦 百科（可独立，或归为 blog 子目录）
│   └── ...
│
├── pages/                      ← 🟦 站点功能页面（关于/隐私/状态等）
│   ├── aboutme.html            ← 从根目录移入
│   ├── privacy.html
│   ├── privacy-policy.html
│   ├── user-agreement.html
│   ├── status.html
│   ├── friends.html
│   ├── help.html
│   ├── access-denied.html
│   └── 404.html 等错误页
│
├── redirect/                   ← 🔁 旧链接跳转页（纯 HTML）
│   ├── wz.html                 ← 跳转到 /blog/
│   ├── 1.html ... 10.html      ← 跳转到 /blog/1/ 等
│   └── [按旧路径存放的 HTML 跳转页]
│
├── assets/                     ← 静态资源（可选，整理用）
│   ├── css/
│   ├── js/
│   ├── images/
│   └── fanv.ico
│
├── sitemap.xml
├── robots.txt
└── articles-data.js            ← 保留在根目录（blog/ 里引用）
```

### 内容类型定义

| 类型 | 值 | 说明 | 示例 |
|------|-----|------|------|
| 博客 | `blog` | 文章、百科、个人页面 | `/blog/23/`, `/wiki/renpy/` |
| 应用 | `app` | 功能性页面，有用户交互 | `/app/moeface/`, `/app/mood-tracker/` |
| 实验 | `experiment` | 测试性页面，不稳定 | `/exp/video-1/`, `/exp/cs2/` |
| 落地页 | `landing` | 首页、导航页 | `/index.html`, `/app/index.html` |
| 系统页 | `system` | 错误页、隐私页等 | `/pages/404.html` |

---

## 3. URL 迁移映射表

### 3.1 博客类（→ /blog/）

| 旧 URL | 新 URL | 备注 |
|--------|--------|------|
| `/wz.html` | `/blog/` | 文章列表页 |
| `/wz/` | `/blog/` | 目录（需 redirect） |
| `/1.html` ... `/10.html` | `/blog/1/` ... `/blog/10/` | 根目录旧文章 |
| `/linjiayi/` | `/blog/linjiayi/` | 个人页面归入博客 |
| `/blog/video-1/` | `/exp/video-1/` | ⚠️ 从 blog 移到 exp |

### 3.2 应用类（→ /app/）

| 旧 URL | 新 URL | 备注 |
|--------|--------|------|
| `/moeface/` | `/app/moeface/` | AI 应用 |
| `/mood-tracker/` | `/app/mood-tracker/` | 情绪追踪 |
| `/tools/` | `/app/tools/` | 工具集（或保持独立） |
| `/91/` | `/app/games/91/` | Ren'Py 游戏统一放 app/games/ |
| `/bjqy/` | `/app/games/bjqy/` | 同上 |
| `/fors/` | `/app/games/fors/` | 同上 |
| `/LAIDB/` | `/app/games/LAIDB/` | 同上 |
| `/zmdspp/` | `/app/games/zmdspp/` | 同上 |

### 3.3 实验类（→ /exp/）

| 旧 URL | 新 URL | 备注 |
|--------|--------|------|
| `/blog/video-1/` | `/exp/video-1/` | 流媒体实验 |
| `/arg/` | `/exp/arg/` | ARG 实验 |
| `/cs2/` | `/exp/cs2/` | CS2 相关实验 |
| `/dkdfj/` | `/exp/dkdfj/` | Unity 实验 |
| `/vid/` | `/exp/vid/` | 视频实验 |

### 3.4 系统页（→ /pages/）

| 旧 URL | 新 URL | 备注 |
|--------|--------|------|
| `/aboutme.html` | `/pages/aboutme.html` | 关于我 |
| `/privacy.html` | `/pages/privacy.html` | 隐私政策 |
| `/privacy-policy.html` | `/pages/privacy-policy.html` | 隐私政策（旧版） |
| `/user-agreement.html` | `/pages/user-agreement.html` | 用户协议 |
| `/status.html` | `/pages/status.html` | 状态页 |
| `/friends.html` | `/pages/friends.html` | 友链 |
| `/help.html` | `/pages/help.html` | 帮助中心 |
| `/access-denied.html` | `/pages/access-denied.html` | 访问拒绝 |
| `/404.html` 等 | `/pages/404.html` | 错误页统一放 pages/ |

### 3.5 注意事项

- `/wz/` 目录当前为空，但存在──GitHub Pages 会将其视为有效路径
- 如果保留 `/wz/` 作为 `blog/` 的别名，需要在 `/wz/index.html` 里加 canonical 指向 `/blog/`
- **推荐做法**：不保留别名，全部 redirect 到规范 URL

---

## 4. 旧链接兼容方案（Redirect）

由于 GitHub Pages 不支持 301/302 服务端跳转，只能用**客户端跳转**。

### 4.1 方案 A：HTML meta refresh（推荐）

适用场景：页面已被搜索引擎收录，需要 SEO 友好的跳转

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/blog/">
    <link rel="canonical" href="https://ciallo0721-cmd.top/blog/">
    <title>页面已迁移 - ciallo0721-cmd</title>
</head>
<body>
    <p>页面已迁移到 <a href="/blog/">https://ciallo0721-cmd.top/blog/</a></p>
    <script>window.location.replace("/blog/");</script>
</body>
</html>
```

**优点**：
- `<meta refresh>` 能被搜索引擎识别为迁移
- `<link canonical>` 帮助搜索引擎更新索引
- JS 兜底确保用户能跳转

**缺点**：
- 需要为每个旧 URL 创建一个 HTML 文件
- 会增加仓库文件数量

### 4.2 方案 B：JS 跳转 + 历史记录清理

适用场景：快速迁移，不 care SEO 跳转

```html
<!DOCTYPE html>
<html>
<head>
    <script>
        (function() {
            var redirects = {
                '/wz.html':           '/blog/',
                '/wz/':               '/blog/',
                '/1.html':            '/blog/1/',
                '/moeface/':          '/app/moeface/',
                '/mood-tracker/':     '/app/mood-tracker/',
                '/blog/video-1/':     '/exp/video-1/',
            };
            var path = window.location.pathname;
            if (redirects[path]) {
                window.location.replace(redirects[path]);
            }
        })();
    </script>
</head>
<body>
    <p>正在跳转...</p>
</body>
</html>
```

### 4.3 推荐实施方案

**混合方案**：

1. **根目录旧文章**（`1.html` ~ `10.html`）：用方案 A，每个文件保留为纯跳转页
2. **目录迁移**（`/moeface/` → `/app/moeface/`）：在旧目录放置 `index.html` 跳转页
3. **`/wz.html`**：跳转到 `/blog/`，并保留 `wz.html` 的 `<link canonical>` 指向新地址

### 4.4 跳转页文件放置规则

```
# 示例：/moeface/ 迁移到 /app/moeface/

旧路径：/moeface/index.html
操作：
  1. 在原位置创建新 index.html，内容为跳转页（方案A）
  2. 新位置 /app/moeface/index.html 为实际页面

文件内容（/moeface/index.html）：
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/app/moeface/">
    <link rel="canonical" href="https://ciallo0721-cmd.top/app/moeface/">
    <title>页面已迁移</title>
</head>
<body>
    <p>页面已迁移到 <a href="/app/moeface/">/app/moeface/</a></p>
    <script>window.location.replace("/app/moeface/");</script>
</body>
</html>
```

---

## 5. GA4 埋点统一设计

### 5.1 核心设计思路

- 每个页面引入一个统一的 `gtag-config.js`
- 每个页面定义 `window.pageMeta`（内容类型 + 页面名）
- 页面加载时自动发送 `page_view` 事件（带内容类型维度）
- 应用页面额外发送应用事件（`app_start` / `app_success` / `app_error`）

### 5.2 统一 GA4 配置模块

保存为 `assets/js/gtag-config.js`（或直接内联到每个页面）：

```javascript
/**
 * GA4 统一埋点模块
 * 适用于纯静态站，无依赖
 * 
 * 使用方式：
 * 1. 在 <head> 里引入 GA4 gtag 脚本（官方Snippet）
 * 2. 在页面里定义 window.pageMeta
 * 3. 引入本文件
 */

(function() {
    'use strict';

    // ========== 默认值 ==========
    var DEFAULT_CONTENT_TYPE = 'unknown';
    var DEFAULT_PAGE_NAME = 'untitled';

    // ========== 获取页面元信息 ==========
    function getPageMeta() {
        var meta = window.pageMeta || {};
        return {
            content_type: meta.content_type || DEFAULT_CONTENT_TYPE,
            page_name:    meta.page_name    || (window.location.pathname + window.location.search),
            category:     meta.category     || ''
        };
    }

    // ========== 发送 page_view 事件 ==========
    function trackPageView() {
        if (typeof gtag !== 'function') return;

        var meta = getPageMeta();
        gtag('event', 'page_view', {
            content_type: meta.content_type,
            page_name:    meta.page_name,
            category:     meta.category,
            page_path:    window.location.pathname + window.location.search,
            page_title:   document.title
        });
    }

    // ========== 应用事件追踪 ==========
    // 应用页面调用：trackAppEvent('app_start', {...})
    window.trackAppEvent = function(eventName, params) {
        if (typeof gtag !== 'function') return;
        var meta = getPageMeta();
        var eventParams = params || {};
        eventParams.content_type = meta.content_type;
        eventParams.page_name    = meta.page_name;
        gtag('event', eventName, eventParams);
    };

    // ========== 自动追踪应用页面生命周期 ==========
    function autoTrackApp() {
        var meta = getPageMeta();
        if (meta.content_type !== 'app') return;

        // 页面加载 → app_start
        trackAppEvent('app_start');

        // 页面报错 → app_error
        window.addEventListener('error', function(e) {
            trackAppEvent('app_error', {
                error_message: e.message || '',
                error_source:  e.filename || ''
            });
        });

        // 页面成功运行 5 秒后 → app_success（简单心跳）
        setTimeout(function() {
            trackAppEvent('app_success', { duration: 5 });
        }, 5000);
    }

    // ========== 初始化 ==========
    // DOM Ready 后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            trackPageView();
            autoTrackApp();
        });
    } else {
        trackPageView();
        autoTrackApp();
    }

})();
```

### 5.3 页面配置示例

#### 博客文章页面（`/blog/23/index.html`）

```html
<script>
window.pageMeta = {
    content_type: 'blog',
    page_name: 'blog-post-23',
    category: '技术'
};
</script>
<!-- 然后引入 gtag 官方 snippet + assets/js/gtag-config.js -->
```

#### 应用页面（`/app/moeface/index.html`）

```html
<script>
window.pageMeta = {
    content_type: 'app',
    page_name: 'moeface',
    category: 'AI'
};
</script>
```

在应用逻辑里额外发送事件：

```javascript
// 用户点击"开始识别"
trackAppEvent('app_action', { action: 'start_recognition' });

// 识别成功
trackAppEvent('app_success', { result: 'face_detected' });

// 识别失败
trackAppEvent('app_error', { error_code: 'NO_FACE_FOUND' });
```

#### 实验页面（`/exp/video-1/index.html`）

```html
<script>
window.pageMeta = {
    content_type: 'experiment',
    page_name: 'video-1-hls-test',
    category: '流媒体'
};
</script>
```

### 5.4 GA4 后台配置建议

在 GA4 后台设置**自定义维度**，以便分析：

| 维度名称 | 事件参数 | 范围 |
|---------|---------|------|
| 内容类型 | `content_type` | 事件 |
| 页面名称 | `page_name` | 事件 |
| 分类 | `category` | 事件 |

这样可以在 GA4 报告里按 `content_type` 分组查看：
- `blog` → 博客文章 PV
- `app` → 应用页面 PV + 事件
- `experiment` → 实验页面 PV

---

## 6. SEO & URL 规范修复

### 6.1 URL 规范建议

**推荐方案：强制 trailing slash（目录形式）**

原因：
- GitHub Pages 对目录的默认文件是 `index.html`，URL 更干净
- `/blog/` 比 `/blog.html` 更直观
- 避免 `/wz` 和 `/wz/` 被视为两个 URL

**规范写法**：
```
✅ 推荐：https://ciallo0721-cmd.top/blog/
❌ 避免：https://ciallo0721-cmd.top/blog
❌ 避免：https://ciallo0721-cmd.top/wz.html
```

### 6.2 Canonical URL 模板

每个页面必须在 `<head>` 里加 canonical：

```html
<link rel="canonical" href="https://ciallo0721-cmd.top/[规范路径]">
```

#### 博客文章示例

```html
<link rel="canonical" href="https://ciallo0721-cmd.top/blog/23/">
```

#### 应用页面示例

```html
<link rel="canonical" href="https://ciallo0721-cmd.top/app/moeface/">
```

#### 首页示例

```html
<link rel="canonical" href="https://ciallo0721-cmd.top/">
```

### 6.3 防止重复收录

1. **robots.txt 规范**：

```txt
# robots.txt
User-agent: *
Allow: /

# 禁止爬虫抓取旧路径的跳转页
Disallow: /redirect/
# 如果保留旧路径跳转页在原始位置，则：
Disallow: /wz.html
# 但更好的做法是：让跳转页返回 200，但 canonical 指向新地址
```

2. **sitemap.xml 只列规范 URL**：

```xml
<url>
    <loc>https://ciallo0721-cmd.top/blog/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
</url>
<!-- 不要列 /wz.html 或 /wz/ -->
```

3. **跳转页处理**：
   - 跳转页本身不被 sitemap 收录
   - 跳转页有 canonical 指向新地址
   - 跳转页用 `<meta refresh>` 帮助搜索引擎理解迁移

### 6.4 处理 `/wz` vs `/wz/` 冲突

**问题**：GitHub Pages 会自动将 `/wz` 重定向到 `/wz/`（如果 `wz/` 目录存在），但：
- 这个重定向是 301（服务端），搜索引擎可能已经收录了 `/wz`
- 如果 `wz/` 目录不存在，但 `wz.html` 存在，GitHub Pages 会提供 `/wz.html` 的内容在 `/wz` 路径

**解决方案**：

1. 确保规范 URL 是 `/blog/`（trailing slash）
2. 在 `/wz.html` 里加 canonical 指向 `/blog/`
3. 如果 `wz/` 目录存在，在其 `index.html` 里加 canonical 指向 `/blog/`

```html
<!-- /wz/index.html 或 /wz.html -->
<link rel="canonical" href="https://ciallo0721-cmd.top/blog/">
<meta http-equiv="refresh" content="0; url=/blog/">
```

---

## 7. 实施步骤建议

### 阶段一：准备（不修改用户可见内容）

1. 创建 `assets/js/gtag-config.js`（GA4 统一模块）
2. 创建 `SITE-REARCH-PLAN.md`（本文件）
3. 在测试分支验证 GA4 模块正常工作

### 阶段二：GA4 埋点（不影响 URL 结构）

4. 为所有页面添加 `window.pageMeta` 定义
5. 引入 `gtag-config.js`
6. 在 GA4 后台验证事件正常上报

### 阶段三：创建新目录结构（并行进行）

7. 创建 `/app/` `/exp/` `/pages/` 目录
8. 将文件**复制**到新位置（先不删除旧文件）
9. 验证新 URL 能正常访问

### 阶段四：添加 Redirect（兼容旧链接）

10. 在旧位置创建跳转页（`index.html` 或 `.html` 文件）
11. 跳转页包含：`<meta refresh>` + `<link canonical>` + JS 跳转
12. 验证旧 URL 能正确跳转到新 URL

### 阶段五：更新 sitemap.xml 和 robots.txt

13. `sitemap.xml` 只列新规范 URL
14. `robots.txt` 允许所有规范路径

### 阶段六：清理（可选，建议等待 1-2 个月）

15. 确认 GA4 数据显示正常（旧 URL 的 PV 逐渐下降到 0）
16. 确认搜索引擎已更新索引（用 `site:ciallo0721-cmd.top/wz` 检查）
17. 删除旧目录（或直接保留跳转页，长期有效）

---

## 附录 A：完整 GA4 引入示例

### 博客文章页面 head 示例

```html
<head>
    <meta charset="UTF-8">
    <title>文章标题 - ciallo0721-cmd</title>
    <link rel="canonical" href="https://ciallo0721-cmd.top/blog/23/">
    
    <!-- pageMeta 定义（必须在 gtag 之前） -->
    <script>
    window.pageMeta = {
        content_type: 'blog',
        page_name: 'blog-post-23',
        category: '技术'
    };
    </script>
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXX');
    </script>
    
    <!-- 统一 GA4 埋点模块 -->
    <script src="/assets/js/gtag-config.js"></script>
    
    <!-- 其他 head 内容... -->
</head>
```

### 应用页面 head 示例

```html
<head>
    <meta charset="UTF-8">
    <title>MoeFace - AI 人脸识别</title>
    <link rel="canonical" href="https://ciallo0721-cmd.top/app/moeface/">
    
    <script>
    window.pageMeta = {
        content_type: 'app',
        page_name: 'moeface',
        category: 'AI'
    };
    </script>
    
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXX');
    </script>
    <script src="/assets/js/gtag-config.js"></script>
</head>
<body>
    <!-- 应用逻辑 -->
    <script>
    // 示例：追踪应用内事件
    document.getElementById('startBtn').addEventListener('click', function() {
        trackAppEvent('app_action', { action: 'start_recognition' });
    });
    </script>
</body>
```

---

## 附录 B：Redirect 页模板（可复用）

保存为 `redirect-template.html`，每次用时替换 `{{NEW_URL}}`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url={{NEW_URL}}">
    <link rel="canonical" href="https://ciallo0721-cmd.top{{NEW_URL}}">
    <title>页面已迁移 - ciallo0721-cmd</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; }
        a { color: #0066cc; }
    </style>
</head>
<body>
    <h1>页面已迁移 🐱</h1>
    <p>正在跳转到新地址...</p>
    <p>如果没有自动跳转，请点击：
        <a href="{{NEW_URL}}">https://ciallo0721-cmd.top{{NEW_URL}}</a>
    </p>
    <script>
        window.location.replace("{{NEW_URL}}");
    </script>
</body>
</html>
```

---

*方案结束。如需实施某一步骤，请告知喵～*
