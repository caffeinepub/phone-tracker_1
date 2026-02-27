import { useState } from "react";
import { Copy, Trash2, Loader2, MapPin, Clock, User, Hash, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DeviceStatusDot } from "./DeviceStatusDot";
import { SimulateLocation } from "./SimulateLocation";
import { useDeviceWithLocations, useRemoveDevice } from "../hooks/useQueries";
import {
  nanosecondsToDate,
  formatTimestamp,
  formatRelative,
  getDeviceStatus,
  statusLabel,
} from "../utils/timeUtils";
import type { DeviceWithLatestLocation } from "../backend.d";

interface DeviceDetailPanelProps {
  item: DeviceWithLatestLocation;
  currentPrincipal?: string;
  onRemoved: () => void;
}

function CoordDisplay({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-6">{label}</span>
      <span className="font-mono text-sm text-primary tabular-nums">
        {value.toFixed(6)}
      </span>
    </div>
  );
}

export function DeviceDetailPanel({
  item,
  currentPrincipal,
  onRemoved,
}: DeviceDetailPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: deviceData, isLoading } = useDeviceWithLocations(item.device.id);
  const removeDevice = useRemoveDevice();

  const isOwner =
    currentPrincipal && currentPrincipal === item.device.owner.toString();

  const lastSeenMs = item.latestLocation
    ? Number(item.latestLocation.timestamp / 1_000_000n)
    : null;
  const status = getDeviceStatus(lastSeenMs);

  const locations = deviceData?.locations ?? [];
  const sortedLocations = [...locations].sort(
    (a, b) => Number(b.timestamp - a.timestamp),
  );

  const copyCoords = () => {
    if (!item.latestLocation) return;
    const text = `${item.latestLocation.latitude.toFixed(6)}, ${item.latestLocation.longitude.toFixed(6)}`;
    void navigator.clipboard.writeText(text);
    toast.success("Coordinates copied");
  };

  const handleRemove = async () => {
    try {
      await removeDevice.mutateAsync(item.device.id);
      toast.success(`Device "${item.device.name}" removed`);
      onRemoved();
    } catch {
      toast.error("Failed to remove device");
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-up">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DeviceStatusDot status={status} className="w-2 h-2" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {statusLabel(status)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{item.device.name}</h2>
          </div>

          {isOwner && (
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 shrink-0"
                >
                  <Trash2 size={13} />
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Remove Device</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to remove{" "}
                    <strong className="text-foreground">{item.device.name}</strong>? This
                    will delete all its location history permanently.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-muted-foreground">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void handleRemove()}
                    disabled={removeDevice.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {removeDevice.isPending && (
                      <Loader2 size={13} className="animate-spin mr-1" />
                    )}
                    Remove Device
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Meta info */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash size={11} />
            <span className="font-mono">ID: {item.device.id.toString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-hidden">
            <User size={11} className="shrink-0" />
            <span className="font-mono truncate">{item.device.owner.toString()}</span>
          </div>
          {lastSeenMs && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={11} />
              <span>Last seen {formatRelative(new Date(lastSeenMs))}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-6">
          {/* Latest Location */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <MapPin size={11} />
              Latest Location
            </h3>
            {item.latestLocation ? (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border group relative">
                <CoordDisplay label="Lat" value={item.latestLocation.latitude} />
                <CoordDisplay label="Lng" value={item.latestLocation.longitude} />
                <div className="pt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(nanosecondsToDate(item.latestLocation.timestamp))}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyCoords}
                  className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={12} />
                </Button>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground text-center border border-dashed border-border">
                No location recorded yet
              </div>
            )}
          </section>

          <Separator className="bg-border" />

          {/* Simulate Location */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <Navigation size={11} />
              Update Location
            </h3>
            <SimulateLocation deviceId={item.device.id} />
          </section>

          <Separator className="bg-border" />

          {/* Location History */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <Clock size={11} />
              Location History
              {sortedLocations.length > 0 && (
                <span className="ml-auto text-xs bg-muted rounded-full px-2 py-0.5 font-mono normal-case tracking-normal">
                  {sortedLocations.length}
                </span>
              )}
            </h3>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg bg-muted/50" />
                ))}
              </div>
            ) : sortedLocations.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground text-center border border-dashed border-border">
                No location history
              </div>
            ) : (
              <div className="space-y-1.5 relative">
                {/* Timeline line */}
                <div className="absolute left-[9px] top-3 bottom-3 w-px bg-border" />

                {sortedLocations.map((loc, idx) => {
                  const date = nanosecondsToDate(loc.timestamp);
                  return (
                    <div
                      key={loc.timestamp.toString()}
                      className="flex gap-3 items-start pl-1"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      {/* Timeline dot */}
                      <div className="w-4 h-4 rounded-full bg-muted border border-border shrink-0 mt-2 relative z-10" />

                      <div className="flex-1 bg-muted/30 hover:bg-muted/50 rounded-lg p-3 transition-colors border border-transparent hover:border-border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-foreground/80">
                                {loc.latitude.toFixed(6)}
                              </span>
                              <span className="text-muted-foreground/40 text-xs">,</span>
                              <span className="font-mono text-xs text-foreground/80">
                                {loc.longitude.toFixed(6)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(date)}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground/60 shrink-0">
                            {formatRelative(date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
