# research-kit

资料收集与拆解平台。首版交付**抖音博主拆解**：你在 Claude Code 里说"分析这个博主：https://...."，系统自动采集 → 转录 → 抽帧 → 应用《微域生光自媒体运营实战》方法论体系 → 输出多份 HTML 报告。

---

## 端到端用法（推荐路径）

### 1. 准备依赖

```bash
cd research-kit

# 安装 Python 依赖（含 patchright / yt-dlp / faster-whisper / ffmpeg-python）
uv sync

# 安装 Patchright 的 Chromium 浏览器
uv run patchright install chromium

# 安装 ffmpeg（系统级，按平台选择）
#   Windows: winget install Gyan.FFmpeg   或   scoop install ffmpeg
#   macOS:   brew install ffmpeg
#   Linux:   apt install ffmpeg
```

### 2. 启动 Claude Code

```bash
cd research-kit
claude        # 启动 Claude Code CLI
```

Claude Code 启动时会自动装载 `.claude/skills/douyin-blogger-report-v2/`。

### 3. 在 Claude Code 里下单

直接对话：

```
> 帮我拆解这个抖音博主：https://www.douyin.com/user/MS4wLjABAAAAxxx
```

skill 自动按四个步骤编排：

```
Step 1  Bash → uv run research-kit collect --url ... --workspace output/bloggers/<id>/raw/
Step 2  Read → 读 profile.json + 各作品 meta/transcript/帧画面
Step 3  Write → output/bloggers/<id>/reports/<run_id>/overview.html + video_*.html
Step 4  Bash  → 用 Python 一行命令把 data-rk-frame 占位符替换为 base64 内嵌
```

完成后产物在 `output/bloggers/<blogger_slug>/reports/<run_id>/`。

### 4. 命令行兜底用法（无 Claude Code 时）

Python CLI 也能独立跑采集，再手工触发分析：

```bash
# 只采集
uv run research-kit collect \
  --url "https://www.douyin.com/user/MS4wLjABAAAAxxx" \
  --workspace output/bloggers/MS4wLjABAAAAxxx/raw \
  --sample-count 0

# 列出插件 / skill
uv run research-kit plugins list
uv run research-kit skill list
uv run research-kit skill validate douyin-blogger-report-v2
```

---

## 输出目录约定

```
output/
└── bloggers/
    └── <blogger_slug>/              # 通常用主页 URL 的 sec_uid
        ├── raw/                     # 采集到的原始素材
        │   ├── profile.json         # 博主资料
        │   ├── sampling.json        # 抽样元信息
        │   └── <aweme_id>/
        │       ├── meta.json
        │       ├── transcript.txt
        │       ├── 1.jpg ~ 4.jpg
        │       └── source.mp4       # 默认转录后清理；--keep-video 可保留
        └── reports/
            └── <run_id>/            # 每次拆解一个新 run_id
                ├── overview.html    # 博主全景拆解
                ├── video_<aweme_id>.html × N  # 每条代表作品独立拆解
                └── index.json       # 产物索引
```

`<blogger_slug>` 取 `sec_uid`（主页 URL 中 `/user/<sec_uid>` 段），`<run_id>` 是 UTC ISO 紧凑格式时间戳。

---

## 架构（三层插件）

```
collectors → 采集器：把外部世界的数据落到 workspace
              首版：douyin-browser（Patchright + yt-dlp + ffmpeg + faster-whisper）

analyzers → 分析器：本工程不直接调 LLM；分析由 Claude Code skill 完成
              CLI 中的 douyin-blogger 仅占位，方便未来加入"无人值守批量分析"路径

reporters → 报告器：HTML 后处理
              当前 html-multi 是简单实现，复杂的图片内嵌交给 skill 中的 Bash 步骤

core      → contracts / pipeline / registry / settings / logging / llm / skills / workspace
              提供插件协议、注册表、编排器、配置、日志、LLM 抽象、skill 加载
```

新增模块（小红书博主 / B 站 UP / 赛道竞品）只需新增一个 collector + 一个 skill + 一个 reporter，不动 core。

---

## 配置（环境变量）

