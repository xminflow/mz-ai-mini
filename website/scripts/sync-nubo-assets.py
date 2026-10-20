"""本地化 Nubo 参考站图片与首屏影像，保存可核对的来源清单。"""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
from pathlib import Path
from typing import TypedDict
from urllib.request import urlopen
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/templates/nubo/photos'

class ReferencePage(TypedDict):
    images: list[str]

def download(source: str) -> dict[str, str | int]:
    asset_id = source.rsplit('/', 1)[-1].split('.')[0]
    target = DEST / f'{asset_id}.webp'
    if not target.exists():
        with urlopen(source + '?scale-down-to=1600', timeout=60) as response:
            raw = response.read()
        with Image.open(BytesIO(raw)) as picture:
            picture.thumbnail((1600, 1600))
            picture.save(target, 'WEBP', quality=87)
    with Image.open(target) as picture:
        return {'file': target.name, 'source': source, 'width': picture.width, 'height': picture.height}

def main() -> None:
    pages: list[ReferencePage] = json.loads((ROOT / 'src/features/site-templates/catalog/nubo/source-reference.json').read_text(encoding='utf-8'))
    sources = {url for page in pages for url in page['images'] if not url.endswith('.svg')}
    sources.add('https://framerusercontent.com/images/jeplaMV5DSqGLRib90xEleN4GE.jpg')
    DEST.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=6) as pool:
        manifest = list(pool.map(download, sorted(sources)))
    video_url = 'https://framerusercontent.com/assets/Q2DKMhSOptiVNCBb9PEzxJGqUSQ.mp4'
    video = DEST.parent / 'home.mp4'
    if not video.exists():
        with urlopen(video_url, timeout=120) as response:
            video.write_bytes(response.read())
    capability_url = 'https://framerusercontent.com/assets/x8b2649ZG1Q5jZczpQ86ny436Qg.mp4'
    capability = DEST.parent / 'capability.mp4'
    if not capability.exists():
        with urlopen(capability_url, timeout=120) as response:
            capability.write_bytes(response.read())
    (DEST.parent / 'sources.json').write_text(json.dumps({'reference': 'https://nubo.framer.website/', 'license': '参考站素材，仅用于内部复刻演示；商业发布前需取得原作者及素材权利人许可。共享字体许可证沿用 lunera/fonts。', 'video': video_url, 'capabilityVideo': capability_url, 'images': manifest}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'本地化 {len(manifest)} 张图片及首页、能力轮播视频')

if __name__ == '__main__':
    main()
