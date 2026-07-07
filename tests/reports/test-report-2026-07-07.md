# 🧪 ciallo0721-cmd.top 测试报告

> **测试日期**: 2026-07-07  
> **测试人员**: 端测测 (Web 应用测试专家)  
> **测试范围**: 静态分析 + 结构验证 + 代码质量审查  
> **限制说明**: C 盘空间不足导致 Playwright/agent-browser 无法启动，E2E 自动化测试暂未执行  
> **测试环境**: Python http.server @ 127.0.0.1:8080

---

## 📊 总体评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **HTML 结构** | 🟢 85/100 | DOCTYPE/lang/title 完整，2 个文件缺 DOCTYPE |
| **SEO 优化** | 🟢 90/100 | Schema.org + OG + sitemap + robots.txt 完善 |
| **安全配置** | 🟢 88/100 | CSP/Headers 完善，外链缺少 rel 属性 |
| **可访问性** | 🟡 65/100 | 无 aria 属性，px 字体 63 处，无 alt 文本检测 |
| **代码质量** | 🟡 68/100 | 108 个内联 style，42 处 !important，22 个 console.log |
| **性能基础** | 🟡 72/100 | 首页 170KB 较大，2 个外部 CSS 阻塞渲染 |
| **资源优化** | 🟡 70/100 | Ren'Py wasm 文件偏大，图片可进一步优化 |

> **综合评分: 🟡 76/100 — 中等偏上，有明确的优化空间**

---

## ✅ 通过项 (PASS)

### 1. HTML 基础结构
- ✅ `<!DOCTYPE html>` — 首页 + 主页面均有
- ✅ `<html lang="zh-CN">` — 所有页面正确声明
- ✅ `<meta charset="UTF-8">` — 字符编码正确
- ✅ `<meta name="viewport">` — 移动端适配声明存在
- ✅ `<title>` 标签 — 所有页面均有且语义化
- ✅ 标题层级: h1(2) → h2(19) → h3(19) — 层级合理

### 2. SEO 优化
- ✅ Meta description + keywords 完善
- ✅ Open Graph (og:title/description/image) 完整
- ✅ Twitter Card 标签存在
- ✅ JSON-LD Schema.org 结构化数据
- ✅ robots.txt — 配置合理，含主流搜索引擎
- ✅ sitemap.xml 存在
- ✅ CNAME 指向 `ciallo0721-cmd.top`
- ✅ `<noscript>` SEO 降级内容 (1 个)
- ✅ Canonical URL 声明