| 变量 | 用途 | 默认 |
|------|------|------|
| `HTTPS_PROXY` / `https_proxy` | yt-dlp 与 Patchright 走代理 | 无 |
| `RESEARCH_KIT_WHISPER_MODEL` | faster-whisper 模型名 | `large-v3` |
| `WHISPER_CACHE_DIR` | Whisper 模型缓存目录 | `~/.cache/whisper` |
| `RESEARCH_KIT_LOG_LEVEL` | 日志级别 | `INFO` |
| `ANTHROPIC_API_KEY` | 仅在用 Python 端 LLM 路径时需要（默认走 Claude Code 路径不需要） | 无 |
| `RESEARCH_KIT_PUBLISH_ENV` | `research-kit publish` 默认环境名 | 取 `publish-envs.toml` 中的 `default` |
| `RESEARCH_KIT_PUBLISH_ENVS_FILE` | 覆盖默认 `publish-envs.toml` 路径 | 自动在 `cwd` 与 `research-kit/` 项目根查找 |
| `WEELUME_API_BASE` | 兼容回退：未配置 envs 文件时使用的 API 基地址 | 无 |
| `WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN` | 兼容回退：未配置 envs 文件时使用的 import token | 无 |

---

## 发布博主分析报告（分环境）

`research-kit publish` 把 workspace 下的 `overview.html` + `profile.json` 推到 Weelume 后端的 `POST /api/v1/blogger-insights/import`。

### 配置环境

`research-kit/publish-envs.toml`（已入仓库）声明所有可用环境：

```toml
default = "local"

[envs.local]
api_base = "http://localhost:8000"
token_env = "WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN_LOCAL"

[envs.prod]
api_base = "https://api.weelume.com"
token_env = "WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN_PROD"
```

token 不入仓库：每个环境通过 `token_env` 指定一个本地环境变量名。例如：

```bash
export WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN_LOCAL="<本地后端 token>"
export WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN_PROD="<生产后端 token>"
```

需要个性化覆盖（例如反向代理或多份 token）时，把另一份 TOML 通过 `--envs-file` 或 `RESEARCH_KIT_PUBLISH_ENVS_FILE` 指过去即可，仓库内的文件无需修改。

### 上传

```bash
# 默认环境（publish-envs.toml 中 default = "local"）
uv run research-kit publish --workspace output/bloggers/<blogger_slug>

# 指定环境
uv run research-kit publish --workspace output/bloggers/<blogger_slug> --env prod

# 仅打印 payload，不发 HTTP，先确认产物没问题
uv run research-kit publish --workspace output/bloggers/<blogger_slug> --env prod --dry-run

# 临时覆盖 api_base / token，不走 envs 文件
uv run research-kit publish --workspace output/bloggers/<blogger_slug> \
  --api-base http://localhost:8000 --token tk-xxx
```

`api_base` / `token` 的解析优先级（由高到低）：

1. CLI 显式 `--api-base` / `--token`；
2. 选中环境（`--env` → `RESEARCH_KIT_PUBLISH_ENV` → 文件中的 `default`）下的 `api_base` 与 `token_env` 指定的环境变量；
3. 兼容回退：`WEELUME_API_BASE` / `WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN`（仅在找不到 envs 文件时生效）。

---

## 抖音登录态（按需）

抖音首次访问可能要求登录。两种处理：

1. **`--user-data-dir`**（推荐）：传一个持久化目录，浏览器首次打开时人工登录一次，后续自动复用：

   ```bash
   uv run research-kit collect --url ... --workspace ... --user-data-dir ./.cache/douyin-profile
   ```

2. **`--storage-state`**：用 `export-cookies` skill 把已登录 Chrome 的 cookies 导出为 `storage_state.json`，再传给 collect：

   ```bash
   uv run research-kit collect --url ... --workspace ... --storage-state ./.cache/storage_state.json
   ```

---

## 开发

```bash
uv sync --dev
uv run pytest tests/unit -q           # 单元测试
uv run pyright                        # 类型检查
uv run research-kit --version
```

---


# 导入博主拆解

token 直接通过 `--token` 参数传入；优先级高于 `publish-envs.toml` 的 `token_env`，
也不依赖环境变量。`<生产 token>` 替换为生产那台机器配的 `MZ_AI_BACKEND_BLOGGER_INSIGHT_IMPORT_TOKEN` 值。

```powershell
# 进 research-kit 目录
cd D:\code\weelume-base\research-kit

# 1) 先 dry-run，确认 payload 没问题（不发 HTTP）
uv run research-kit publish `
  --workspace output\bloggers\MS4wLjABAAAA4LqLxq7PLK9xEB5PPazcKTG-3oInPFTDwbqiSrRL_mg `
  --env prod `
  --token "<生产 token>" `
  --dry-run

# 2) 真正上传到生产
uv run research-kit publish `
  --workspace output\bloggers\MS4wLjABAAAA4LqLxq7PLK9xEB5PPazcKTG-3oInPFTDwbqiSrRL_mg `
  --env prod `
  --token "<生产 token>"
```
