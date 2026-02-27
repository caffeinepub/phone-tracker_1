import type { DeviceStatus } from "../utils/timeUtils";
import { cn } from "@/lib/utils";

interface DeviceStatusDotProps {
  status: DeviceStatus;
  className?: string;
}

export function DeviceStatusDot({ status, className }: DeviceStatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full shrink-0",
        status === "online" && "bg-status-online animate-pulse-teal",
        status === "recent" && "bg-status-recent",
        status === "offline" && "bg-status-offline",
        className,
      )}
    />
  );
}
