# 开发原则
- 对于开发者提出的任何问题，你需要首先评估置信度，当置信度低于 90% 时，你需要向用户提出澄清性问题
- 如果看到任何不合理的代码或者技术设计，你需要立即告知用户，并提出改进意见
- 遵循最最合理且最小化实现原则，禁止添加不必要的功能或依赖，禁止使用临时解决方案
- 禁止兜底方案，除非用户明确批准
- 对于需要清理或者优化的代码，必须马上告知用户，征询处理意见
- 代码必须整洁优雅，禁止动态类型，高内聚，低耦合，任何变量、常量或者函数都必须考虑复用性，禁止硬编码与重复代码
- 代码必须有清晰的中文注释和文档
- 工程结构和代码结构必须遵循工程架构规范
- 必须遵循技术栈规范，任何新增或者升级的功能或依赖都必须获得用户的批准
- 前端开发必须以组件复用有限，样式上必须通过主题系统设置
- 前后端都必须有明确的日志信息打印，日志级别必须合理，日志格式必须统一，在排查问题时你需要自己分析日志
- 如果一个错误修复过一次后，用户反馈还存着时，后续每次你必须找到上一次没有成功修复的本质原因并做出解释
- 所有代码必须符合SOLID原则要求
- 生成的文档使用中文
- 每次对话或者完成任务后，最后一行你必须打印 " ！！！ "

# 工程架构规范
- 前端：feature-based结构
- 后端：DDD + 整洁架构

# 技术栈
- React
- Tailwind CSS
- shadcn/ui
- FastAPI
- SQLAlchemy
- LangChain

# 环境

在开发过程中，你需要将前后端代码分别在 server/ 和 ui/ 下运行起来，以便进行开发和调试，并在出现问题时根据错误信息进行排查和修复

## 后端
- 在 server/ 下执行 uv run python -m uvicorn src.main:app --reload --port 8000
- 启动celery服务， ./.venv/bin/celery -A src.celery_app worker --loglevel=info 

## 前端
在 ui/ 下执行 pnpm run dev 启动前端开发服务器

# 测试规范
- 不需要前端组件级测试
- 后端必须保证有单元测试和集成测试
- 集成测试需要使用真实环境和数据运行


## 网络代理
使用 HTTPS_PROXY=http://192.168.32.1:7078 作为网络代理

## 扩展
- speckit-specify skill中所有置信度不高的问题都需要保留待澄清的标记，specify-clarify中需要对所有问题进行澄清，不仅限于5个问题
- 当执行speckit-specify时，需要对本次需求规模进行评估，如果超过2000行代码，需要拒绝执行并告知用户如何进行需求拆分


<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read specs/002-mem0-session-memory/plan.md
<!-- SPECKIT END -->
