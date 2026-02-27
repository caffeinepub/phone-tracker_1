import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddDeviceModal } from "./components/AddDeviceModal";
import { DeviceListItem } from "./components/DeviceListItem";
import { DeviceDetailPanel } from "./components/DeviceDetailPanel";
import { useAllDevicesWithLatestLocation } from "./hooks/useQueries";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import type { DeviceWithLatestLocation } from "./backend.d";
import {
  Crosshair,
  LogIn,
  LogOut,
  Plus,
  Loader2,
  Radio,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// ── Empty states ────────────────────────────────────────────────────────────────

function DeviceListEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground/50">
        <WifiOff size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground/70">No devices yet</p>
        <p className="text-xs text-muted-foreground mt-0.5">Add a device to start tracking</p>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={onAdd}
        className="mt-1 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 gap-1.5"
      >
        <Plus size={13} />
        Add First Device
      </Button>
    </div>
  );
}

function EmptyDetailState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
          <Crosshair size={28} className="text-primary/30" />
        </div>
        <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground/60">Select a device</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click a device from the sidebar to view details
        </p>
      </div>
    </div>
  );
}

// ── App Shell ───────────────────────────────────────────────────────────────────

export default function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();

  const [selectedDeviceId, setSelectedDeviceId] = useState<bigint | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const {
    data: devices = [],
    isLoading: devicesLoading,
    refetch: refetchDevices,
    isFetching: devicesFetching,
  } = useAllDevicesWithLatestLocation(30_000);

  const selectedItem: DeviceWithLatestLocation | null =
    devices.find((d) => d.device.id === selectedDeviceId) ?? null;

  const handleDeviceAdded = (deviceId: bigint) => {
    setSelectedDeviceId(deviceId);
  };

  const handleDeviceRemoved = () => {
    setSelectedDeviceId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Toaster position="top-right" theme="dark" />

      {/* ── Header ── */}
      <header className="shrink-0 h-14 border-b border-border flex items-center justify-between px-5 bg-background/95 backdrop-blur-sm z-20">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
            <Crosshair size={15} className="text-primary" />
          </div>
          <span className="font-semibold text-base tracking-tight">
            Phone<span className="text-primary">Tracker</span>
          </span>
          <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-muted/50 border border-border">
            <Radio size={9} className="text-primary" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Live
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refetchDevices()}
            disabled={devicesFetching}
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
          >
            <RefreshCw size={14} className={devicesFetching ? "animate-spin" : ""} />
          </Button>

          {/* Auth */}
          {isInitializing ? (
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                {principal}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-8"
            >
              {isLoggingIn ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <LogIn size={13} />
              )}
              {isLoggingIn ? "Logging in…" : "Login"}
            </Button>
          )}
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="shrink-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
          {/* Sidebar header */}
          <div className="px-3 py-3 border-b border-sidebar-border flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Devices
              {devices.length > 0 && (
                <span className="ml-2 font-mono text-primary">{devices.length}</span>
              )}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="h-7 gap-1 bg-primary/15 text-primary hover:bg-primary/25 border border-primary/25 text-xs px-2"
            >
              <Plus size={12} />
              Add
            </Button>
          </div>

          {/* Device list */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {devicesLoading ? (
                <div className="space-y-1 p-1">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-14 w-full rounded-lg bg-muted/30"
                    />
                  ))}
                </div>
              ) : devices.length === 0 ? (
                <DeviceListEmpty onAdd={() => setAddModalOpen(true)} />
              ) : (
                devices.map((item) => (
                  <DeviceListItem
                    key={item.device.id.toString()}
                    item={item}
                    isSelected={selectedDeviceId === item.device.id}
                    onClick={() => setSelectedDeviceId(item.device.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {/* Sidebar footer */}
          <div className="px-3 py-2 border-t border-sidebar-border">
            <p className="text-[10px] text-muted-foreground/50 text-center">
              Auto-refreshes every 30s
            </p>
          </div>
        </aside>

        {/* Detail Panel */}
        <main className="flex-1 flex flex-col min-w-0">
          {selectedItem ? (
            <DeviceDetailPanel
              item={selectedItem}
              currentPrincipal={principal}
              onRemoved={handleDeviceRemoved}
            />
          ) : (
            <EmptyDetailState />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-border px-5 py-2 flex items-center justify-center">
        <p className="text-xs text-muted-foreground/40">
          © 2026. Built with ❤️ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary/70 transition-colors underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Add Device Modal */}
      <AddDeviceModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleDeviceAdded}
      />
    </div>
  );
}
