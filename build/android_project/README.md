# ciallo0721-cmd 网站 Android 应用

使用 Android WebView 加载 https://91vip.xn--32v.ink/

## 构建 APK

### 方法一：使用 Android Studio
1. 打开 Android Studio
2. 选择 "Open an Existing Project"
3. 选择本目录
4. 等待 Gradle 同步完成
5. 点击 "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)"

### 方法二：使用命令行（需要安装 Android SDK）
```bash
# Windows
gradlew.bat assembleRelease

# Linux/Mac
./gradlew assembleRelease
```

输出 APK 位置：`app/build/outputs/apk/release/app-release-unsigned.apk`

## 签名 APK（发布用）

```bash
# 生成密钥（仅首次需要）
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key

# 签名 APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks app/build/outputs/apk/release/app-release-unsigned.apk my-key

# 对齐优化
zipalign -v 4 app/build/outputs/apk/release/app-release-unsigned.apk app/build/outputs/apk/release/app-release.apk
```

## 权限说明
- INTERNET: 访问在线网站
- ACCESS_NETWORK_STATE: 检测网络状态

## 自定义
- 修改网站 URL：编辑 `app/src/main/java/com/ciallo0721cmd/website/MainActivity.java` 中的 `WEBSITE_URL`
- 修改应用名称：编辑 `app/src/main/res/values/strings.xml`
