import { StatusBadge } from "./StatusBadge";
import type { ServiceAccent, ServiceSectionData } from "./types";

interface ServiceAuxCardProps {
  service: ServiceSectionData;
  onConsult: () => void;
}

const ACCENT_GRADIENT: Record<ServiceAccent, string> = {
  violet: "from-violet-400/30 via-violet-400/10 to-transparent",
  cyan: "from-cyan-400/30 via-cyan-400/10 to-transparent",
  pink: "from-pink-400/30 via-pink-400/10 to-transparent",
  mixed:
    "from-violet-400/25 via-cyan-400/10 to-pink-400/20",
};

export const ServiceAuxCard = ({ service, onConsult }: ServiceAuxCardProps) => {
  return (
    <article
      id={service.id}
      className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-hairline-strong hover:bg-surface/80 sm:p-7"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${
          ACCENT_GRADIENT[service.accent]
        } opacity-70 blur-2xl`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-canvas font-mono text-[18px] font-semibold text-ink">
          {service.code}
        </span>
        <StatusBadge status={service.status} />
      </div>

      <div className="relative flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          {service.eyebrow}
        </span>
        <h3 className="font-serif-zh text-[20px] font-semibold leading-[1.35] text-ink sm:text-[22px]">
          {service.title}
        </h3>
        <p className="text-[13px] leading-[1.8] text-ink-soft sm:text-[13.5px]">
          {service.subtitle}
        </p>
      </div>

      <div className="relative mt-auto flex flex-col gap-3 border-t border-hairline pt-4">
        <dl className="grid grid-cols-2 gap-3 text-[12px] sm:text-[12.5px]">
          <MetaCell label="定价" value={service.price} />
          <MetaCell label="周期" value={service.duration} />
        </dl>
        <button
          type="button"
          onClick={onConsult}
          className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:text-ink sm:text-[13px]"
        >
          预约咨询
          <svg
            viewBox="0 0 16 16"
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
            fill="currentColor"
          >
            <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
          </svg>
        </button>
      </div>
    </article>
  );
};

const MetaCell = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[10.5px]">
      {label}
    </dt>
    <dd className="font-medium leading-[1.5] text-ink">{value}</dd>
  </div>
);
