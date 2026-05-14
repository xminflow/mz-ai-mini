import { GradientOrb } from "../../motion";
import type { ServiceVisualVariant } from "./types";

interface ServiceVisualProps {
  variant: ServiceVisualVariant;
  alt: string;
}

export const ServiceVisual = ({ variant, alt }: ServiceVisualProps) => {
  return (
    <div
      role="img"
      aria-label={alt}
      className="relative aspect-[5/4] w-full overflow-hidden rounded-[22px] border border-hairline bg-surface/60 backdrop-blur-xl"
    >
      <div className="absolute inset-0 opacity-90">
        {variant === "violet-orbs" && <ConsultationVisual />}
        {variant === "cyan-grid" && <CaseReportVisual />}
        {variant === "pink-waves" && <WebsiteVisual />}
        {variant === "mixed-aurora" && <KnowledgeGraphVisual />}
        {variant === "mono-lines" && <SkillGridVisual />}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-canvas/50" />
    </div>
  );
};

// 🅰 1V1 业务咨询 — 两位对话者 + 连接信号 + 波形
const ConsultationVisual = () => (
  <>
    <GradientOrb
      color="violet"
      size={340}
      blur={90}
      opacity={0.7}
      className="left-[-14%] top-[-16%]"
    />
    <GradientOrb
      color="violet"
      size={220}
      blur={70}
      opacity={0.45}
      className="right-[-8%] bottom-[-14%]"
      style={{ animationDelay: "2s" }}
    />
    <svg
      viewBox="0 0 400 320"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="consult-node-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#A78BFA" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="consult-node-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBD5F5" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#C084FC" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="consult-link" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="50%" stopColor="#E9D5FF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* dotted rhythm background */}
      {Array.from({ length: 9 }).map((_, row) =>
        Array.from({ length: 12 }).map((__, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 34 + 20}
            cy={row * 34 + 20}
            r={1}
            fill="rgba(233,213,255,0.22)"
          />
        )),
      )}

      {/* signal link between two nodes */}
      <path
        d="M 110 160 C 170 120, 230 200, 290 160"
        stroke="url(#consult-link)"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d="M 110 160 C 170 200, 230 120, 290 160"
        stroke="url(#consult-link)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.55"
      />

      {/* Node A */}
      <circle cx="110" cy="160" r="56" fill="url(#consult-node-a)" />
      <circle
        cx="110"
        cy="160"
        r="26"
        fill="none"
        stroke="rgba(233,213,255,0.75)"
        strokeWidth="1"
      />
      <circle cx="110" cy="160" r="6" fill="rgba(233,213,255,0.95)" />

      {/* Node B */}
      <circle cx="290" cy="160" r="56" fill="url(#consult-node-b)" />
      <circle
        cx="290"
        cy="160"
        r="26"
        fill="none"
        stroke="rgba(251,213,245,0.7)"
        strokeWidth="1"
      />
      <circle cx="290" cy="160" r="6" fill="rgba(251,213,245,0.95)" />

      {/* Waveform above (conversation rhythm) */}
      <g opacity="0.7">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const heights = [8, 18, 28, 14, 24, 12, 22, 16, 10];
          const h = heights[i];
          return (
            <rect
              key={i}
              x={160 + i * 10}
              y={60 - h / 2 + 20}
              width="3"
              height={h}
              rx="1.5"
              fill="rgba(233,213,255,0.75)"
            />
          );
        })}
      </g>

      {/* Waveform below (mirror) */}
      <g opacity="0.4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const heights = [10, 16, 22, 12, 26, 18, 20, 14, 8];
          const h = heights[i];
          return (
            <rect
              key={i}
              x={160 + i * 10}
              y={260 - h / 2}
              width="3"
              height={h}
              rx="1.5"
              fill="rgba(192,132,252,0.7)"
            />
          );
        })}
      </g>
    </svg>
  </>
);

