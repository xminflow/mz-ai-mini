/**
 * 微域智能运维平台模板的数据出口。
 *
 * 拆成四个文件而不是一个大 data.ts：曲线生成、监控模型、项目清单、可观测性数据
 * 四者的修改理由完全不同——加一个项目不该翻到伪随机算法，调一条告警规则也不该
 * 滚过二十几个项目的定义。页面一律从 `../data` 引入，不直接引子模块。
 */
export * from './model'
export * from './series'
export * from './projects'
export * from './observability'
export * from './inspection'
export * from './insight'
