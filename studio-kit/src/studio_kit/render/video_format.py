"""视频规格值对象：驱动 compose 的分辨率与字幕样式。"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class VideoFormat:
    width: int
    height: int
    sub_fontsize: int   # ASS 字号（像素，PlayRes 与分辨率 1:1）
    sub_margin_v: int   # 字幕距底边像素


VERTICAL = VideoFormat(1080, 1920, 80, 480)     # 现有竖屏口播
HORIZONTAL = VideoFormat(1920, 1080, 52, 64)    # 架构讲解横版
