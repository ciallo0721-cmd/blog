#!/bin/bash
# 批量创建 redirect 跳转页脚本
# 用法: ./create-redirects.sh

BASE_URL="https://91vip.xn--32v.ink"
REDIRECT_DIR="redirect"

# 创建 redirect 目录（如果需要）
mkdir -p "$REDIRECT_DIR"

# 定义旧URL → 新URL的映射
declare -A redirects=(
    ["/wz.html"]="/blog/"
    ["/moeface/"]="/app/moeface/"
    ["/mood-tracker/"]="/app/mood-tracker/"
    ["/tools/"]="/app/tools/"
    ["/blog/video-1/"]="/exp/video-1/"
    ["/arg/"]="/exp/arg/"
    ["/cs2/"]="/exp/cs2/"
    ["/dkdfj/"]="/exp/dkdfj/"
    ["/vid/"]="/exp/vid/"
    ["/91/"]="/app/games/91/"
    ["/bjqy/"]="/app/games/bjqy/"
    ["/fors/"]="/app/games/fors/"
    ["/LAIDB/"]="/app/games/LAIDB/"
    ["/zmdspp/"]="/app/games/zmdspp/"
)

# 为每个映射创建 redirect 页
for old_url in "${!redirects[@]}"; do
    new_url="${redirects[$old_url]}"
    filename="${old_url#/}"  # 去掉开头的/
    
    # 如果是目录（以/结尾），创建 index.html
    if [[ "$old_url" == */ ]]; then
        dir_path="${old_url%/}"  # 去掉结尾的/
        mkdir -p "$dir_path"
        filepath="$dir_path/index.html"
    else
        filepath="$filename"
    fi
    
    # 创建 redirect 页
    cat > "$filepath" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=$new_url">
    <link rel="canonical" href="$BASE_URL$new_url">
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
        <a href="$new_url">$BASE_URL$new_url</a>
    </p>
    <script>
        window.location.replace("$new_url");
    </script>
</body>
</html>
EOF
    
    echo "Created: $filepath → $new_url"
done

echo "所有 redirect 页创建完成！"
