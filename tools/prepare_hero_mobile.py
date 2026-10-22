#!/usr/bin/env python3
"""Rebuild mobile hero while preserving the desktop source and its composition."""
from pathlib import Path
from PIL import Image, ImageOps
root=Path(__file__).resolve().parents[1]
target=root/'assets/hero/glavnaya-mobile.webp'
target.parent.mkdir(parents=True,exist_ok=True)
with Image.open(root/'glavnaya-konturdoma.webp') as photo:
    photo=ImageOps.exif_transpose(photo).convert('RGB')
    photo.thumbnail((1080,1080),Image.Resampling.LANCZOS)
    photo.save(target,'WEBP',quality=76,method=6)
print(target.stat().st_size)
