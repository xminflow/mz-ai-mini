export type SaveStatus = "idle" | "saving" | "saved" | "error";

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function loadDraft<T>(
  storageKey: string,
  defaultValue: T,
  normalize: (raw: unknown) => T,
  storage: Storage | null = globalThis.localStorage ?? null,
): { draft: T; hasDraft: boolean } {
  if (storage === null) {
    return { draft: defaultValue, hasDraft: false };
  }
  try {
    const raw = storage.getItem(storageKey);
    if (raw === null) {
      return { draft: defaultValue, hasDraft: false };
    }
    return { draft: normalize(JSON.parse(raw)), hasDraft: true };
  } catch {
    return { draft: defaultValue, hasDraft: false };
  }
}

export function saveDraft<T>(
  storageKey: string,
  draft: T,
  storage: Storage | null = globalThis.localStorage ?? null,
): boolean {
  if (storage === null) return false;
  try {
    storage.setItem(storageKey, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(storageKey: string, storage: Storage | null = globalThis.localStorage ?? null): boolean {
  if (storage === null) return false;
  try {
    storage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}

export function splitList(value: string): string[] {
  return value
    .split(/[\n,，、]/)
    .map((item) => item.trim())
    .filter((item, index, list) => item.length > 0 && list.indexOf(item) === index);
}

export function firstNonEmptyLine(value: string): string {
  const line = value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.length > 0);
  return line ?? "";
}

export function placeholder(value: string, fallback: string): string {
  return value.trim().length > 0 ? value.trim() : fallback;
}

export { normalizeString };
