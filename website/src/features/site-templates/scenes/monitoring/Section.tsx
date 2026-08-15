import { SceneIntro } from '../_shared/SceneIntro'

export default function MonitoringSection() {
  return (
    <SceneIntro
      description="监控运维平台面向的是「服务半夜挂了没人知道」。它把分散在各处的服务存活、日志异常、资源水位和告警规则收进一个界面，出问题时能一眼看出是哪个环节。"
      approach="先梳理要纳管的服务清单与各自的健康判据，再定告警规则和通知渠道，最后接数据源。图表用 ECharts，数据接口按你现有的采集方式适配。"
    />
  )
}
