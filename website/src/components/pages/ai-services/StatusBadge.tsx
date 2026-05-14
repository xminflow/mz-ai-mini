import type { ServiceStatus } from "./types";

interface StatusBadgeProps {
  status: ServiceStatus;
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; dotClass: string; textClass: string; borderClass: string }
> = {
  available: {
    label: "可预约",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-200",
    borderClass: "border-emerald-400/30",
  },
  wip: {
    label: "建设中 · 可试售",
    dotClass: "bg-amber-400",
    textClass: "text-amber-200",
    borderClass: "border-amber-400/30",
  },
  scarce: {
    label: "稀缺席位",
    dotClass: "bg-pink-400",
    textClass: "text-pink-200",
    borderClass: "border-pink-400/30",
  },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.borderClass} bg-surface/60 px-2.5 py-0.5 text-[11px] font-medium ${config.textClass} backdrop-blur`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}
      />
      {config.label}
    </span>
  );
};
