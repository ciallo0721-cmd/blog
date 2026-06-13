#!/usr/bin/env python3
"""
APK 打包脚本 - 生成 Android WebView 项目
编译需要 Android Studio 或 Gradle
"""

import os
import sys
from pathlib import Path

BUILD_DIR = Path(__file__).parent.absolute()
ANDROID_PROJECT = BUILD_DIR / "android_project"

def log(msg):
    print(f"[APK Builder] {msg}")

def create_android_manifest():
    """创建 AndroidManifest.xml"""
    manifest = f'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.ciallo0721cmd.website">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="unspecified">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
    </application>
    
</manifest>
'''
    manifest_path = ANDROID_PROJECT / "app" / "src" / "main" / "AndroidManifest.xml"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(manifest, encoding="utf-8")
    log(f"  ✓ AndroidManifest.xml")

def create_main_activity():
    """创建 MainActivity.java"""
    java_code = '''package com.ciallo0721cmd.website;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private static final String WEBSITE_URL = "https://91vip.xn--32v.ink/";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        webView = findViewById(R.id.webView);
        
        // 配置 WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // 设置 WebViewClient 以在应用内打开链接
        webView.setWebViewClient(new WebViewClient());
        
        // 加载网站
        webView.loadUrl(WEBSITE_URL);
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
'''
    java_path = ANDROID_PROJECT / "app" / "src" / "main" / "java" / "com" / "ciallo0721cmd" / "website" / "MainActivity.java"
    java_path.parent.mkdir(parents=True, exist_ok=True)
    java_path.write_text(java_code, encoding="utf-8")
    log(f"  ✓ MainActivity.java")

def create_layout():
    """创建 activity_main.xml 布局文件"""
    layout = '''<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">
    
    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
    
</LinearLayout>
'''
    layout_path = ANDROID_PROJECT / "app" / "src" / "main" / "res" / "layout" / "activity_main.xml"
    layout_path.parent.mkdir(parents=True, exist_ok=True)
    layout_path.write_text(layout, encoding="utf-8")
    log(f"  ✓ activity_main.xml")

def create_strings():
    """创建 strings.xml"""
    strings = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">ciallo0721-cmd</string>
</resources>
'''
    strings_path = ANDROID_PROJECT / "app" / "src" / "main" / "res" / "values" / "strings.xml"
    strings_path.parent.mkdir(parents=True, exist_ok=True)
    strings_path.write_text(strings, encoding="utf-8")
    log(f"  ✓ strings.xml")

def create_styles():
    """创建 styles.xml"""
    styles = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:colorPrimary">#667eea</item>
        <item name="android:colorPrimaryDark">#764ba2</item>
        <item name="android:colorAccent">#667eea</item>
    </style>
</resources>
'''
    styles_path = ANDROID_PROJECT / "app" / "src" / "main" / "res" / "values" / "styles.xml"
    styles_path.parent.mkdir(parents=True, exist_ok=True)
    styles_path.write_text(styles, encoding="utf-8")
    log(f"  ✓ styles.xml")

def create_ic_launcher():
    """创建占位启动图标（纯色 PNG，用 base64 嵌入）"""
    # 最小可用图标：1x1 像素 PNG（系统会缩放）
    # 实际发布时需要替换成正式图标
    ic_launcher_dir = ANDROID_PROJECT / "app" / "src" / "main" / "res" / "mipmap-anydpi-v26"
    ic_launcher_dir.mkdir(parents=True, exist_ok=True)
    
    # 创建简单的 ic_launcher.xml（矢量图标占位）
    ic_xml = '''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:pathData="M0,0h108v108H0"
        android:fillColor="#667eea"/>
    <path
        android:pathData="M54,24a30,30 0 1,1 0,60a30,30 0 1,1 0,-60"
        android:fillColor="#ffffff"/>
</vector>
'''
    (ic_launcher_dir / "ic_launcher.xml").write_text(ic_xml, encoding="utf-8")
    (ic_launcher_dir / "ic_launcher_round.xml").write_text(ic_xml, encoding="utf-8")
    log(f"  ✓ ic_launcher.xml (占位图标）")

def create_build_gradle():
    """创建 app/build.gradle"""
    gradle = '''plugins {
    id "com.android.application"
}

