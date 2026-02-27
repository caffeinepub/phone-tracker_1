import { useState } from "react";
import { Loader2, Navigation, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateLocation } from "../hooks/useQueries";

interface SimulateLocationProps {
  deviceId: bigint;
}

type GeoState = "idle" | "requesting" | "denied" | "success";

export function SimulateLocation({ deviceId }: SimulateLocationProps) {
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const updateLocation = useUpdateLocation();

  const submitLocation = async (latitude: number, longitude: number) => {
    try {
      await updateLocation.mutateAsync({ deviceId, latitude, longitude });
      toast.success(`Location updated: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } catch {
      toast.error("Failed to update location");
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoState("denied");
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGeoState("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState("success");
        void submitLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoState("denied");
        toast.error("Location access denied — use manual input below");
      },
      { timeout: 10_000 },
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Enter valid latitude and longitude");
      return;
    }
    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }
    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }
    void submitLocation(lat, lng);
  };

  return (
    <div className="space-y-3">
      {/* GPS Button */}
      <Button
        type="button"
        onClick={handleGeolocate}
        disabled={geoState === "requesting" || updateLocation.isPending}
        variant="outline"
        className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
      >
        {geoState === "requesting" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Navigation size={14} />
        )}
        {geoState === "requesting" ? "Getting location…" : "Use My Browser Location"}
      </Button>

      {/* Manual fallback (always show if denied, or as secondary option) */}
      {(geoState === "denied" || geoState === "idle") && (
        <details className={geoState === "denied" ? "open" : ""}>
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground/70 flex items-center gap-1 select-none">
            <MapPin size={11} />
            Enter coordinates manually
          </summary>
          <form onSubmit={handleManualSubmit} className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="40.7128"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="-74.0060"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-xs h-8"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={updateLocation.isPending}
              size="sm"
              className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
            >
              {updateLocation.isPending ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : null}
              Submit Coordinates
            </Button>
          </form>
        </details>
      )}
    </div>
  );
}
