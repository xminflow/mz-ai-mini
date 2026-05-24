import json
import re
from pathlib import Path

SOURCES_FILE = Path(r"D:\code\weelume-base\research-kit\output\tracks\ai-manyuju\raw\sources.json")
REPORTS_DIR = Path(r"D:\code\weelume-base\research-kit\output\tracks\ai-manyuju\reports\20260521T120000Z")

with open(SOURCES_FILE, "r", encoding="utf-8") as f:
    sources_list = json.load(f)
sources = {src["id"]: src for src in sources_list}

def get_source_citation(source_id):
    if source_id not in sources:
        return ""
    src = sources[source_id]
    site = src.get("site", "来源未知")
    url = src.get("url", "#")
    year = src.get("publish_date", "").split("-")[0]
    return f'<span class="citation">（<a href="{url}" target="_blank" class="citation-link">来源：{site}，{year}</a>）</span>'

KEY_METRICS = [
    ("300亿元", 4), ("220亿元", 6), ("168亿", 4), ("200亿", 4), ("5.23万亿元", 18),
    ("30-80%", 4), ("超30%", 1), ("80%", 16),
    ("2.8亿", 4), ("1.2亿", 4),
    ("3-20万元", 11), ("350元", 11), ("1.1-1.8倍", 11), ("1.05倍", 11), ("90%", 8),
    ("2分钟", 7), ("月入百万", 7), ("45天", 8), ("千万播放", 8), ("100万元", 12), ("0.18%", 4),
]

def add_citations(html_content, sources):
    modified = html_content
    count = 0
    processed = set()

    for key_metric, source_id in KEY_METRICS:
        if key_metric in processed:
            continue
        pattern = rf'({re.escape(key_metric)})(?=[\s。，；、)\]\}<]|</)'
        def replacer(m):
            nonlocal count
            keyword = m.group(1)
            context = modified[m.end():m.end() + 150]
            if '<span class="citation">' in context[:50]:
                return keyword
            citation = get_source_citation(source_id)
            count += 1
            processed.add(key_metric)
            return keyword + citation
        modified = re.sub(pattern, replacer, modified)
    return modified, count

print(f"已加载 {len(sources)} 条来源数据\n")

report_files = ["00_overview.html", "01_market.html", "02_competition.html", "03_business_model.html", "04_ai_driven_analysis.html", "05_playbook.html"]
total = 0

for report_name in report_files:
    report_path = REPORTS_DIR / report_name
    if report_path.exists():
        with open(report_path, "r", encoding="utf-8") as f:
            content = f.read()
        modified, count = add_citations(content, sources)
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(modified)
        print(f"✓ {report_name}: {count} 条脚注")
        total += count
    else:
        print(f"✗ {report_name}: 不存在")

print(f"\n总计：{total} 条脚注")
