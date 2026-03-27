from __future__ import annotations

import asyncio
import sys
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


PROJECT_ROOT = Path(__file__).resolve().parents[1]
API_SRC = PROJECT_ROOT / "api" / "src"

if str(API_SRC) not in sys.path:
    sys.path.insert(0, str(API_SRC))

from mz_ai_backend.core import get_settings
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator


BASE_IMAGE_URL = "https://dummyimage.com/1200x800/f3ede3/6d4d39.png&text="
DOCUMENT_IMAGE_URL = "https://dummyimage.com/1200x800/efe8dc/6d4d39.png&text=MZ+AI+Document"


@dataclass(frozen=True)
class DocumentSeed:
    document_type: str
    title: str
    markdown_content: str


@dataclass(frozen=True)
class BusinessCaseSeed:
    title: str
    summary: str
    cover_image_url: str
    documents: tuple[DocumentSeed, DocumentSeed, DocumentSeed]


def _build_document_set(
    *,
    business_case_title: str,
    business_case_content: str,
    market_research_title: str,
    market_research_content: str,
    ai_upgrade_title: str,
    ai_upgrade_content: str,
) -> tuple[DocumentSeed, DocumentSeed, DocumentSeed]:
    return (
        DocumentSeed(
            document_type="business_case",
            title=business_case_title,
            markdown_content=business_case_content.strip(),
        ),
        DocumentSeed(
            document_type="market_research",
            title=market_research_title,
            markdown_content=market_research_content.strip(),
        ),
        DocumentSeed(
            document_type="ai_business_upgrade",
            title=ai_upgrade_title,
            markdown_content=ai_upgrade_content.strip(),
        ),
    )


