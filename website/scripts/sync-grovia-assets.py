"""将 Grovia 参考素材本地化；仅构建时运行，页面运行时不依赖源站。"""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
from pathlib import Path
from urllib.request import urlopen
from typing import TypedDict
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/features/site-templates/catalog/grovia/source-reference.json"
DEST = ROOT / "public/templates/grovia/assets"
EXCLUDED = {"QvRhvxcKupIaxGpXe7Y2ZwfhWXw", "TvvQAdfQcOGhYmdyXdHcFz0ZU", "2uBYY8Z5EEfbKIrDhMMgTPWPY"}


class ReferencePage(TypedDict):
    images: list[str]


def download(source: str) -> dict[str, str | int]:
    asset_id = source.rsplit("/", 1)[-1].split(".")[0]
    with urlopen(source + "?scale-down-to=1600", timeout=60) as response:
        raw = response.read()
    with Image.open(BytesIO(raw)) as image:
        image.thumbnail((1600, 1600))
        output = DEST / f"{asset_id}.webp"
        image.save(output, "WEBP", quality=86)
        return {"file": output.name, "source": source, "width": image.width, "height": image.height}


def main() -> None:
    pages: list[ReferencePage] = json.loads(SOURCE.read_text(encoding="utf-8"))
    urls: set[str] = {str(url).split("?")[0] for page in pages for url in page["images"]}
    urls.add("https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png")
    urls = {url for url in urls if url.rsplit("/", 1)[-1].split(".")[0] not in EXCLUDED}
    DEST.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        manifest = list(pool.map(download, sorted(urls)))
    (DEST.parent / "sources.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Downloaded {len(manifest)} assets; source and dimensions recorded in sources.json")


if __name__ == "__main__":
    main()