// 🅱 案例分析 — 报告文档 + 结构化数据 + 柱状图
const CaseReportVisual = () => (
  <>
    <GradientOrb
      color="cyan"
      size={320}
      blur={80}
      opacity={0.6}
      className="right-[-12%] top-[-16%]"
    />
    <svg
      viewBox="0 0 400 320"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="report-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,211,238,0.12)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </linearGradient>
        <linearGradient id="report-bar" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#0891B2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* faint grid */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          x2={400}
          y1={i * 40 + 20}
          y2={i * 40 + 20}
          stroke="rgba(34,211,238,0.08)"
          strokeWidth="0.5"
        />
      ))}

      {/* report document */}
      <rect
        x="40"
        y="48"
        width="180"
        height="224"
        rx="10"
        fill="url(#report-bg)"
        stroke="rgba(34,211,238,0.45)"
        strokeWidth="1"
      />
      {/* document title */}
      <rect x="60" y="72" width="88" height="8" rx="2" fill="rgba(34,211,238,0.8)" />
      <rect x="60" y="88" width="56" height="5" rx="1.5" fill="rgba(34,211,238,0.35)" />

      {/* section dividers & text lines */}
      {[120, 152, 184, 216, 248].map((y, i) => (
        <g key={y}>
          <rect
            x="60"
            y={y}
            width={i % 2 === 0 ? 140 : 120}
            height="3"
            rx="1"
            fill="rgba(165,243,252,0.55)"
          />
          <rect
            x="60"
            y={y + 8}
            width={i === 2 ? 100 : 130}
            height="3"
            rx="1"
            fill="rgba(165,243,252,0.3)"
          />
          {i < 4 && (
            <line
              x1="60"
              x2="200"
              y1={y + 20}
              y2={y + 20}
              stroke="rgba(34,211,238,0.15)"
              strokeWidth="0.5"
            />
          )}
        </g>
      ))}

      {/* data panel on the right */}
      <rect
        x="252"
        y="88"
        width="108"
        height="144"
        rx="10"
        fill="rgba(34,211,238,0.06)"
        stroke="rgba(34,211,238,0.35)"
        strokeWidth="1"
      />
      <rect x="268" y="104" width="48" height="5" rx="1.5" fill="rgba(34,211,238,0.7)" />

      {/* bar chart */}
      <line
        x1="268"
        x2="348"
        y1="212"
        y2="212"
        stroke="rgba(34,211,238,0.4)"
        strokeWidth="0.8"
      />
      {[
        { x: 272, h: 38 },
        { x: 290, h: 64 },
        { x: 308, h: 50 },
        { x: 326, h: 86 },
      ].map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={212 - bar.h}
          width="10"
          height={bar.h}
          rx="2"
          fill="url(#report-bar)"
        />
      ))}

      {/* connecting arrow (report → insight) */}
      <path
        d="M 224 160 L 248 160"
        stroke="rgba(165,243,252,0.6)"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
    </svg>
  </>
);

// 🅲 IP 官网定制 — 浏览器窗口 + 品牌 hero + 内容区块
const WebsiteVisual = () => (
  <>
    <GradientOrb
      color="pink"
      size={300}
      blur={85}
      opacity={0.55}
      className="left-[-8%] bottom-[-18%]"
    />
    <GradientOrb
      color="violet"
      size={220}
      blur={70}
      opacity={0.3}
      className="right-[-6%] top-[-10%]"
    />
    <svg
      viewBox="0 0 400 320"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="browser-hero" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#F472B6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="browser-frame" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(244,114,182,0.12)" />
          <stop offset="100%" stopColor="rgba(244,114,182,0.04)" />
        </linearGradient>
      </defs>

      {/* browser frame */}
      <rect
        x="36"
        y="44"
        width="328"
        height="232"
        rx="14"
        fill="url(#browser-frame)"
        stroke="rgba(244,114,182,0.5)"
        strokeWidth="1"
      />
      {/* top bar */}
      <rect
        x="36"
        y="44"
        width="328"
        height="28"
        rx="14"
        fill="rgba(244,114,182,0.12)"
      />
      <rect x="36" y="58" width="328" height="14" fill="rgba(244,114,182,0.12)" />
      <circle cx="54" cy="58" r="3.5" fill="rgba(244,114,182,0.7)" />
      <circle cx="66" cy="58" r="3.5" fill="rgba(244,114,182,0.45)" />
      <circle cx="78" cy="58" r="3.5" fill="rgba(244,114,182,0.25)" />
      <rect
        x="110"
        y="52"
        width="180"
        height="12"
        rx="6"
        fill="rgba(244,114,182,0.15)"
        stroke="rgba(244,114,182,0.3)"
        strokeWidth="0.5"
      />

      {/* nav line */}
      <line
        x1="36"
        x2="364"
        y1="72"
        y2="72"
        stroke="rgba(244,114,182,0.25)"
        strokeWidth="0.5"
      />

      {/* hero block */}
      <rect
        x="56"
        y="92"
        width="288"
        height="88"
        rx="8"
        fill="url(#browser-hero)"
      />
      <rect x="74" y="112" width="108" height="8" rx="2" fill="rgba(253,232,245,0.9)" />
      <rect x="74" y="126" width="160" height="5" rx="1.5" fill="rgba(253,232,245,0.55)" />
      <rect x="74" y="138" width="140" height="5" rx="1.5" fill="rgba(253,232,245,0.35)" />
      <rect
        x="74"
        y="154"
        width="68"
        height="14"
        rx="7"
        fill="rgba(253,232,245,0.85)"
      />

      {/* content cards row */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={56 + i * 96}
            y="196"
            width="88"
            height="64"
            rx="6"
            fill="rgba(244,114,182,0.08)"
            stroke="rgba(244,114,182,0.3)"
            strokeWidth="0.6"
          />
          <rect
            x={64 + i * 96}
            y="206"
            width="28"
            height="4"
            rx="1"
            fill="rgba(244,114,182,0.55)"
          />
          <rect
            x={64 + i * 96}
            y="216"
            width="72"
            height="3"
            rx="1"
            fill="rgba(253,232,245,0.35)"
          />
          <rect
            x={64 + i * 96}
            y="224"
            width="60"
            height="3"
            rx="1"
            fill="rgba(253,232,245,0.25)"
          />
          <rect
            x={64 + i * 96}
            y="232"
            width="50"
            height="3"
            rx="1"
            fill="rgba(253,232,245,0.2)"
          />
        </g>
      ))}
    </svg>
  </>
);