LOCAL_DEV_CASE_SEEDS: tuple[BusinessCaseSeed, ...] = (
    BusinessCaseSeed(
        title="把咨询经验做成可复用的付费内容",
        summary="一个本地咨询团队把线下交付经验整理成知识产品，并逐步扩展为标准化的线上增长流程。",
        cover_image_url=f"{BASE_IMAGE_URL}MZ+AI+01",
        documents=_build_document_set(
            business_case_title="从线下服务到线上知识产品",
            business_case_content="""
# 项目起点

团队原本依赖创始人一对一咨询，交付质量很高，但规模增长受到明显限制。

## 第一步

他们先把高频问题整理成标准问卷，再把问卷结果沉淀成固定诊断模板。

## 第二步

随后把交付流程拆成课程、工具包和陪跑答疑三部分，让低客单用户也能快速进入服务体系。
""",
            market_research_title="市场调研与用户需求判断",
            market_research_content="""
# 用户洞察

目标用户并不缺信息，真正缺的是基于真实案例的执行顺序和判断标准。

## 渠道发现

团队发现短内容更适合获取线索，而长内容更适合完成转化和筛选。

## 付费意愿

只要案例足够具体，并能明确展示结果与路径，用户愿意为结构化内容持续付费。
""",
            ai_upgrade_title="AI 升级与交付效率改造",
            ai_upgrade_content="""
# AI 升级策略

团队没有直接替换顾问，而是先用 AI 完成信息整理、初稿生成和案例归档。

## 交付提效

顾问只处理关键判断和策略取舍，重复性的文字整理交给 AI 助手完成。

## 后续扩展

当案例库逐步积累后，团队可以继续把常见问题做成自动化问答和内容推荐系统。
""",
        ),
    ),
    BusinessCaseSeed(
        title="把家政门店的培训体系做成订阅产品",
        summary="一家区域家政品牌把门店培训、考核和复训体系产品化，最终形成持续续费的 SaaS 服务。",
        cover_image_url=f"{BASE_IMAGE_URL}MZ+AI+02",
        documents=_build_document_set(
            business_case_title="从门店培训手册到可订阅交付",
            business_case_content="""
# 背景

门店扩张之后，培训质量开始依赖店长个人经验，复制速度跟不上开店速度。

## 产品拆分

团队把培训内容拆成岗位标准、操作视频、巡检表和绩效追踪四个固定模块。

## 商业化

先服务自有门店验证流程，再打包成月度订阅交付给加盟店和同行门店。
""",
            market_research_title="本地生活连锁培训的需求验证",
            market_research_content="""
# 访谈结论

大量门店并不缺培训内容，真正缺的是持续跟踪执行和跨门店对比的能力。

## 竞品观察

多数竞品只卖录播课，没有把巡检和数据反馈做成闭环。

## 购买因素

门店老板更关心上手成本和留存率，而不是系统功能数量。
""",
            ai_upgrade_title="用 AI 降低培训运营成本",
            ai_upgrade_content="""
# AI 用法

AI 用于把门店巡检记录自动整理成复盘摘要，并生成下周改进建议。

## 内容更新

当门店提报新问题时，运营团队先用 AI 生成新版培训草稿，再人工校对发布。

## 结果

单个客户的运营投入显著下降，续费客户数量开始稳定增长。
""",
        ),
    ),
    BusinessCaseSeed(
        title="为制造企业做设备维保知识库服务",
        summary="一个工业服务团队从项目制顾问服务切入，把设备维保经验沉淀成付费知识库与现场辅导套餐。",
        cover_image_url=f"{BASE_IMAGE_URL}MZ+AI+03",
        documents=_build_document_set(
            business_case_title="项目交付经验的产品化路径",
            business_case_content="""
# 早期模式

团队最初按次收取设备诊断费，收入高但波动大，难以形成稳定现金流。

## 知识库化

他们把高频故障、检查流程和零件更换建议整理成企业内部可检索的知识条目。

## 套餐设计

最终形成知识库订阅、季度巡检和远程答疑三档服务，适配不同规模客户。
""",
            market_research_title="工业客户采购偏好分析",
            market_research_content="""
# 客户决策链

维保负责人关注响应速度，采购部门关注合同周期，老板关注停机损失是否下降。

## 竞争格局

市场上多数供应商要么只卖硬件，要么只卖现场服务，中间缺少持续知识服务。

## 付费逻辑

一旦能把停机损失量化，客户对订阅式服务的接受度会明显提升。
""",
            ai_upgrade_title="用 AI 辅助故障归因与知识更新",
            ai_upgrade_content="""
# 数据整理

AI 先把现场工程师的维修记录标准化，再按设备型号和故障类型自动归档。

## 诊断辅助

一线团队可以先通过 AI 获取初步排查顺序，再决定是否升级到高级工程师介入。

## 效率变化

重复问题的处理时间明显缩短，知识库更新速度也更稳定。
""",
        ),
    ),
    BusinessCaseSeed(
        title="把留学咨询服务拆成阶段化课程包",
        summary="一家留学咨询工作室把高客单定制服务拆分成申请准备课程、文书工坊和一对一冲刺包，扩大了客群覆盖范围。",
        cover_image_url=f"{BASE_IMAGE_URL}MZ+AI+04",
        documents=_build_document_set(
            business_case_title="高客单咨询的分层交付设计",
            business_case_content="""
# 原始问题

完全定制化服务依赖核心顾问，单顾问的服务容量很快触顶。

## 分层策略

团队把服务拆成前期准备、中期申请和后期冲刺三个阶段，让不同预算用户进入不同层级产品。

## 收益结构

低价课程负责引流和筛选，高价冲刺包负责利润和口碑沉淀。
""",
            market_research_title="学生与家长决策需求分析",
            market_research_content="""
# 用户关切

学生关心执行步骤，家长关心时间安排和结果确定性。

## 市场判断

公开信息很多，但真正能陪用户走完整流程的阶段化产品并不多。

## 转化节点

文书阶段和选校阶段是最容易产生加购的两个关键节点。
""",
            ai_upgrade_title="AI 在文书和答疑中的辅助作用",
            ai_upgrade_content="""
# 文书提效

AI 先生成结构化文书草稿，顾问再补充个性化经历和申请策略。

## 答疑分流

高频问题优先交给 AI 助手回答，复杂问题再进入人工顾问队列。

## 结果

团队在不增加顾问人数的情况下，提升了服务用户总量。
""",
        ),
    ),
    BusinessCaseSeed(
        title="给餐饮连锁做私域复购运营模板",
        summary="一家代运营团队把餐饮私域增长方法沉淀成模板化服务，帮助门店降低活动策划和群运营的人力成本。",
        cover_image_url=f"{BASE_IMAGE_URL}MZ+AI+05",
        documents=_build_document_set(
            business_case_title="从代运营到模板化交付",
            business_case_content="""
# 起步方式

早期团队按月做代运营，但每家门店都要单独策划活动，交付边际成本很高。

## 模板沉淀

他们把节日活动、会员召回、套餐上新和社群话术做成标准模板库。

## 产品升级

门店可以按月订阅模板和执行建议，复杂场景再叠加人工托管服务。
""",
            market_research_title="餐饮门店复购痛点调研",
            market_research_content="""
# 门店反馈

多数门店并不缺活动想法，而是缺持续执行和复盘能力。

## 竞品问题

很多工具强调发券和群发，却没有给出具体活动脚本和话术结构。

## 成交因素

客户更愿意为“直接能用”的模板和数据反馈买单。
""",
            ai_upgrade_title="AI 生成活动脚本与复盘摘要",
            ai_upgrade_content="""
# 活动生成

AI 基于门店品类、客单价和历史活动数据生成活动脚本初稿。

## 数据复盘

活动结束后，AI 会自动整理核心指标变化并给出下一轮优化建议。

## 效果

运营人员能把更多时间放在策略判断，而不是重复撰写文案。
""",
        ),
    ),
    BusinessCaseSeed(
        title="把律师团队的模板文书服务做成会员库",
        summary="一个律师创业团队把常用文书、审核清单和咨询问答整理成会员产品，降低了初级咨询的获客成本。",
        cover_image_url=f"{BASE_IMAGE_URL}MZ+AI+06",
        documents=_build_document_set(
            business_case_title="会员制法律服务的产品边界",
            business_case_content="""
# 业务背景

团队发现大量咨询都停留在初级问题，用户不愿直接购买高价法律服务。

## 产品定义

于是他们先提供文书模板库、风险检查清单和基础视频课，再引导有复杂问题的用户升级。

## 收益模式

会员费负责覆盖内容维护成本，专项服务负责贡献主要利润。
""",
            market_research_title="中小企业法律需求分析",
            market_research_content="""
# 需求特点

中小企业最常见的是合同、劳务和应收款相关问题，且处理时效要求高。

## 竞品分析

纯问答平台价格低，但缺少结构化模板和后续升级路径。

## 购买驱动

当模板足够贴近真实业务场景时，用户更容易先成为会员。
""",
            ai_upgrade_title="AI 辅助法务问答分流",
            ai_upgrade_content="""
# 初筛逻辑

AI 先识别问题类别与紧急程度，把标准化问题留在会员层解决。

## 文书生成

在明确场景后，AI 会按模板生成初稿，律师只做关键条款复核。

## 运营价值

团队能把更多时间留给高价值专项项目，而不是重复答基础问题。
""",
        ),
    ),
    BusinessCaseSeed(
        title="将健身工作室的陪跑服务变成线上训练营",
        summary="一个健身工作室从线下私教延伸到线上训练营，用阶段目标、打卡机制和饮食模板构建持续复购产品。",
        cover_image_url=f"{BASE_IMAGE_URL}MZ+AI+07",
        documents=_build_document_set(
            business_case_title="线下私教模式的线上扩展",
            business_case_content="""
# 早期挑战

线下私教客单高，但受时间和场地限制，无法快速扩展。

## 训练营方案

团队将减脂、塑形和体态矫正拆成不同训练营，每期设置统一节奏和任务卡。

## 用户路径

用户先加入低门槛训练营，再根据结果升级到线下私教或长期会员计划。
""",
            market_research_title="用户对线上健身服务的接受度",
            market_research_content="""
# 用户诉求

多数用户需要的是被督促和被反馈，而不是更多训练动作讲解。

## 市场观察

纯录播课程完课率低，而有陪跑和打卡机制的产品更容易形成留存。

## 付费窗口

用户在拿到第一个明显结果后，最容易续费到下一阶段产品。
""",
            ai_upgrade_title="AI 用于饮食记录和动作反馈",
            ai_upgrade_content="""
# 饮食分析

AI 读取用户上传的饮食记录并给出热量估算和宏量营养建议。

## 训练反馈

对于标准动作，AI 可以先做初步识别，再由教练处理高风险动作纠正。

## 团队收益

教练人效提升后，训练营规模可以明显扩大。
""",
        ),
    ),
    BusinessCaseSeed(
        title="给跨境卖家提供 AI 商品素材工厂",
        summary="一个内容团队围绕跨境电商卖家做图文和视频素材服务，后来把流程沉淀成 AI 驱动的素材工厂。",
        cover_image_url=f"{BASE_IMAGE_URL}MZ+AI+08",
        documents=_build_document_set(
            business_case_title="跨境卖家素材服务的标准化",
            business_case_content="""
# 起点

团队原本按件交付商品图和短视频，但每个客户都在重复描述商品卖点和适用场景。

## 流程抽象

他们先建立卖点采集表和素材脚本模板，再将不同平台的输出格式标准化。

## 产品形态

最终形成按 SKU 计费的素材生成服务，并辅以高优先级人工修改套餐。
""",
            market_research_title="跨境卖家内容生产的核心约束",
            market_research_content="""
# 用户痛点

卖家最头痛的是新品上架速度、素材版本迭代和不同平台风格适配。

## 竞品现状

很多工具只能生成单张图片，无法覆盖多平台素材协同。

## 商业机会

只要能稳定缩短新品上线周期，客户就愿意持续采购。
""",
            ai_upgrade_title="AI 驱动的多平台素材生产",
            ai_upgrade_content="""
# 生成流程

AI 先根据卖点和人群自动生成脚本、标题和图像提示词，再进入人工审核。

## 版本管理

团队把素材版本与投放数据关联起来，持续反推更有效的创意方向。

## 结果

交付速度和单位人效同步提升，客户续单率也变得更稳定。
""",
        ),
    ),
)


