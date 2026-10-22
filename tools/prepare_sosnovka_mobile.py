#!/usr/bin/env python3
"""Create small mobile WebP photos for the Sosnovka 47 project; originals untouched."""
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "projects" / "sosnovka-47"
DST = SRC / "mobile"
DST.mkdir(parents=True, exist_ok=True)
for source in sorted(SRC.glob("*.webp")):
    target = DST / source.name
    with Image.open(source) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((1080, 1080), Image.Resampling.LANCZOS)
        im.save(target, "WEBP", quality=79, method=6)
    print(f"{source.name}: {source.stat().st_size//1024} KB -> {target.stat().st_size//1024} KB, {im.width}x{im.height}")