### 3. 安全配置
- ✅ `X-Frame-Options: SAMEORIGIN` (防点击劫持)
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy` (禁用 camera/mic/geolocation/payment)
- ✅ CSP — 配置详细注释，平衡 SEO 与安全
- ✅ Cache-Control 策略完善 (HTML 不缓存，静态资源长缓存)
- ✅ 无 `eval()` / `document.write()` 使用
- ✅ 无 `debugger` 语句
- ✅ 无重复 ID (HTML 校验通过)

### 4. 子页面覆盖
- ✅ `/aboutme.html` — 赛博朋克风格，CSS 变量精美
- ✅ `/friends.html` — 友情链接页
- ✅ `/404.html` — 自定义 404 (517 行，内容完整)
- ✅ `/admin/` — 管理后台
- ✅ `/blog/` — 博客首页
- ✅ `/status.html` — 网站状态监控 (601 行)
- ✅ `/privacy.html` + `/user-agreement.html` — 法律页面完整
- ✅ 子域名路由: `_subdomain-router.js` + `_worker_cf.js`

### 5. CI/CD
- ✅ 12 个 GitHub Actions 工作流 (部署/监控/SEO/安全)
- ✅ link-checker 死链检测自动化
- ✅ image-optimize 图片优化自动化

---

## ⚠️ 需关注项 (WARNING)

| # | 问题 | 位置 | 严重度 | 建议 |
|---|------|------|--------|------|
| 1 | **34 个外链缺少 `rel="noopener noreferrer"`** | index.html `target="_blank"` 链接 | 🔴 高 | 加 `rel="noopener noreferrer"` 防 tab-napping 攻击 |
| 2 | **22 个 `console.log` 遗留** | index.html 生产代码 | 🟡 中 | 生产环境应移除或用条件编译包裹 |
| 3 | **63 处 `font-size` 使用 px** | index.html CSS | 🟡 中 | 改用 rem/em 以支持用户字体缩放 (WCAG 1.4.4) |
| 4 | **42 处 `!important`** | index.html CSS | 🟡 中 | 说明 CSS 特异性管理有问题，建议重构 |
| 5 | **108 个内联 `style=""` 属性** | index.html HTML | 🟡 中 | 移至 CSS 类，提高可维护性 |
| 6 | **0 个 aria 属性** | index.html 全页 | 🟡 中 | 屏幕阅读器用户无法获取语义信息 |
| 7 | **首页 170KB (单文件)** | index.html | 🟡 中 | 超过 1500 行内联 CSS + 1500 行内联 JS，建议拆分 |
| 8 | **2 个外部 CSS 阻塞渲染** | CodeMirror CSS (cdnjs) | 🟡 中 | 考虑异步加载或按需加载 |
| 9 | **Ren'Py wasm 文件 ~20MB** | app/games/*/renpy.wasm | 🟡 中 | 建议首次访问时显示加载进度条 |

---

## ❌ 需修复项 (FAIL)

| # | 问题 | 文件 | 修复方式 |
|---|------|------|----------|
| 1 | **缺少 `<!DOCTYPE html>`** | `./work/index.html` | 在第一行添加 `<!DOCTYPE html>` |
| 2 | **缺少 `<!DOCTYPE html>`** | `./zmdspp/indexzm.html` | 在第一行添加 `<!DOCTYPE html>` |

---

## 🔍 详细发现

### 首页结构分析

```
文件大小:  174,307 bytes (170 KB)
总行数:    2,155 行
内联 CSS:  ~1,453 行 (67%)
内联 JS:   ~1,539 行 (71%)
外部脚本:  13 个 (CodeMirror + Turnstile + GA + 自定义)
内部链接:  51 个
图片标签:  0 (可能全用 CSS background)
iframe:    0
表单元素:  0 (博客类站点合理)
```

### 大文件清单 (>500KB)

| 文件 | 大小 | 类型 |
|------|------|------|
| renpy.wasm (多处) | ~21 MB | WebAssembly 游戏引擎 |
| renpy.data (多处) | ~15 MB | 游戏数据 |
| web-presplash.jpg (多处) | ~1.1 MB | 游戏封面图 |
| caiguan.png | 1.86 MB | 游戏素材 |
| jdwm.png | 1.47 MB | 游戏素材 |
| jiudian.png | 1.63 MB | 游戏素材 |
| ktv.png | 1.87 MB | 游戏素材 |

### 外部依赖

| 资源 | 用途 | 风险 |
|------|------|------|
| cdnjs.cloudflare.com | CodeMirror 编辑器 | CDN 可用性依赖 |
| challenges.cloudflare.com | Turnstile 验证 | 第三方依赖 |
| googletagmanager.com | Google Analytics | 第三方追踪 |

---

## 📋 可访问性 (A11y) 审查

### WCAG 2.1 关键问题

| 准则 | 要求 | 状态 | 说明 |
|------|------|------|------|
| 1.1.1 非文本内容 | 图片需有 alt | ⚠️ | 无 img 标签故无法检测；aboutme.html 图片无 alt |
| 1.3.1 信息和关系 | 使用语义化 HTML | ✅ | nav/header/footer/main 标签均使用 |
| 1.4.3 对比度 | 文本对比度 ≥ 4.5:1 | ❓ | 静态分析无法检测，需可视化工具 |
| 1.4.4 文本缩放 | 字体可用 rem/em | ⚠️ | 63 处 px 字体，用户无法缩放 |
| 2.1.1 键盘 | 所有功能可键盘操作 | ❓ | 需手动测试 |
| 2.4.1 跳过块 | 提供跳过导航链接 | ❌ | 无 skip-to-content 链接 |
| 3.1.1 页面语言 | lang 属性 | ✅ | zh-CN 正确声明 |
| 4.1.1 解析 | 无重复 ID | ✅ | 通过 |
| 4.1.2 名称/角色/值 | ARIA 属性 | ❌ | 0 个 aria 属性 |

---

## 🚀 性能优化建议

### 高优先级

1. **拆分 CSS/JS**: 将 1453 行内联 CSS 和 1539 行内联 JS 拆分为外部文件，利用浏览器缓存
2. **CodeMirror 按需加载**: 仅在 Python 编辑器区域可见时加载 CodeMirror
3. **Ren'Py 游戏懒加载**: 游戏页面添加 loading="lazy" 或动态 prefetch

### 中优先级

4. **图片转 WebP**: 4 个 webp vs 大量 png/jpg，建议全面迁移 WebP/AVIF
5. **游戏封面图压缩**: web-presplash.jpg 1.1MB 可压缩至 200KB
6. **添加资源预加载提示**: `<link rel="preload">` 关键字体

### 低优先级

7. **Service Worker**: 考虑 PWA 离线缓存策略 (部分 Ren'Py 游戏已有 SW)
8. **HTTP/2 Server Push**: Cloudflare 启用后自动获得

---

## 🧪 待执行测试 (C 盘清理后)

以下测试因 C 盘空间不足未能执行，建议后续补上：

- [ ] **Playwright E2E**: 关键页面加载、导航、JS 错误检测（测试脚本已就绪: `tests/e2e/key-pages.spec.ts`）
- [ ] **Lighthouse 审计**: Performance / Accessibility / Best Practices / SEO
- [ ] **axe-core 可访问性**: 自动检测 WCAG 违规
- [ ] **视觉回归**: 首页 / aboutme / blog 页面截图对比
- [ ] **移动端响应式**: iPhone/Android 各尺寸实际渲染测试
- [ ] **跨浏览器**: Chrome / Firefox / Safari / Edge 实际测试

### 快速恢复命令

```bash
# C 盘清理后
cd "G:\EmoScan Pro\ciallo0721-cmd.github.io"
npm install @playwright/test typescript
npx playwright install chromium
npx playwright test --config=playwright.config.ts
```

---

## 📝 总结

cilallo0721-cmd.top 是一个**结构扎实、SEO 出色、安全意识好**的个人网站。作为静态 HTML 站点，它在基础架构上做得相当不错：

- **优势**: HTML 结构规范、SEO 标签完整、安全 Headers 配置专业、CI/CD 自动化完善
- **主要短板**: 可访问性 (无 ARIA、px 字体)、代码组织 (内联过多、!important 滥用)
- **立即修复**: 2 个 DOCTYPE 缺失文件 + 34 个外链 rel 属性

**好的测试不是抓 bug，是让团队敢发布。** 这份报告的核心问题修完后，你的网站质量会达到一个相当不错的水平。
