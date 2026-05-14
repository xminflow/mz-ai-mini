export type ServiceVisualVariant =
  | "violet-orbs"
  | "cyan-grid"
  | "pink-waves"
  | "mixed-aurora"
  | "mono-lines";

export type ServiceAccent = "violet" | "cyan" | "pink" | "mixed";

export type ServiceTier = "main" | "aux";

export type ServiceStatus = "available" | "wip" | "scarce";

export interface ServiceSectionData {
  id: string;
  code: string;
  tier: ServiceTier;
  status: ServiceStatus;
  eyebrow: string;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  fit: string[];
  doing: string[];
  notIncluded?: string[];
  visual: ServiceVisualVariant;
  imageAlt: string;
  accent: ServiceAccent;
}
