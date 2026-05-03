import json
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "photos.json"
THUMB_DIR = ROOT / "assets" / "images" / "thumbs"
PUBLIC_THUMB_PREFIX = "/gallery/assets/images/thumbs"
LOCAL_UPLOAD_PREFIX = "/gallery/"
MAX_SIZE = (900, 900)
JPEG_QUALITY = 78
PNG_COMPRESS_LEVEL = 9
SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def slugify(value):
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9._-]+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-") or "image"


def to_local_path(url):
    if not url or url.startswith("http://") or url.startswith("https://"):
        return None

    normalized = url
    if normalized.startswith(LOCAL_UPLOAD_PREFIX):
        normalized = normalized[len(LOCAL_UPLOAD_PREFIX):]
    elif normalized.startswith("/"):
        normalized = normalized[1:]

    candidate = (ROOT / normalized).resolve()
    try:
        candidate.relative_to(ROOT)
    except ValueError:
        return None

    return candidate


def thumb_url_for(image_path):
    safe_name = slugify(image_path.stem)
    ext = image_path.suffix.lower()
    if ext not in SUPPORTED_EXTS:
        ext = ".jpg"
    return f"{PUBLIC_THUMB_PREFIX}/{safe_name}{ext}"


def thumb_path_for(image_path):
    safe_name = slugify(image_path.stem)
    ext = image_path.suffix.lower()
    if ext not in SUPPORTED_EXTS:
        ext = ".jpg"
    return THUMB_DIR / f"{safe_name}{ext}"


def generate_thumb(source_path, target_path):
    target_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail(MAX_SIZE)

        suffix = target_path.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            image.save(target_path, quality=JPEG_QUALITY, optimize=True, progressive=True)
        elif suffix == ".png":
            image.save(target_path, optimize=True, compress_level=PNG_COMPRESS_LEVEL)
        elif suffix == ".webp":
            image.save(target_path, quality=JPEG_QUALITY, method=6)
        else:
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            image.save(target_path.with_suffix(".jpg"), quality=JPEG_QUALITY, optimize=True, progressive=True)


def main():
    if not DATA_FILE.exists():
        raise SystemExit("data/photos.json not found")

    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    photos = data if isinstance(data, list) else data.get("photos", [])
    changed = False

    for photo in photos:
        image_url = photo.get("image") or ""
        source_path = to_local_path(image_url)
        if not source_path or not source_path.exists():
            continue
        if source_path.suffix.lower() not in SUPPORTED_EXTS:
            continue

        target_path = thumb_path_for(source_path)
        target_url = thumb_url_for(source_path)

        should_generate = not target_path.exists() or source_path.stat().st_mtime > target_path.stat().st_mtime
        if should_generate:
            generate_thumb(source_path, target_path)

        if not photo.get("thumb"):
            photo["thumb"] = target_url
            changed = True

    if changed:
        DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
