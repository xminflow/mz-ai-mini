from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote

import httpx

API_HOST = "visual.volcengineapi.com"
API_URL = f"https://{API_HOST}"
API_VERSION = "2022-08-31"
API_REGION = "cn-north-1"
API_SERVICE = "cv"
REQ_KEY = "jimeng_t2i_v40"
REQ_KEY_SEEDREAM46 = "jimeng_seedream46_cvtob"
SUCCESS_CODE = 10000
FINAL_STATUSES = {"done", "expired", "not_found"}


@dataclass(slots=True)
class JimengOptions:
    prompt: str
    output_path: Path  # absolute file path (NOT a directory — D3 writes to a single file)
    width: int
    height: int
    poll_interval: float = 2.0
    max_wait_seconds: int = 180


@dataclass(slots=True)
class JimengReferenceOptions:
    prompt: str
    reference_path: Path
    output_path: Path
    width: int
    height: int
    poll_interval: float = 2.0
    max_wait_seconds: int = 180


def generate_image(access_key: str, secret_key: str, opts: JimengOptions) -> Path:
    """Submit a t2i task, poll, save PNG to opts.output_path. Returns the saved path."""
    client = httpx.Client(timeout=120.0)
    try:
        submit_payload: dict[str, Any] = {
            "req_key": REQ_KEY,
            "prompt": opts.prompt,
            "width": opts.width,
            "height": opts.height,
            "force_single": True,
        }
        submit_resp = _invoke(
            client,
            access_key,
            secret_key,
            "CVSync2AsyncSubmitTask",
            submit_payload,
            os.environ.get("JIMENG_SESSION_TOKEN", "").strip() or None,
        )
        task_id: str = submit_resp["data"]["task_id"]

        start = time.monotonic()
        status = ""
        data: dict[str, Any] = {}
        while True:
            result = _invoke(
                client,
                access_key,
                secret_key,
                "CVSync2AsyncGetResult",
                {"req_key": REQ_KEY, "task_id": task_id, "req_json": json.dumps({"return_url": True})},
                os.environ.get("JIMENG_SESSION_TOKEN", "").strip() or None,
            )
            data = result["data"]
            status = str(data.get("status", "")).strip().lower()
            if status in FINAL_STATUSES:
                break
            if time.monotonic() - start > opts.max_wait_seconds:
                raise TimeoutError(f"task {task_id} timed out after {opts.max_wait_seconds}s")
            time.sleep(opts.poll_interval)

        if status != "done":
            raise RuntimeError(f"task {task_id} ended with status={status}")

        opts.output_path.parent.mkdir(parents=True, exist_ok=True)
        binary_list: list[Any] = data.get("binary_data_base64") or []
        if binary_list and isinstance(binary_list[0], str) and binary_list[0].strip():
            opts.output_path.write_bytes(base64.b64decode(binary_list[0], validate=True))
            return opts.output_path

        urls: list[Any] = data.get("image_urls") or []
        if urls and isinstance(urls[0], str) and urls[0].strip():
            resp = client.get(urls[0])
            resp.raise_for_status()
            opts.output_path.write_bytes(resp.content)
            return opts.output_path

        raise RuntimeError("task completed but no image bytes/urls were returned")
    finally:
        client.close()


def generate_image_with_reference(
    access_key: str,
    secret_key: str,
    opts: JimengReferenceOptions,
) -> Path:
    """Submit a reference-image generation task, poll, save PNG to opts.output_path."""
    client = httpx.Client(timeout=120.0)
    try:
      reference_data_url = _data_url_for_path(opts.reference_path)
      submit_payload: dict[str, Any] = {
          "req_key": REQ_KEY_SEEDREAM46,
          "prompt": opts.prompt,
          "width": opts.width,
          "height": opts.height,
          "scale": 20,
          "force_single": True,
          "image_urls": [reference_data_url],
      }
      submit_resp = _invoke(
          client,
          access_key,
          secret_key,
          "CVSync2AsyncSubmitTask",
          submit_payload,
          os.environ.get("JIMENG_SESSION_TOKEN", "").strip() or None,
      )
      task_id: str = submit_resp["data"]["task_id"]

      start = time.monotonic()
      status = ""
      data: dict[str, Any] = {}
      while True:
          result = _invoke(
              client,
              access_key,
              secret_key,
              "CVSync2AsyncGetResult",
              {"req_key": REQ_KEY_SEEDREAM46, "task_id": task_id, "req_json": json.dumps({"return_url": True})},
              os.environ.get("JIMENG_SESSION_TOKEN", "").strip() or None,
          )
          data = result["data"]
          status = str(data.get("status", "")).strip().lower()
          if status in FINAL_STATUSES:
              break
          if time.monotonic() - start > opts.max_wait_seconds:
              raise TimeoutError(f"task {task_id} timed out after {opts.max_wait_seconds}s")
          time.sleep(opts.poll_interval)

      if status != "done":
          raise RuntimeError(f"task {task_id} ended with status={status}")

      opts.output_path.parent.mkdir(parents=True, exist_ok=True)
      binary_list: list[Any] = data.get("binary_data_base64") or []
      if binary_list and isinstance(binary_list[0], str) and binary_list[0].strip():
          opts.output_path.write_bytes(base64.b64decode(binary_list[0], validate=True))
          return opts.output_path

      urls: list[Any] = data.get("image_urls") or []
      if urls and isinstance(urls[0], str) and urls[0].strip():
          resp = client.get(urls[0])
          resp.raise_for_status()
          opts.output_path.write_bytes(resp.content)
          return opts.output_path

      raise RuntimeError("task completed but no image bytes/urls were returned")
    finally:
      client.close()


