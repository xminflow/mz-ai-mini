"""仅移除官网代理重复追加的缓存头；默认只检查，--apply 才生成候选配置。"""

import argparse
import hashlib
import re
import shutil
from pathlib import Path


def corrected_config(source: str) -> str:
    result = source
    for hostname in ("weelume.com", "www.weelume.com"):
        pattern = re.compile(rf"(?m)^{re.escape(hostname)}\s*\{{\n(?P<body>.*?)^\}}", re.DOTALL)
        matches = list(pattern.finditer(result))
        if len(matches) != 1:
            raise ValueError(f"预期唯一站点块：{hostname}")
        match = matches[0]
        body = match.group("body")
        rule = r'(?m)^[ \t]*header \+Cache-Control "max-age=0, private, must-revalidate"[ \t]*\n'
        updated, count = re.subn(rule, "", body)
        if count > 1:
            raise ValueError(f"发现重复规则，需人工核对：{hostname}")
        result = result[:match.start("body")] + updated + result[match.end("body"):]
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", type=Path)
    parser.add_argument("--apply", action="store_true")
    options = parser.parse_args()
    path: Path = options.config
    original = path.read_bytes()
    updated = corrected_config(original.decode("utf-8")).encode("utf-8")
    if updated == original:
        print("官网缓存规则已正确，无需修改")
        return
    digest = hashlib.sha256(original).hexdigest()
    backup = path.with_name(f"{path.name}.cache-{digest[:12]}.bak")
    candidate = path.with_name(f"{path.name}.cache-candidate")
    if options.apply:
        # 先保存内容寻址备份；外部校验候选文件通过后才替换配置并重载。
        if backup.exists() and backup.read_bytes() != original:
            raise ValueError("备份内容不一致，停止修改")
        if not backup.exists():
            shutil.copy2(path, backup)
        candidate.write_bytes(updated)
        shutil.copymode(path, candidate)
    print(f"sha256={digest} removed_bytes={len(original) - len(updated)} backup={backup} candidate={candidate} apply={options.apply}")


if __name__ == "__main__":
    main()
