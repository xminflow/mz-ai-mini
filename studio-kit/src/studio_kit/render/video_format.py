"""视频规格值对象：驱动 compose 的分辨率与字幕样式。"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class VideoFormat:
    width: int
    height: int
    sub_fontsize: int            # ASS 字号（像素，PlayRes 与分辨率 1:1）
    sub_margin_v: int            # 字幕垂直边距像素（底对齐=距底边，顶对齐=距顶边）
    sub_alignment: int = 2       # ASS 对齐：2=底部居中(口播)，8=顶部居中
    sub_primary: str = "&H00FFFFFF"  # 主字色（ASS &HAABBGGRR；默认白）
    sub_outline_w: int = 3       # 描边粗细
    sub_shadow: int = 0          # 阴影
    sub_animate: bool = False    # 大字报弹入+淡入动画
    sub_max_chars: int = 12      # 每句最大字数（切句用）


VERTICAL = VideoFormat(1080, 1920, 80, 480)     # 现有竖屏口播（底部字幕）
HORIZONTAL = VideoFormat(1920, 1080, 52, 64)    # 架构讲解横版（底部字幕）
# 架构讲解竖版：大字报营销风——超大亮黄字 + 粗黑描边 + 弹入淡入动画，底部留白带
ARCH_PORTRAIT = VideoFormat(
    1080, 1920, 80, 360,
    sub_alignment=2,
    sub_primary="&H0000FFFF",   # 亮黄（爆款大字报）
    sub_outline_w=6,
    sub_shadow=2,
    sub_animate=True,
    sub_max_chars=10,
)
