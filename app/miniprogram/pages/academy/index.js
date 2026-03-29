const academyPageData = {
  hero: {
    eyebrow: "学院内容",
    title: "AI 智能体课程培训大纲",
    text: "先用一套可展示的占位课程补齐学院页面，覆盖从业务认知、智能体设计到上线交付的完整学习路径。",
  },
  overviewList: [
    {
      label: "课程周期",
      value: "4 周训练营",
    },
    {
      label: "学习方式",
      value: "直播讲解 + 作业实战",
    },
    {
      label: "适合对象",
      value: "老板、产品、运营负责人",
    },
    {
      label: "最终目标",
      value: "做出可演示的 AI 智能体方案",
    },
  ],
  highlightList: [
    {
      title: "从业务目标倒推",
      text: "先找高频、可量化、可复用的业务动作，再决定是否值得做成智能体。",
    },
    {
      title: "每模块都有明确产出",
      text: "不是只学概念，而是逐步沉淀场景清单、流程图、知识库和演示原型。",
    },
    {
      title: "偏实战交付视角",
      text: "训练内容会覆盖提示词、工具调用、效果评估和对内对外交付表达。",
    },
  ],
  moduleList: [
    {
      id: "module-1",
      phase: "模块一",
      duration: "2 课时",
      title: "AI 智能体基础认知",
      description: "建立大模型、工作流和智能体之间的基本认知，明确智能体适合解决什么问题。",
      lessonList: ["AI 智能体定义", "典型业务场景", "项目筛选标准"],
      deliverable: "输出一份团队 AI 场景机会清单",
    },
    {
      id: "module-2",
      phase: "模块二",
      duration: "2 课时",
      title: "需求拆解与角色设计",
      description: "把业务目标拆成输入、判断、执行和输出，设计单个智能体的职责边界。",
      lessonList: ["任务拆解方法", "角色与权限", "输入输出设计"],
      deliverable: "完成一个单智能体任务流程图",
    },
    {
      id: "module-3",
      phase: "模块三",
      duration: "3 课时",
      title: "工作流编排与工具调用",
      description: "理解智能体如何调用搜索、表格、表单和内部系统，把动作真正连起来。",
      lessonList: ["工作流节点设计", "工具调用思路", "异常处理规则"],
      deliverable: "产出一个可运行的流程型智能体原型",
    },
    {
      id: "module-4",
      phase: "模块四",
      duration: "2 课时",
      title: "知识库接入与回答控制",
      description: "让智能体基于指定资料回答问题，控制回答范围、引用依据和稳定性。",
      lessonList: ["知识整理方法", "检索增强基础", "回答边界设置"],
      deliverable: "搭建一个面向内部培训的知识问答助手",
    },
    {
      id: "module-5",
      phase: "模块五",
      duration: "3 课时",
      title: "多智能体协作实战",
      description: "把调研、分析、执行和复盘拆给不同角色，形成协作式任务链路。",
      lessonList: ["多角色分工", "任务接力机制", "协作场景演练"],
      deliverable: "完成一个多智能体协作 Demo",
    },
    {
      id: "module-6",
      phase: "模块六",
      duration: "2 课时",
      title: "上线评估与商业交付",
      description: "建立效果指标、成本边界和交付话术，让智能体项目能进入真实业务。",
      lessonList: ["效果评估指标", "成本与权限", "方案包装与汇报"],
      deliverable: "整理一份可对外演示的项目交付方案",
    },
  ],
  outcomeList: [
    {
      title: "场景优先级地图",
      text: "知道哪些业务动作适合先做成智能体，哪些暂时不值得投入。",
    },
    {
      title: "单智能体原型",
      text: "至少完成一个可演示的流程型智能体，便于内部验证和汇报。",
    },
    {
      title: "知识库问答助手",
      text: "沉淀一套可复用的资料接入和回答控制方式，用于培训或客服场景。",
    },
    {
      title: "项目交付模板",
      text: "形成包含目标、流程、指标和上线建议的标准化交付材料。",
    },
  ],
};

Page({
  data: academyPageData,
});
