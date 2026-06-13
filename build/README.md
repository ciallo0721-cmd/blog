# 网站打包工具

将 ciallo0721-cmd.github.io 个人网站打包为 **Windows 桌面应用 (EXE)** 和 **Android 应用 (APK)**

## 文件说明

| 文件 | 说明 |
|------|------|
| `app.py` | PyWebView 版本（需要 pywebview 依赖，打包体积较小） |
| `app_simple.py` | 简化版（调用默认浏览器，无需额外依赖） |
| `build_exe.py` | PyInstaller 打包脚本（PyWebView 版本） |
| `build_exe_simple.py` | PyInstaller 打包脚本（简化版） |
| `build_apk.py` | APK 打包脚本（生成 Android 项目） |
| `electron-app/` | Electron 版本（推荐，打包质量高） |

## 打包方法

### 方法一：使用 GitHub Actions 自动打包（推荐）

1. 推送到 GitHub 后，工作流会自动运行
2. 每日凌晨 2 点（北京时间）自动重新打包
3. 也可以在 GitHub 仓库的 Actions 页面手动触发

**输出位置**：GitHub Releases 页面会创建每日构建版本

### 方法二：本地打包 APK

```bash
# 生成 Android 项目
python build/build_apk.py

# 使用 Android Studio 打开 build/android_project 目录
# 点击 Build -> Build APK
```

### 方法三：本地打包 EXE（Electron 版本）

```bash
cd build/electron-app
npm install
npm run build
```

输出位置：`build/electron-app/dist/`

## 每日自动更新

GitHub Actions 工作流 (`.github/workflows/daily-build.yml`) 配置：

- **定时触发**：每天凌晨 2 点（北京时间）
- **推送触发**：推送到 main 分支时自动运行
- **手动触发**：在 GitHub Actions 页面点击 "Run workflow"

每次运行会创建新的 Release，包含最新的 EXE 和 APK 文件。

## 注意事项

1. **EXE 打包**：
   - PyWebView 版本需要安装 `pywebview` 和 `pyinstaller`
   - Electron 版本需要 Node.js 和 npm
   - 本地网络环境可能导致打包失败，建议使用 GitHub Actions

2. **APK 打包**：
   - 生成的 APK 需要签名才能发布到应用商店
   - 调试版本可以直接安装到 Android 设备

3. **网站更新**：
   - 应用加载在线网站 (https://91vip.xn--32v.ink/)
   - 网站内容更新后，应用会自动显示最新版本
   - 无需重新打包应用（除非修改了应用配置）

## 故障排除

### EXE 打包失败

- 检查 Python 和 Node.js 是否正确安装
- 尝试使用 GitHub Actions 自动打包
- 检查网络连接（可能需要配置代理）

### APK 打包失败

- 确保已安装 Android SDK
- 检查 `ANDROID_HOME` 环境变量是否正确设置
- 尝试使用 Android Studio 手动构建

## 技术支持

如有问题，请在 GitHub 仓库创建 Issue。
