import type { Copy } from './data'

export interface GroviaCase {
  slug: string
  name: string
  year: string
  summary: Copy
  author: Copy
  role: Copy
  cover: string
  avatar: string
  gallery: string[]
  body: { kind: 'heading' | 'text'; copy: Copy }[]
}

/** 参考站六篇案例的本地双语内容；所有指标与企业关系均为模板演示。 */
export const cases: GroviaCase[] = [
  {
    "slug": "pluto",
    "name": "Pluto",
    "year": "2025",
    "summary": [
      "帮助 Pluto 扩大产品团队，优化新市场拓展中的入职与协作流程。",
      "Helped Pluto scale their product team and streamline onboarding as they expanded into new markets."
    ],
    "author": [
      "Talia Nguyen",
      "Talia Nguyen"
    ],
    "role": [
      "产品负责人",
      "Head of Product"
    ],
    "cover": "GbBc9mhfKJcbf9dYU8SP2Sl4q2Y",
    "avatar": "5JOZsibBgQ896ZHozxgNAzUBVR4",
    "gallery": [
      "jnCDdyWbWDpI0KLscILfiOJFdUQ",
      "d8Ji4vUm6Gh4OrMTz7StsTzrD8",
      "i19VjdFANZHt9JTiqEGW6Jtjs",
      "gHI3aD3t6saRzn6G3BAAJgCpfQ"
    ],
    "body": [
      {
        "kind": "heading",
        "copy": [
          "提升工作流效率",
          "Enhancing workflow efficiency"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "我们与 Pluto 合作梳理内部运营，完整分析支付处理和合规流程，识别重复工作并引入自动化。在保持合规准确性的同时，运营效率提升了 25%。",
          "Weelume partnered with Pluto to streamline their internal operations. By mapping out their entire payment processing and compliance workflows, we identified inefficiencies and implemented automation to reduce manual tasks. The result was a 25% increase in operational speed without compromising compliance accuracy."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "通过集成方案安全扩展",
          "Scaling securely with integrated solutions"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "我们制定定制化集成方案，将 Pluto 的内部系统与第三方合规工具、实时报表看板连接起来。管理团队可以及时了解交易动态，同时保持数据安全与更新。",
          "Weelume introduced a custom integration plan, connecting Pluto’s internal systems with third-party compliance tools and real-time reporting dashboards. This gave leadership immediate visibility into transactions while ensuring that data remained secure and up-to-date."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "组建支持产品创新的专业团队",
          "Building a specialized team to support product innovation"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "我们帮助 Pluto 在反欺诈、金融合规和 AI 分析等关键领域引入人才，推动以下改进：",
          "We helped Pluto recruit talent in critical areas such as fraud prevention, financial compliance, and AI-driven analytics. These hires enabled Pluto to:"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "增强欺诈识别算法",
          "Enhance fraud detection algorithms"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "提升支付对账速度",
          "Improve payment reconciliation speed"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "保持高标准的监管合规。多元专业能力帮助 Pluto 更有信心地进入新市场。",
          "Maintain high regulatory standardsThis combination of skills positioned Pluto to expand confidently into new markets."
        ]
      }
    ]
  },
  {
    "slug": "vitahealth",
    "name": "VitaHealth",
    "year": "2024",
    "summary": [
      "与 VitaHealth 合作，从零搭建首支运营团队。",
      "Partnered with VitaHealth to set up their first operations team from the ground up."
    ],
    "author": [
      "Sophia Reynolds",
      "Sophia Reynolds"
    ],
    "role": [
      "创始人兼首席执行官",
      "Founder & CEO"
    ],
    "cover": "fEZRQ62xlJ9xwQLxicOdGBSDhks",
    "avatar": "1JLcyy49HvTioMcZV1g1m1DB0gg",
    "gallery": [
      "8GYO8shUN1tPhLnSlp80uKqWw",
      "jnCDdyWbWDpI0KLscILfiOJFdUQ",
      "i19VjdFANZHt9JTiqEGW6Jtjs"
    ],
    "body": [
      {
        "kind": "heading",
        "copy": [
          "改善患者参与体验",
          "Improving patient engagement"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "VitaHealth 希望将分散的患者服务工具整合为统一系统。我们分析现有沟通流程，搭建涵盖预约、随访和健康提醒的平台，首个季度患者满意度提升了 18%。",
          "VitaHealth approached Weelume to consolidate its fragmented patient engagement tools into a single, cohesive system. Our team analyzed their existing patient communication workflows and built a central platform that unified appointment scheduling, follow-ups, and wellness reminders. This improved patient satisfaction scores by 18% within the first quarter."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "引入医疗科技专业人才",
          "Recruiting healthcare technology specialists"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "我们组建了由体验设计师、医疗合规专家和数据工程师组成的团队，共同重构 VitaHealth 数字平台，实现以下目标：",
          "We assembled a team of UX designers, healthcare compliance experts, and data engineers to redesign VitaHealth’s digital platform. The combined expertise allowed VitaHealth to:"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "90 天内上线新版患者门户",
          "Launch an updated patient portal in just 90 days"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "集成安全的远程医疗功能",
          "Integrate secure telemedicine features"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "按计划满足 HIPAA 合规要求",
          "Meet HIPAA compliance requirements without delays"
        ]
      }
    ]
  },
  {
    "slug": "boxmedia",
    "name": "BoxMedia",
    "year": "2025",
    "summary": [
      "帮助创意机构 BoxMedia 建立客户成功团队与内部交付流程。",
      "Supported BoxMedia, a creative agency, in building their client success team and internal delivery process."
    ],
    "author": [
      "Lucas Rivera",
      "Lucas Rivera"
    ],
    "role": [
      "首席财务官",
      "CFO"
    ],
    "cover": "iMIRGmhG7sG5B1U2ufasrF2auLw",
    "avatar": "3ipsfIRe38epPP7KIRIcBwg3YQE",
    "gallery": [
      "Cc1Oi6JaxT20aFn26enDLLfoHNE",
      "jnCDdyWbWDpI0KLscILfiOJFdUQ",
      "sB0AlyNXE1RZku4nXPNqqdxKcw"
    ],
    "body": [
      {
        "kind": "heading",
        "copy": [
          "简化内容制作流程",
          "Streamlining content production"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "我们帮助 BoxMedia 简化跨平台内容制作与分发，建立连接创意团队、编辑与分发伙伴的集中式项目空间。重复工作减少，内容交付周期缩短了 35%。",
          "BoxMedia partnered with Weelume to simplify its content creation and distribution workflows across multiple platforms. We created a centralized project management environment that connected creative teams, editors, and distribution partners. This eliminated redundancy and reduced content turnaround time by 35%."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "为创意协作组建合适的团队",
          "Building the right team for creative excellence"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "通过引入视频剪辑、数字营销和内容元数据优化人才，BoxMedia 能够：",
          "Our recruitment process brought in specialists in video editing, digital marketing, and metadata optimization. With these experts, BoxMedia was able to:"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "更快地制作高品质内容",
          "Produce higher-quality content faster"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "提升内容在流媒体平台的可发现性",
          "Improve discoverability on streaming platforms"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "将多语言内容服务拓展至新市场",
          "Expand its multilingual offerings to new markets"
        ]
      }
    ]
  },
  {
    "slug": "novatech",
    "name": "NovaTech",
    "year": "2023",
    "summary": [
      "为 NovaTech 优化营销、产品和销售团队之间的跨职能协作。",
      "Helped NovaTech optimize cross-functional collaboration between marketing, product, and sales teams."
    ],
    "author": [
      "Lucas Rivera",
      "Lucas Rivera"
    ],
    "role": [
      "首席财务官",
      "CFO"
    ],
    "cover": "SQDinHPcWPca5iP6KL4gHvZ6o",
    "avatar": "3ipsfIRe38epPP7KIRIcBwg3YQE",
    "gallery": [
      "d8Ji4vUm6Gh4OrMTz7StsTzrD8",
      "IDyjKDlbgxTKrCTLP7qHpHirP7c",
      "BzPW0jUUUxE4hX7fw9b7KUDcy7A",
      "jnCDdyWbWDpI0KLscILfiOJFdUQ",
      "zJPpSnRQ5lX1WWRuViToRqo8E"
    ],
    "body": [
      {
        "kind": "heading",
        "copy": [
          "加快产品开发节奏",
          "Accelerating product development cycles"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "NovaTech 需要可扩展的产品路线图管理与跨部门协作方案。我们引入统一项目管理工具，使工程、设计和营销团队同步推进，功能发布周期从 8 周缩短至 5 周。",
          "NovaTech needed a scalable solution to manage product roadmaps and cross-department collaboration. Weelume implemented a unified project management tool that allowed engineering, design, and marketing teams to work in sync. This reduced feature release cycles from 8 weeks to 5 weeks."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "引入优秀的工程与产品人才",
          "Recruiting top-tier engineering and product talent"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "我们协助招募软件架构、云基础设施和 UI/UX 设计专家，为 NovaTech 带来以下提升：",
          "Weelume sourced and onboarded specialists in software architecture, cloud infrastructure, and UI/UX design. This new talent pool enabled NovaTech to:"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "发布更稳定的产品更新",
          "Launch more stable product updates"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "通过精细化设计改善用户体验",
          "Improve user experience with design-focused refinements"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "进入新兴科技细分市场",
          "Expand into emerging tech segments"
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "将绩效追踪融入日常运营",
          "Integrating performance tracking"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "我们在 NovaTech 内部系统中部署分析工具，实时跟踪研发效率、缺陷率和用户反馈，为管理团队提供可执行的洞察，支持快速调整与更有依据的产品决策。",
          "We deployed an analytics suite within NovaTech’s internal systems to track engineering velocity, defect rates, and user feedback in real time. These metrics provided leadership with actionable insights, enabling faster pivots and more strategic product decisions."
        ]
      }
    ]
  },
  {
    "slug": "naviai",
    "name": "NaviAI",
    "year": "2025",
    "summary": [
      "携手 AI 导航企业 NaviAI 扩展技术团队，加快产品研发。",
      "NaviAI, an emerging leader in AI-driven navigation systems, partnered with Weelume to scale their technical team."
    ],
    "author": [
      "Emily Johnson",
      "Emily Johnson"
    ],
    "role": [
      "首席设计师",
      "Lead Designer"
    ],
    "cover": "qWx3mbji2O8xAAQDxpVT553yns",
    "avatar": "gzG7bFgpnd9oIc2KDOhkJY5GYo",
    "gallery": [
      "d8Ji4vUm6Gh4OrMTz7StsTzrD8",
      "oRgzyzvrKu4lkMxfbPWiwaj9iI",
      "Cc1Oi6JaxT20aFn26enDLLfoHNE"
    ],
    "body": [
      {
        "kind": "heading",
        "copy": [
          "识别人才缺口与战略需求",
          "Identifying gaps and strategic needs"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "在组建团队前，我们与 NaviAI 一起梳理增长路线，明确 AI 模型训练、数据工程和体验设计等关键岗位需求。将招聘与产品目标对齐，让每位新成员都能支持长期发展。",
          "Before building the team, Weelume worked closely with NaviAI to understand their growth roadmap and pinpoint specific talent gaps. This included identifying critical roles in AI model training, data engineering, and UX design. By aligning team-building with product goals, we ensured every new hire contributed directly to the company’s long-term vision."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "组建专业协作团队",
          "Building a specialized team"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "借助招聘与项目管理流程，我们快速寻找、评估并引入合适人才，组建工程师、数据科学家和产品经理相互配合的团队，并平稳融入 NaviAI 现有工作流。",
          "Weelume’s recruitment and project management platform enabled NaviAI to quickly source, vet, and onboard top-tier professionals. Leveraging our extensive network, we assembled a balanced team of engineers, data scientists, and product managers who could collaborate seamlessly from day one. The new team integrated smoothly with NaviAI’s existing workflows, ensuring minimal disruption."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "加快产品开发",
          "Accelerating product development"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "专业团队使 NaviAI 的开发周期缩短近 40%，更快推出功能、改善导航精度并响应用户反馈，持续迭代帮助产品建立更强的竞争力。",
          "With the right team in place, NaviAI was able to cut development timelines by nearly 40 percent. The improved efficiency allowed for faster feature rollouts, enhanced navigation accuracy, and a stronger ability to respond to customer feedback. This rapid iteration not only strengthened the product but also gave NaviAI a significant competitive edge."
        ]
      }
    ]
  },
  {
    "slug": "lumora",
    "name": "Lumora",
    "year": "2025",
    "summary": [
      "帮助 Lumora Health 简化产品发布流程，提升跨团队协作效率。",
      "Lumora Health partnered with Weelume to streamline their product launch process and cross-team coordination."
    ],
    "author": [
      "Talia Nguyen",
      "Talia Nguyen"
    ],
    "role": [
      "产品负责人",
      "Head of Product"
    ],
    "cover": "TJ38xMiNzKYdWEmgz7fyes6PmU",
    "avatar": "5JOZsibBgQ896ZHozxgNAzUBVR4",
    "gallery": [
      "8GYO8shUN1tPhLnSlp80uKqWw",
      "i19VjdFANZHt9JTiqEGW6Jtjs",
      "oRgzyzvrKu4lkMxfbPWiwaj9iI"
    ],
    "body": [
      {
        "kind": "heading",
        "copy": [
          "构建可扩展的运营框架",
          "Building a scalable operations framework"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "我们与 Lumora Health 合作搭建支持数字医疗业务扩展的运营基础，评估现有工作流，识别患者引导和数据处理中的瓶颈，并设计兼顾合规与扩展性的流程。",
          "Weelume partnered with Lumora Health to create a robust operational foundation that could support their rapid expansion in the digital healthcare sector. Our team evaluated their existing workflows, identified bottlenecks in patient onboarding and data handling, and designed a framework to ensure compliance and scalability."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "加强跨职能协作",
          "Strengthening cross-functional collaboration"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "通过组建医疗运营、数据安全与产品管理团队，Lumora Health 在保持患者服务水准的同时，兼顾监管要求与创新目标。",
          "Through Weelume’s recruitment platform, we assembled a team of healthcare operations specialists, data security experts, and product managers. This blend of talent ensured that Lumora Health could meet both regulatory requirements and innovation goals while maintaining exceptional patient care standards."
        ]
      },
      {
        "kind": "heading",
        "copy": [
          "加快产品开发",
          "Accelerating product development"
        ]
      },
      {
        "kind": "text",
        "copy": [
          "优化流程与人才结构后，Lumora Health 的产品发布周期缩短了 30%，能够更快推出远程医疗功能、优化患者互动工具并交付更新。",
          "With improved processes and a stronger team in place, Lumora Health reduced their product release cycle time by 30 percent. They were able to introduce new telehealth features, improve patient engagement tools, and deliver updates more quickly, helping them remain competitive in the fast-paced HealthTech market."
        ]
      }
    ]
  }
]


