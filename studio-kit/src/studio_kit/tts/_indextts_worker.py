"""IndexTTS-2 批量合成 worker。

用法（在 IndexTTS venv 里运行）：
  python _indextts_worker.py --input-json <path> [--use-fp16]

input-json 格式：
  [{"index": 0, "text": "...", "output": "path/to/00.wav"}, ...]

stdout 输出（最后一行）：
  RESULT_JSON:[{"index": 0, "duration_s": 11.5}, ...]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import wave
from pathlib import Path

# IndexTTS-2 repo 根目录（含 indextts/infer_v2.py 与 checkpoints/）。
# 默认随 studio-kit 安装在 model/index-tts，可用环境变量 INDEXTTS_REPO 覆盖。
_INDEXTTS_REPO = os.environ.get(
    "INDEXTTS_REPO", r"D:\code\weelume-base\studio-kit\model\index-tts"
)
_MODEL_DIR = os.path.join(_INDEXTTS_REPO, "checkpoints")

# infer_v2.py 在 import 时会将 HF_HUB_CACHE 覆盖为 ./checkpoints/hf_cache
# （即 _INDEXTTS_REPO/checkpoints/hf_cache）
# 不设置 HF_HUB_OFFLINE，允许首次下载 facebook/w2v-bert-2.0 模型权重


def _wav_duration(wav_path: str) -> float:
    with wave.open(wav_path, "r") as wf:
        return wf.getnframes() / float(wf.getframerate())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-json", required=True, help="批量任务 JSON 文件路径")
    parser.add_argument("--voice-sample", required=True, help="音色参考音频路径")
    parser.add_argument("--use-fp16", action="store_true", help="使用 FP16 降低显存占用")
    args = parser.parse_args()

    tasks: list[dict] = json.loads(Path(args.input_json).read_text(encoding="utf-8"))
    if not tasks:
        print("RESULT_JSON:[]")
        return

    sys.path.insert(0, _INDEXTTS_REPO)
    from indextts.infer_v2 import IndexTTS2  # type: ignore

    print(f"[worker] 加载 IndexTTS-2 模型（use_fp16={args.use_fp16}）…", flush=True)
    tts = IndexTTS2(
        model_dir=_MODEL_DIR,
        cfg_path=os.path.join(_MODEL_DIR, "config.yaml"),
        use_fp16=args.use_fp16,
        use_deepspeed=False,
        use_cuda_kernel=False,
    )
    print("[worker] 模型加载完成", flush=True)

    results: list[dict] = []
    for task in tasks:
        idx = task["index"]
        text = task["text"]
        out_path = task["output"]
        Path(out_path).parent.mkdir(parents=True, exist_ok=True)
        print(f"[worker] 合成 slide {idx:02d}：{text[:30]}…", flush=True)
        tts.infer(
            spk_audio_prompt=args.voice_sample,
            text=text,
            output_path=out_path,
            verbose=False,
        )
        duration_s = _wav_duration(out_path)
        print(f"[worker]   → {duration_s:.2f}s  {out_path}", flush=True)
        results.append({"index": idx, "duration_s": duration_s})

    # 最后一行输出结果供调用方解析
    print(f"RESULT_JSON:{json.dumps(results)}")


if __name__ == "__main__":
    main()
