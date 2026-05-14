import { Reveal } from "../../motion";
import { ServiceVisual } from "./ServiceVisual";
import { StatusBadge } from "./StatusBadge";
import type { ServiceSectionData } from "./types";

interface ServiceSectionProps {
  service: ServiceSectionData;
  index: number;
  onConsult: () => void;
}

export const ServiceSection = ({
  service,
  index,
  onConsult,
}: ServiceSectionProps) => {
  const imageFirst = index % 2 === 1;

  return (
    <section id={service.id} className="relative border-t border-hairline">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div
          className={`grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16 ${
            imageFirst ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <Reveal>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2.5 font-mono text-[13px] font-medium uppercase tracking-[0.22em] text-muted sm:text-[14px]">
                  <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
                  {service.eyebrow}
                </span>
                <StatusBadge status={service.status} />
              </div>
              <h2 className="font-serif-zh text-balance text-[28px] font-semibold leading-[1.3] tracking-[0.005em] text-ink sm:text-[36px] lg:text-[44px]">
                {service.title}
              </h2>
              <p className="max-w-xl text-[14px] leading-[1.85] text-ink-soft sm:text-[15px]">
                {service.subtitle}
              </p>

              <MetaRow price={service.price} duration={service.duration} />

              <div className="mt-2 flex flex-col gap-5">
                <PointList label="适用场景" lines={service.fit} />
                <PointList label="核心交付" lines={service.doing} />
                {service.notIncluded && service.notIncluded.length > 0 ? (
                  <PointList
                    label="不包含"
                    lines={service.notIncluded}
                    tone="muted"
                  />
                ) : null}
              </div>

              <button
                type="button"
                onClick={onConsult}
                className="group mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-4 py-2 text-[13px] font-medium text-ink backdrop-blur transition-all hover:border-hairline-strong hover:bg-surface/80 sm:text-sm"
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
          </Reveal>

          <Reveal delay={0.08}>
            <ServiceVisual variant={service.visual} alt={service.imageAlt} />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

interface MetaRowProps {
  price: string;
  duration: string;
}

const MetaRow = ({ price, duration }: MetaRowProps) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-hairline bg-surface/40 px-4 py-3 text-[12.5px] text-ink-soft sm:text-[13px]">
    <MetaItem label="定价" value={price} />
    <span aria-hidden className="h-3 w-px bg-hairline" />
    <MetaItem label="周期" value={duration} />
  </div>
);

const MetaItem = ({ label, value }: { label: string; value: string }) => (
  <span className="inline-flex items-baseline gap-1.5">
    <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted sm:text-[11px]">
      {label}
    </span>
    <span className="font-medium text-ink">{value}</span>
  </span>
);

interface PointListProps {
  label: string;
  lines: string[];
  tone?: "default" | "muted";
}

const PointList = ({ label, lines, tone = "default" }: PointListProps) => {
  const lineClass =
    tone === "muted"
      ? "text-muted"
      : "text-ink-soft";
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
      <ul
        className={`flex flex-col gap-1.5 text-[13px] leading-[1.85] sm:text-[13.5px] ${lineClass}`}
      >
        {lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span
              aria-hidden
              className="mt-[0.7em] h-1 w-1 flex-none rounded-full bg-muted/70"
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