android {
    namespace "com.ciallo0721cmd.website"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.ciallo0721cmd.website"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation "androidx.appcompat:appcompat:1.6.1"
}
'''
    gradle_path = ANDROID_PROJECT / "app" / "build.gradle"
    gradle_path.parent.mkdir(parents=True, exist_ok=True)
    gradle_path.write_text(gradle, encoding="utf-8")
    log(f"  ✓ app/build.gradle")

def create_gradle_properties():
    """创建 gradle.properties（AndroidX 等配置）"""
    props = '''# AndroidX
android.useAndroidX=true
android.enableJetifier=true

# Gradle
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.parallel=true
'''
    props_path = ANDROID_PROJECT / "gradle.properties"
    props_path.write_text(props, encoding="utf-8")
    log(f"  ✓ gradle.properties")

def create_app_gradle_properties():
    """创建 app/gradle.properties"""
    props = '''# AndroidX
android.useAndroidX=true
'''
    props_path = ANDROID_PROJECT / "app" / "gradle.properties"
    props_path.parent.mkdir(parents=True, exist_ok=True)
    props_path.write_text(props, encoding="utf-8")
    log(f"  ✓ app/gradle.properties")

def create_project_build_gradle():
    """创建项目根目录的 build.gradle"""
    content = '''// 项目级 build.gradle（空，由 settings.gradle 管理）
'''
    path = ANDROID_PROJECT / "build.gradle"
    path.write_text(content, encoding="utf-8")

def create_settings_gradle():
    """创建 settings.gradle（含 Android Gradle Plugin 版本）"""
    content = '''pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    plugins {
        id "com.android.application" version "8.2.0"
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ciallo0721-cmd-website"
include ":app"
'''
    path = ANDROID_PROJECT / "settings.gradle"
    path.write_text(content, encoding="utf-8")
    log(f"  ✓ settings.gradle")

def create_gradle_wrapper():
    """创建 Gradle Wrapper 配置文件（不含 jar，需运行 gradle wrapper 生成）"""
    wrapper_dir = ANDROID_PROJECT / "gradle" / "wrapper"
    wrapper_dir.mkdir(parents=True, exist_ok=True)
    
    # gradle-wrapper.properties
    props = '''distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
'''
    (wrapper_dir / "gradle-wrapper.properties").write_text(props, encoding="utf-8")
    
    log(f"  ✓ Gradle Wrapper 配置文件（运行 gradle wrapper 生成完整 wrapper）")

def create_readme():
    """创建 README.md"""
    readme = '''# ciallo0721-cmd 网站 Android 应用

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
'''
    readme_path = ANDROID_PROJECT / "README.md"
    readme_path.write_text(readme, encoding="utf-8")
    log(f"  ✓ README.md")

def main():
    log("=" * 60)
    log("ciallo0721-cmd 网站 APK 打包工具")
    log("=" * 60)
    log("")
    
    # 清理旧项目
    if ANDROID_PROJECT.exists():
        import shutil
        log("清理旧项目...")
        shutil.rmtree(ANDROID_PROJECT)
    
    # 创建项目结构
    log("创建 Android 项目结构...")
    ANDROID_PROJECT.mkdir(parents=True, exist_ok=True)
    
    # 生成各文件
    create_settings_gradle()
    create_project_build_gradle()
    create_gradle_properties()
    create_app_gradle_properties()
    create_build_gradle()
    create_android_manifest()
    create_main_activity()
    create_layout()
    create_strings()
    create_styles()
    create_ic_launcher()
    create_gradle_wrapper()
    create_readme()
    
    log("")
    log("=" * 60)
    log("✓ Android 项目生成完成！")
    log(f"  项目位置: {ANDROID_PROJECT}")
    log("")
    log("下一步：")
    log("  1. 使用 Android Studio 打开该项目")
    log("  2. 点击 Build -> Build APK")
    log("  3. 或命令行: cd android_project && gradle wrapper --gradle-version 8.2 && ./gradlew assembleRelease")
    log("=" * 60)

if __name__ == "__main__":
    main()
