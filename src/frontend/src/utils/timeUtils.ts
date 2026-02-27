/**
 * Convert nanoseconds bigint timestamp to Date
 */
export function nanosecondsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

/**
 * Format a Date to human-readable local time
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Return relative time string like "2 min ago"
 */
export function formatRelative(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) return "just now";
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export type DeviceStatus = "online" | "recent" | "offline";

/**
 * Derive status based on last-seen time
 */
export function getDeviceStatus(lastSeenMs: number | null): DeviceStatus {
  if (lastSeenMs === null) return "offline";
  const diffMin = (Date.now() - lastSeenMs) / 60_000;
  if (diffMin < 5) return "online";
  if (diffMin < 60) return "recent";
  return "offline";
}

export function statusLabel(status: DeviceStatus): string {
  if (status === "online") return "Live";
  if (status === "recent") return "Recent";
  return "Offline";
}
