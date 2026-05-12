import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Compass,
  GraduationCap,
  Globe2,
  LineChart,
  Settings as SettingsIcon,
  SplitSquareVertical,
} from "lucide-react";

export interface NavChild {
  /** absolute route path the sub-item links to */
  path: string;
  label: string;
}

export interface NavItem {
  /** route path; supports `*` suffix for nested routers. */
  path: string;
  /** the renderable path used by NavLink for the sidebar entry. */
  navTo: string;
  label: string;
  icon: LucideIcon;
  /** route element to render. */
  Element: ComponentType | LazyExoticComponent<ComponentType>;
  /** optional nested sidebar entries shown under this item. The parent route
   *  still owns the wildcard mount; children are pure sidebar links into the
   *  feature's internal sub-routes. */
  children?: readonly NavChild[];
}

const SelfMediaGuide = lazy(() =>
  import("@/features/self-media-guide").then((m) => ({ default: m.SelfMediaGuide })),
);

const Persona = lazy(() => import("@/features/persona").then((m) => ({ default: m.Persona })));

const BloggerAnalysis = lazy(() =>
  import("@/features/blogger-analysis").then((m) => ({ default: m.BloggerAnalysis })),
);

const TrackAnalysis = lazy(() =>
  import("@/features/track-analysis").then((m) => ({ default: m.TrackAnalysis })),
);

const AiChat = lazy(() => import("@/features/ai-chat").then((m) => ({ default: m.AiChat })));

const KeywordCrawl = lazy(() =>
  import("@/features/keyword-crawl").then((m) => ({ default: m.KeywordCrawl })),
);

const Settings = lazy(() => import("@/features/settings").then((m) => ({ default: m.Settings })));

export const navItems: readonly NavItem[] = [
  {
    path: "/ai-chat/*",
    navTo: "/ai-chat",
    label: "AI对话",
    icon: Bot,
    Element: AiChat,
  },
  {
    path: "/self-media-guide/*",
    navTo: "/self-media-guide",
    label: "百万粉博主流量实战",
    icon: GraduationCap,
    Element: SelfMediaGuide,
    children: [],
  },
  {
    path: "/persona/*",
    navTo: "/persona",
    label: "人设与战略",
    icon: SplitSquareVertical,
    Element: Persona,
    children: [
      { path: "/persona/profile", label: "人设设置" },
      { path: "/persona/strategy", label: "战略设置" },
    ],
  },
  {
    path: "/blogger-analysis/*",
    navTo: "/blogger-analysis",
    label: "博主拆解",
    icon: LineChart,
    Element: BloggerAnalysis,
    children: [
      { path: "/blogger-analysis/douyin", label: "抖音博主拆解" },
      { path: "/blogger-analysis/xiaohongshu", label: "小红书博主拆解" },
    ],
  },
  {
    path: "/track-analysis/*",
    navTo: "/track-analysis",
    label: "AI分析报告",
    icon: Compass,
    Element: TrackAnalysis,
    children: [
      { path: "/track-analysis/track", label: "赛道分析" },
      { path: "/track-analysis/product", label: "产品分析" },
    ],
  },
  {
    path: "/web-collection/*",
    navTo: "/web-collection",
    label: "爆款素材",
    icon: Globe2,
    Element: KeywordCrawl,
    children: [
      { path: "/web-collection/library", label: "素材库" },
      { path: "/web-collection/hot-analysis", label: "爆款分析" },
      { path: "/web-collection/content-diagnosis", label: "内容诊断" },
      { path: "/web-collection/realtime-trends", label: "实时热点" },
      { path: "/web-collection/douyin", label: "抖音采集" },
      { path: "/web-collection/xiaohongshu", label: "小红书采集" },
    ],
  },
  {
    path: "/settings/*",
    navTo: "/settings",
    label: "设置",
    icon: SettingsIcon,
    Element: Settings,
  },
] as const;

export const defaultNavTo: string = navItems[0]?.navTo ?? "/";
