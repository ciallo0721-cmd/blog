#!/bin/bash
# 批量更新 HTML 文件的 GA4 和 canonical
# 用法: ./update-ga4-canonical.sh

# 为每个 HTML 文件添加 pageMeta 和 canonical
update_html_file() {
    local file="$1"
    local content_type="$2"
    local page_name="$3"
    local canonical_url="$4"
    
    # 检查文件是否存在
    if [ ! -f "$file" ]; then
        return
    fi
    
    # 检查是否已经有 pageMeta
    if grep -q "window.pageMeta" "$file"; then
        echo "Skip (already has pageMeta): $file"
        return
    fi
    
    # 在 <head> 后添加 pageMeta 和 canonical
    # 使用 sed 在 </title> 后添加
    sed -i '/<\/title>/a\
\
    <!-- pageMeta 定义 -->\
    <script>\
    window.pageMeta = {\
        content_type: "'"$content_type"'",\
        page_name: "'"$page_name"'",\
        category: ""\
    };\
    </script>\
\
    <link rel="canonical" href="'https://91vip.xn--32v.ink$canonical_url'">' "$file"
    
    echo "Updated: $file"
}

# 更新应用类页面
update_html_file "app/moeface/index.html" "app" "moeface" "/app/moeface/"
update_html_file "app/mood-tracker/index.html" "app" "mood-tracker" "/app/mood-tracker/"
update_html_file "app/tools/index.html" "app" "tools" "/app/tools/"

# 更新实验类页面
update_html_file "exp/video-1/index.html" "experiment" "video-1" "/exp/video-1/"
update_html_file "exp/arg/index.html" "experiment" "arg" "/exp/arg/"
update_html_file "exp/cs2/index.html" "experiment" "cs2" "/exp/cs2/"
update_html_file "exp/dkdfj/index.html" "experiment" "dkdfj" "/exp/dkdfj/"
update_html_file "exp/vid/index.html" "experiment" "vid" "/exp/vid/"

# 更新游戏类页面
update_html_file "app/games/91/index.html" "app" "91-game" "/app/games/91/"
update_html_file "app/games/bjqy/index.html" "app" "bjqy-game" "/app/games/bjqy/"
update_html_file "app/games/fors/index.html" "app" "fors-game" "/app/games/fors/"
update_html_file "app/games/LAIDB/index.html" "app" "LAIDB-game" "/app/games/LAIDB/"
update_html_file "app/games/zmdspp/index.html" "app" "zmdspp-game" "/app/games/zmdspp/"

echo "GA4 和 canonical 更新完成！"