def _data_url_for_path(image_path: Path) -> str:
    suffix = image_path.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        mime = "image/jpeg"
    elif suffix == ".png":
        mime = "image/png"
    else:
        raise RuntimeError(f"Seedream 4.6 only supports JPEG/PNG input images, got: {suffix or 'unknown'}")
    encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def _invoke(
    client: httpx.Client,
    access_key: str,
    secret_key: str,
    action: str,
    payload: dict[str, Any],
    session_token: str | None = None,
) -> dict[str, Any]:
    query: dict[str, Any] = {"Action": action, "Version": API_VERSION}
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    last_exc: Exception | None = None
    resp: httpx.Response | None = None
    for attempt in range(1, 5):
        headers = _sign_headers(access_key, secret_key, query, body, session_token)
        try:
            resp = client.post(API_URL, params=query, content=body.encode("utf-8"), headers=headers)
            break
        except (httpx.ConnectError, httpx.TimeoutException) as exc:
            last_exc = exc
            time.sleep(min(2 ** (attempt - 1), 8))
    if resp is None:
        raise RuntimeError(f"{action}: network error after retries: {last_exc}")
    try:
        out: dict[str, Any] = resp.json()
    except ValueError as exc:
        raise RuntimeError(f"{action}: non-JSON HTTP {resp.status_code}") from exc
    if resp.status_code >= 400:
        request_id = out.get("request_id") or out.get("RequestId")
        raise RuntimeError(
            f"{action} HTTP {resp.status_code}: code={out.get('code')} msg={out.get('message')} request_id={request_id}"
        )
    code = out.get("code")
    if code != SUCCESS_CODE:
        request_id = out.get("request_id") or out.get("RequestId")
        raise RuntimeError(
            f"{action} error: code={code} msg={out.get('message') or 'unknown'} request_id={request_id}"
        )
    return out


def _sign_headers(
    access_key: str,
    secret_key: str,
    query: dict[str, Any],
    body: str,
    session_token: str | None = None,
) -> dict[str, str]:
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    short_date = ts[:8]
    body_hash = hashlib.sha256(body.encode("utf-8")).hexdigest()
    headers: dict[str, str] = {
        "Content-Type": "application/json",
        "Host": API_HOST,
        "X-Date": ts,
        "X-Content-Sha256": body_hash,
    }
    if session_token:
        headers["X-Security-Token"] = session_token
    signed = {k.lower(): v for k, v in headers.items()}
    canonical_headers = "".join(f"{k}:{signed[k]}\n" for k in sorted(signed))
    signed_str = ";".join(sorted(signed))
    canonical_request = "\n".join([
        "POST",
        "/",
        _canonical_query(query),
        canonical_headers,
        signed_str,
        body_hash,
    ])
    scope = f"{short_date}/{API_REGION}/{API_SERVICE}/request"
    sts = "\n".join([
        "HMAC-SHA256",
        ts,
        scope,
        hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
    ])
    signing_key = _derive_signing_key(secret_key, short_date)
    signature = hmac.new(signing_key, sts.encode("utf-8"), hashlib.sha256).hexdigest()
    headers["Authorization"] = (
        "HMAC-SHA256 "
        f"Credential={access_key}/{scope}, "
        f"SignedHeaders={signed_str}, "
        f"Signature={signature}"
    )
    return headers


def _derive_signing_key(secret_key: str, short_date: str) -> bytes:
    def _h(key: bytes, msg: str) -> bytes:
        return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()

    date_key = _h(secret_key.encode("utf-8"), short_date)
    region_key = _h(date_key, API_REGION)
    service_key = _h(region_key, API_SERVICE)
    return _h(service_key, "request")


def _canonical_query(query: dict[str, Any]) -> str:
    pairs = sorted(
        (quote(str(k), safe="-_.~"), quote(str(v), safe="-_.~")) for k, v in query.items()
    )
    return "&".join(f"{k}={v}" for k, v in pairs)