def _generate_snowflake_id(generator: SnowflakeGenerator) -> int:
    """Return one business identifier from the shared snowflake generator."""

    return generator.generate()


def _filter_missing_case_seeds(
    case_seeds: tuple[BusinessCaseSeed, ...],
    existing_titles: set[str],
) -> tuple[BusinessCaseSeed, ...]:
    return tuple(seed for seed in case_seeds if seed.title not in existing_titles)


async def _insert_case_seed(
    *,
    connection,
    snowflake: SnowflakeGenerator,
    case_seed: BusinessCaseSeed,
    published_at: datetime,
) -> str:
    case_id = str(_generate_snowflake_id(snowflake))
    await connection.execute(
        text(
            """
            INSERT INTO business_cases (
                case_id,
                title,
                summary,
                cover_image_url,
                status,
                published_at,
                is_deleted,
                created_at,
                updated_at
            ) VALUES (
                :case_id,
                :title,
                :summary,
                :cover_image_url,
                'published',
                :published_at,
                0,
                :created_at,
                :updated_at
            )
            """
        ),
        {
            "case_id": case_id,
            "title": case_seed.title,
            "summary": case_seed.summary,
            "cover_image_url": case_seed.cover_image_url,
            "published_at": published_at,
            "created_at": published_at,
            "updated_at": published_at,
        },
    )

    for document_seed in case_seed.documents:
        await connection.execute(
            text(
                """
                INSERT INTO business_case_documents (
                    document_id,
                    case_id,
                    document_type,
                    title,
                    markdown_content,
                    cover_image_url,
                    is_deleted,
                    created_at,
                    updated_at
                ) VALUES (
                    :document_id,
                    :case_id,
                    :document_type,
                    :title,
                    :markdown_content,
                    :cover_image_url,
                    0,
                    :created_at,
                    :updated_at
                )
                """
            ),
            {
                "document_id": _generate_snowflake_id(snowflake),
                "case_id": case_id,
                "document_type": document_seed.document_type,
                "title": document_seed.title,
                "markdown_content": document_seed.markdown_content,
                "cover_image_url": DOCUMENT_IMAGE_URL,
                "created_at": published_at,
                "updated_at": published_at,
            },
        )

    return case_id


