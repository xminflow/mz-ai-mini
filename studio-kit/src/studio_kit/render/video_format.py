"""视频规格值对象：驱动 compose 的分辨率与字幕样式。"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class VideoFormat:
    width: int
    height: int
    sub_fontsize: int        # ASS 字号（像素，PlayRes 与分辨率 1:1）
    sub_margin_v: int        # 字幕垂直边距像素（底对齐=距底边，顶对齐=距顶边）
    sub_alignment: int = 2   # ASS 对齐：2=底部居中(口播)，8=顶部居中(整屏图时字幕走顶部带)


VERTICAL = VideoFormat(1080, 1920, 80, 480)     # 现有竖屏口播（底部字幕）
HORIZONTAL = VideoFormat(1920, 1080, 52, 64)    # 架构讲解横版（底部字幕）
# 架构讲解竖版：CTA 钩子走顶栏，字幕走底部留白带偏上（字号更大、不贴底、不压图）
ARCH_PORTRAIT = VideoFormat(1080, 1920, 64, 210, sub_alignment=2)
