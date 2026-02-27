import { cn } from "@/lib/utils";
import { DeviceStatusDot } from "./DeviceStatusDot";
import type { DeviceWithLatestLocation } from "../backend.d";
import {
  nanosecondsToDate,
  getDeviceStatus,
  formatRelative,
  statusLabel,
} from "../utils/timeUtils";
import { Smartphone } from "lucide-react";

interface DeviceListItemProps {
  item: DeviceWithLatestLocation;
  isSelected: boolean;
  onClick: () => void;
}

export function DeviceListItem({ item, isSelected, onClick }: DeviceListItemProps) {
  const lastSeenMs = item.latestLocation
    ? Number(item.latestLocation.timestamp / 1_000_000n)
    : null;
  const status = getDeviceStatus(lastSeenMs);
  const lastSeenLabel = lastSeenMs
    ? formatRelative(new Date(lastSeenMs))
    : "Never";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group",
        "flex items-center gap-3 border",
        isSelected
          ? "bg-primary/10 border-primary/30 shadow-[0_0_12px_oklch(0.72_0.18_195_/_0.15)]"
          : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
          isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Smartphone size={14} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isSelected ? "text-foreground" : "text-foreground/80",
            )}
          >
            {item.device.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <DeviceStatusDot status={status} className="w-1.5 h-1.5" />
          <span className="text-xs text-muted-foreground">{statusLabel(status)}</span>
          <span className="text-xs text-muted-foreground/60">·</span>
          <span className="text-xs text-muted-foreground/60">{lastSeenLabel}</span>
        </div>
      </div>
    </button>
  );
}
