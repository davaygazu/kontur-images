#!/usr/bin/env python3
"""Build isolated mobile photos and thumbnails; never overwrite desktop assets."""
import json
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parents[1]
rows=[]
for name in json.loads((ROOT/'tests/mobile-photo-sources.json').read_text()):
    source=ROOT/name
    with Image.open(source) as image:
        image=ImageOps.exif_transpose(image).convert('RGB')
        sizes={}
        for folder,edge,quality in [('mobile',1080,79),('mobile-thumbs',256,65)]:
            target=source.parent/folder/source.name
            target.parent.mkdir(parents=True,exist_ok=True)
            copy=image.copy(); copy.thumbnail((edge,edge),Image.Resampling.LANCZOS)
            copy.save(target,'WEBP',quality=quality,method=6)
            sizes[folder]=target.stat().st_size
        rows.append(dict(path=name,original=source.stat().st_size,**sizes))
(ROOT/'tests/mobile-photo-sizes.json').write_text(json.dumps(rows,indent=2))
for key in ['original','mobile','mobile-thumbs']:
    print(key,sum(r[key] for r in rows))
print('photos',len(rows))