// 🅷 本地知识库 + AI 创作 — 知识图谱（中心 AI 核 + 外围节点）
const KnowledgeGraphVisual = () => (
  <>
    <GradientOrb
      color="mixed"
      size={420}
      blur={120}
      opacity={0.55}
      className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    />
    <svg
      viewBox="0 0 400 320"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="kg-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5F3FF" stopOpacity="1" />
          <stop offset="40%" stopColor="#A78BFA" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kg-ring" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* concentric pulse rings */}
      {[60, 95, 130].map((r, i) => (
        <circle
          key={r}
          cx="200"
          cy="160"
          r={r}
          fill="none"
          stroke="url(#kg-ring)"
          strokeWidth="0.7"
          opacity={0.7 - i * 0.18}
          strokeDasharray={i === 2 ? "3 4" : undefined}
        />
      ))}

      {/* peripheral document nodes */}
      {[
        { x: 200, y: 60, accent: "#A78BFA" },
        { x: 296, y: 104, accent: "#22D3EE" },
        { x: 320, y: 200, accent: "#F472B6" },
        { x: 240, y: 268, accent: "#A78BFA" },
        { x: 140, y: 268, accent: "#22D3EE" },
        { x: 80, y: 200, accent: "#F472B6" },
        { x: 104, y: 104, accent: "#A78BFA" },
      ].map((node) => (
        <g key={`${node.x}-${node.y}`}>
          <line
            x1="200"
            x2={node.x}
            y1="160"
            y2={node.y}
            stroke={node.accent}
            strokeOpacity="0.28"
            strokeWidth="0.8"
          />
          {/* document tile */}
          <rect
            x={node.x - 14}
            y={node.y - 10}
            width="28"
            height="20"
            rx="3"
            fill="rgba(13,13,18,0.7)"
            stroke={node.accent}
            strokeOpacity="0.7"
            strokeWidth="0.8"
          />
          <line
            x1={node.x - 8}
            x2={node.x + 6}
            y1={node.y - 3}
            y2={node.y - 3}
            stroke={node.accent}
            strokeOpacity="0.8"
            strokeWidth="0.8"
          />
          <line
            x1={node.x - 8}
            x2={node.x + 2}
            y1={node.y + 1}
            y2={node.y + 1}
            stroke={node.accent}
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <line
            x1={node.x - 8}
            x2={node.x + 4}
            y1={node.y + 5}
            y2={node.y + 5}
            stroke={node.accent}
            strokeOpacity="0.4"
            strokeWidth="0.6"
          />
        </g>
      ))}

      {/* central AI core */}
      <circle cx="200" cy="160" r="42" fill="url(#kg-core)" />
      <circle
        cx="200"
        cy="160"
        r="18"
        fill="none"
        stroke="rgba(245,243,255,0.85)"
        strokeWidth="1"
      />
      <circle cx="200" cy="160" r="4" fill="rgba(245,243,255,1)" />
      {/* core ticks */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 200 + Math.cos(rad) * 22;
        const y1 = 160 + Math.sin(rad) * 22;
        const x2 = 200 + Math.cos(rad) * 30;
        const y2 = 160 + Math.sin(rad) * 30;
        return (
          <line
            key={deg}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
            stroke="rgba(245,243,255,0.7)"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  </>
);

// 🅶 Skill 年卡 — Skill 卡片矩阵（保留现有 3 列 rect 的思路，改为工具箱风格）
const SkillGridVisual = () => (
  <>
    <GradientOrb
      color="violet"
      size={260}
      blur={70}
      opacity={0.32}
      className="right-[-6%] top-[-10%]"
    />
    <svg
      viewBox="0 0 400 320"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="skill-tile" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(245,245,247,0.08)" />
          <stop offset="100%" stopColor="rgba(245,245,247,0.02)" />
        </linearGradient>
      </defs>

      {/* label stripes at top */}
      <rect x="40" y="44" width="60" height="3" rx="1" fill="rgba(245,245,247,0.55)" />
      <rect x="40" y="54" width="140" height="2" rx="1" fill="rgba(245,245,247,0.25)" />

      {(() => {
        const tiles = [
          { accent: "rgba(167,139,250,0.65)", icon: "bolt" },
          { accent: "rgba(34,211,238,0.6)", icon: "grid" },
          { accent: "rgba(244,114,182,0.6)", icon: "ring" },
          { accent: "rgba(34,211,238,0.55)", icon: "bars" },
          { accent: "rgba(167,139,250,0.55)", icon: "ring" },
          { accent: "rgba(244,114,182,0.5)", icon: "bolt" },
        ];
        return tiles.map((tile, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const x = 40 + col * 110;
          const y = 80 + row * 104;
          const cx = x + 45;
          const cy = y + 44;
          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width="90"
                height="86"
                rx="10"
                fill="url(#skill-tile)"
                stroke={tile.accent}
                strokeWidth="0.8"
              />
              {tile.icon === "bolt" && (
                <path
                  d={`M ${cx - 4} ${cy - 12} L ${cx + 4} ${cy - 2} L ${cx} ${cy - 2} L ${cx + 4} ${cy + 12} L ${cx - 4} ${cy + 2} L ${cx} ${cy + 2} Z`}
                  fill={tile.accent}
                  opacity="0.85"
                />
              )}
              {tile.icon === "grid" && (
                <g>
                  {[0, 1].map((r) =>
                    [0, 1].map((c) => (
                      <rect
                        key={`${r}-${c}`}
                        x={cx - 10 + c * 11}
                        y={cy - 10 + r * 11}
                        width="8"
                        height="8"
                        rx="1.5"
                        fill={tile.accent}
                        opacity={0.7 - (r + c) * 0.15}
                      />
                    )),
                  )}
                </g>
              )}
              {tile.icon === "ring" && (
                <g>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="11"
                    fill="none"
                    stroke={tile.accent}
                    strokeWidth="1.2"
                  />
                  <circle cx={cx} cy={cy} r="3" fill={tile.accent} />
                </g>
              )}
              {tile.icon === "bars" && (
                <g>
                  {[6, 10, 14, 8].map((h, i) => (
                    <rect
                      key={i}
                      x={cx - 12 + i * 6}
                      y={cy + 8 - h}
                      width="4"
                      height={h}
                      rx="1"
                      fill={tile.accent}
                      opacity="0.85"
                    />
                  ))}
                </g>
              )}
              {/* bottom label bar */}
              <rect
                x={x + 10}
                y={y + 66}
                width="50"
                height="3"
                rx="1"
                fill="rgba(245,245,247,0.45)"
              />
              <rect
                x={x + 10}
                y={y + 74}
                width="32"
                height="2"
                rx="1"
                fill="rgba(245,245,247,0.22)"
              />
            </g>
          );
        });
      })()}
    </svg>
  </>
);
