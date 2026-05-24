#!/usr/bin/env python3
"""
修复 6 份 HTML 报告中缺少的脚注引用。
为关键数字（市场规模、CAGR、玩家数据、成本、ROI）添加规范的脚注格式。
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple
from html.parser import HTMLParser

SOURCES_FILE = Path(r"D:\code\weelume-base\research-kit\output\tracks\ai-manyuju\raw\sources.json")
REPORTS_DIR = Path(r"D:\code\weelume-base\research-kit\output\tracks\ai-manyuju\reports\20260521T120000Z")

def load_sources() -> Dict[int, Dict]:
    """加载来源数据"""
    with open(SOURCES_FILE, "r", encoding="utf-8") as f:
        sources = json.load(f)
    return {src["id"]: src for src in sources}

def get_source_citation(source_id: int, sources: Dict) -> str:
    """生成脚注格式：（来源：[机构](URL)，年份）"""
    if source_id not in sources:
        return ""
    src = sources[source_id]
    site = src.get("site", "来源未知")
    url = src.get("url", "#")
    year = src.get("publish_date", "").split("-")[0]  # 提取年份
    return f'<span class="citation">（<a href="{url}" target="_blank" class="citation-link">来源：{site}，{year}</a>）</span>'

# 关键数字映射表：(关键词, 来源ID列表)
KEY_METRICS = [
    # 市场规模相关 - 按优先级排序
    ("300亿元", 4),  # 艺恩数据 2026预测
    ("220亿元", 6),  # 36氪 预测
    ("168亿", 4),    # 艺恩数据
    ("200亿", 4),    # 艺恩数据
    ("5.23万亿元", 18),  # 国家统计局

    # CAGR相关
    ("30-80%", 4),    # 艺恩数据
    ("超30%", 1),     # 共研网
    ("80%", 16),      # 播放量问题

    # 用户规模
    ("2.8亿", 4),     # 艺恩数据
    ("1.2亿", 4),     # 艺恩数据

    # 成本相关
    ("3-20万元", 11),    # 知乎成本分析
    ("350元", 11),       # 单位成本
    ("1.1-1.8倍", 11),   # ROI范围
    ("1.05倍", 11),      # 最低ROI
    ("90%", 8),          # 成本下降比例

    # 产能与内容相关
    ("2分钟", 7),        # 日均产能
    ("月入百万", 7),     # 创业收入
    ("45天", 8),         # 制作周期
    ("千万播放", 8),     # 爆款案例

    # 监管相关
    ("100万元", 12),     # 备案规定

    # 其他
    ("0.18%", 4),        # 头部占比
]

def add_citations_to_html(html_content: str, sources: Dict) -> Tuple[str, int]:
    """
    在 HTML 内容中添加脚注。
    使用更细致的策略：找到文本节点中的关键词，在其后添加脚注。
    """
    modified_content = html_content
    citation_count = 0
    processed_metrics = set()  # 追踪已处理的关键词

    for key_metric, source_id in KEY_METRICS:
        # 跳过已处理的关键词组合
        if key_metric in processed_metrics:
            continue

        # 构建正则模式，匹配关键词但避免在 HTML 属性或标签中匹配
        # 关键词后面应该是：空格、标点、标签或行尾
        pattern = rf'({re.escape(key_metric)})(?=[\s。，；、)\]\}<]|</)'

        def replacer(match):
            nonlocal citation_count
            keyword = match.group(1)
            match_start = match.start()
            match_end = match.end()

            # 检查是否已在该位置添加过脚注
            context = modified_content[match_end:match_end + 150]
            if '<span class="citation">' in context[:50]:
                # 已经有脚注了
                return keyword

            # 生成脚注
            citation = get_source_citation(source_id, sources)
            citation_count += 1
            processed_metrics.add(key_metric)
            return keyword + citation

        modified_content = re.sub(pattern, replacer, modified_content)

    return modified_content, citation_count

def process_report(report_path: Path, sources: Dict) -> int:
    """处理单份报告，返回添加的脚注数量"""
    print(f"  处理: {report_path.name}")
    with open(report_path, "r", encoding="utf-8") as f:
        content = f.read()

    modified_content, count = add_citations_to_html(content, sources)

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(modified_content)

    return count

def main():
    """主函数"""
    print("开始修复脚注...")
    sources = load_sources()
    print(f"已加载 {len(sources)} 条来源数据\n")

    # 处理 6 份报告
    report_files = [
        "00_overview.html",
        "01_market.html",
        "02_competition.html",
        "03_business_model.html",
        "04_ai_driven_analysis.html",
        "05_playbook.html",
    ]

    total_citations = 0
    report_counts = {}

    for report_name in report_files:
        report_path = REPORTS_DIR / report_name
        if report_path.exists():
            count = process_report(report_path, sources)
            report_counts[report_name] = count
            total_citations += count
            print(f"  ✓ 添加 {count} 条脚注\n")
        else:
            print(f"  ✗ 文件不存在: {report_path}\n")

    print("=" * 50)
    print("修复完成")
    print("=" * 50)
    for report_name, count in report_counts.items():
        print(f"{report_name}: {count} 条脚注")
    print(f"\n总计：{total_citations} 条脚注")

    return report_counts

if __name__ == "__main__":
    main()