async def seed_local_dev_data() -> None:
    settings = get_settings()
    if settings.database_url is None:
        raise RuntimeError("Database is not configured.")

    snowflake = get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )
    engine = create_async_engine(settings.database_url, pool_pre_ping=True, future=True)
    now = datetime.now(UTC).replace(tzinfo=None)

    try:
        async with engine.begin() as connection:
            result = await connection.execute(
                text(
                    """
                    SELECT title
                    FROM business_cases
                    WHERE is_deleted = 0
                    """
                )
            )
            existing_titles = {row[0] for row in result.fetchall()}
            missing_case_seeds = _filter_missing_case_seeds(
                LOCAL_DEV_CASE_SEEDS,
                existing_titles,
            )

            if not missing_case_seeds:
                print("Skipped seeding local data because all local cases already exist.")
                return

            inserted_case_ids: list[str] = []
            total_cases = len(missing_case_seeds)

            for index, case_seed in enumerate(missing_case_seeds):
                published_at = now - timedelta(minutes=(total_cases - index) * 7)
                case_id = await _insert_case_seed(
                    connection=connection,
                    snowflake=snowflake,
                    case_seed=case_seed,
                    published_at=published_at,
                )
                inserted_case_ids.append(case_id)

            print(
                "Seeded local development business cases: "
                + ", ".join(str(case_id) for case_id in inserted_case_ids)
            )
    finally:
        await engine.dispose()


def main() -> None:
    asyncio.run(seed_local_dev_data())


if __name__ == "__main__":
    main()
