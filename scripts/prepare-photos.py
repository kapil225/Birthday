"""Prepare photos/ for the website using macOS sips; originals stay untouched.
Generated JPEGs are committed assets, so hosting requires only npm run build.
"""
from pathlib import Path
import json
import subprocess
import shutil

root=Path(__file__).resolve().parents[1]
source=root/'photos'
if not shutil.which('sips'):
    raise SystemExit('Photo preparation uses macOS sips. The already generated web photos work on every hosting platform.')
full=root/'public/photos/personal'
thumbs=full/'thumbnails'
thumbs.mkdir(parents=True,exist_ok=True)
video_types={'.mp4','.webm','.mov','.m4v'}
supported={'.jpg','.jpeg','.png','.webp','.avif','.heic','.heif','.dng','.tif','.tiff'}
files=sorted((p for p in source.iterdir() if p.is_file() and p.suffix.lower() in supported | video_types),key=lambda p:p.name.lower()) if source.exists() else []
manifest=[]
for i,p in enumerate(files):
    if p.suffix.lower() in video_types:
        video_dir=root/'public/videos'
        video_dir.mkdir(parents=True,exist_ok=True)
        dest=video_dir/p.name
        if not dest.exists() or dest.stat().st_mtime < p.stat().st_mtime:
            shutil.copy2(p,dest)
        manifest.append({'filename':p.name,'src':'/videos/'+p.name,'type':'video'})
        print(f'{i+1}/{len(files)} prepared video: {p.name}')
        continue
    # Include the source extension to avoid name collisions between RAW and JPEG.
    name=p.name+'.jpg'
    outputs=[(full/name,1800),(thumbs/name,600)]
    for dest,size in outputs:
        if not dest.exists() or dest.stat().st_mtime < p.stat().st_mtime:
            subprocess.run(['sips','-s','format','jpeg','-s','formatOptions','82','-Z',str(size),str(p),'--out',str(dest)],check=True,capture_output=True)
    manifest.append({'type':'image','filename':p.name,'src':'/photos/personal/'+name,'thumbnail':'/photos/personal/thumbnails/'+name})
    print(f'{i+1}/{len(files)} prepared: {p.name}')
(root/'src/data/photo-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Ready: {len(manifest)} photos/videos ready for the gallery.')
