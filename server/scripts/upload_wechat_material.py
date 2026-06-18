"""一次性脚本：把本地图片上传为微信公众号【永久素材】，换取稳定 media_id。

用途：关注自动回复需要发送二维码图片，客服接口只能引用 media_id（不能直传本地文件），
而永久素材的 media_id 长期有效，适合用于固定的关注回复。

用法（PowerShell，示例）：
    cd server
    uv run python scripts/upload_wechat_material.py --image "C:\\Users\\xmin\\Desktop\\xxx.jpg"

appid / secret 默认从环境变量读取：
    MZ_AI_BACKEND_WECHAT_OFFICIAL_APPID
    MZ_AI_BACKEND_WECHAT_OFFICIAL_APP_SECRET
也可用 --appid / --secret 显式覆盖。

网络代理：脚本遵循 HTTPS_PROXY / HTTP_PROXY 环境变量（urllib 默认行为）。

成功后会打印 media_id；把它填到 server/.env 的
    MZ_AI_BACKEND_WECHAT_OFFICIAL_AUTO_REPLY_SUBSCRIBE_IMAGE_MEDIA_ID
即可。
"""
from __future__ import annotations

import argparse
import json
import mimetypes
import os
import sys
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

# Windows 控制台默认 GBK，会把中文提示/错误打成乱码；统一切到 UTF-8 输出。
for _stream in (sys.stdout, sys.stderr):
    reconfigure = getattr(_stream, "reconfigure", None)
    if reconfigure is not None:
        reconfigure(encoding="utf-8")

_TOKEN_URL = (
    "https://api.weixin.qq.com/cgi-bin/token"
    "?grant_type=client_credential&appid={appid}&secret={secret}"
)
_ADD_MATERIAL_URL = (
    "https://api.weixin.qq.com/cgi-bin/material/add_material"
    "?access_token={access_token}&type=image"
)


def _fetch_access_token(*, appid: str, secret: str) -> str:
    """换取 access_token；失败抛出含 errcode/errmsg 的明确错误。"""
    url = _TOKEN_URL.format(
        appid=urllib.parse.quote(appid),
        secret=urllib.parse.quote(secret),
    )
    request = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
    token = payload.get("access_token")
    if not isinstance(token, str) or token == "":
        raise RuntimeError(f"获取 access_token 失败：{payload}")
    return token


def _build_multipart(*, file_path: Path) -> tuple[bytes, str]:
    """手工拼装 multipart/form-data 请求体（字段名固定为 media）。"""
    boundary = f"----wechatmaterial{uuid.uuid4().hex}"
    content_type = mimetypes.guess_type(file_path.name)[0] or "image/jpeg"
    file_bytes = file_path.read_bytes()
    head = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="media"; filename="{file_path.name}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n"
    ).encode("utf-8")
    tail = f"\r\n--{boundary}--\r\n".encode("utf-8")
    body = head + file_bytes + tail
    return body, boundary


def _upload_material(*, access_token: str, file_path: Path) -> dict[str, object]:
    """上传永久图片素材，返回微信响应字典（含 media_id / url）。"""
    body, boundary = _build_multipart(file_path=file_path)
    url = _ADD_MATERIAL_URL.format(access_token=urllib.parse.quote(access_token))
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    if not isinstance(payload, dict):
        raise RuntimeError(f"上传素材响应非法：{payload}")
    errcode = payload.get("errcode")
    if isinstance(errcode, int) and errcode != 0:
        raise RuntimeError(f"上传素材失败：errcode={errcode}, errmsg={payload.get('errmsg')}")
    if not isinstance(payload.get("media_id"), str):
        raise RuntimeError(f"上传素材响应缺少 media_id：{payload}")
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="上传图片为微信公众号永久素材，输出 media_id。")
    parser.add_argument("--image", required=True, help="本地图片绝对路径")
    parser.add_argument("--appid", default=os.environ.get("MZ_AI_BACKEND_WECHAT_OFFICIAL_APPID"))
    parser.add_argument("--secret", default=os.environ.get("MZ_AI_BACKEND_WECHAT_OFFICIAL_APP_SECRET"))
    args = parser.parse_args()

    if not args.appid or not args.secret:
        print("缺少 appid/secret：请用 --appid/--secret 传入，或设置环境变量。", file=sys.stderr)
        return 2

    file_path = Path(args.image)
    if not file_path.is_file():
        print(f"图片不存在：{file_path}", file=sys.stderr)
        return 2

    access_token = _fetch_access_token(appid=args.appid, secret=args.secret)
    result = _upload_material(access_token=access_token, file_path=file_path)

    print("上传成功 ✅")
    print(f"media_id = {result['media_id']}")
    if isinstance(result.get("url"), str):
        print(f"url      = {result['url']}")
    print(
        "\n请把上面的 media_id 填入 server/.env：\n"
        "  MZ_AI_BACKEND_WECHAT_OFFICIAL_AUTO_REPLY_SUBSCRIBE_IMAGE_MEDIA_ID=<media_id>"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
