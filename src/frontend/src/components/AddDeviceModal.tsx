import { useState } from "react";
import { Loader2, Plus, Radio } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterDevice } from "../hooks/useQueries";

interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (deviceId: bigint) => void;
}

export function AddDeviceModal({ open, onClose, onSuccess }: AddDeviceModalProps) {
  const [name, setName] = useState("");
  const register = useRegisterDevice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const id = await register.mutateAsync(trimmed);
      toast.success(`Device "${trimmed}" registered`);
      setName("");
      onClose();
      onSuccess?.(id);
    } catch {
      toast.error("Failed to register device");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded bg-primary/10 text-primary">
              <Radio size={16} />
            </div>
            <DialogTitle className="text-foreground font-semibold">Add Device</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Register a new device to start tracking its location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="device-name" className="text-foreground/80 text-sm">
              Device Name
            </Label>
            <Input
              id="device-name"
              placeholder="e.g. My Phone, Laptop, Tablet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border focus-visible:ring-primary/50 text-foreground font-mono text-sm"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={register.isPending || !name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {register.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {register.isPending ? "Registering…" : "Register Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
