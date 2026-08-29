#!/usr/bin/env python3
"""给本次提交变更的图片自动加半透明水印。

环境变量：
  COMMITS_JSON    push 事件的 commits 数组 JSON（必填）
  WATERMARK_TEXT  水印文字（默认 ciallo0721-cmd.top）
  WATERMARK_ALPHA 不透明度 0-100（默认 10）
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

TEXT = os.environ.get("WATERMARK_TEXT", "ciallo0721-cmd.top")
ALPHA = int(os.environ.get("WATERMARK_ALPHA", "10"))
EXTS = (".png", ".jpg", ".jpeg", ".webp", ".bmp")
SKIP_PREFIXES = (".github/", "node_modules/", ".git/")
FONT_CANDIDATES = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
)


def collect_images() -> list:
    raw = os.environ.get("COMMITS_JSON", "")
    if not raw:
        return []
    commits = json.loads(raw)
    changed = set()
    for commit in commits:
        for path in commit.get("added", []) + commit.get("modified", []):
            changed.add(path)
    return sorted(
        path for path in changed
        if path.lower().endswith(EXTS)
        and not any(path.startswith(p) for p in SKIP_PREFIXES)
    )


def load_font(size: int):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default(size)


def watermark_image(path: str) -> None:
    img = Image.open(path)
    # 跳过 GIF 动图，避免破坏动画
    if getattr(img, "is_animated", False):
        print(f"跳过动图: {path}")
        return
    fmt = (img.format or "PNG").upper()
    img = img.convert("RGBA")
    width, height = img.size

    # 字号随图片宽度自适应，小图用 12px 兜底
    font_size = max(12, int(width * 0.015))
    font = load_font(font_size)

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    bbox = draw.textbbox((0, 0), TEXT, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = max(10, font_size // 2)
    x, y = width - tw - pad, height - th - pad

    # 先画不透明文字（黑阴影 + 白字，深浅背景都能看清），
    # 再把整个水印层的 alpha 通道统一压到指定透明度。
    # 注：不能直接用半透明 fill——Pillow 的 FreeType 字体在某些平台
    # 渲染半透明 fill 会画不出来（实测 Windows 上 load_default(size) 有此 bug）。
    draw.text((x + 2, y + 2), TEXT, font=font, fill=(0, 0, 0, 255))
    draw.text((x, y), TEXT, font=font, fill=(255, 255, 255, 255))
    r, g, b, a = layer.split()
    a = a.point(lambda v: int(v * ALPHA / 100))
    layer = Image.merge("RGBA", (r, g, b, a))
    img = Image.alpha_composite(img, layer)

    if fmt == "PNG":
        img.convert("RGBA").save(path, format="PNG")
    elif fmt == "WEBP":
        img.convert("RGBA").save(path, format="WEBP")
    elif fmt == "BMP":
        img.convert("RGB").save(path, format="BMP")
    else:
        img.convert("RGB").save(path, format="JPEG", quality=90)
    print(f"已加水印: {path} ({width}x{height})")


def main() -> None:
    images = collect_images()
    if not images:
        print("本次提交没有图片变更，无需加水印")
        return
    print(f"发现 {len(images)} 张图片，开始处理...")
    for path in images:
        try:
            watermark_image(path)
        except Exception as exc:
            print(f"处理失败 {path}: {exc}")


if __name__ == "__main__":
    main()
