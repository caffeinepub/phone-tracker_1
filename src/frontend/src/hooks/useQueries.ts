import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Device,
  DeviceWithLatestLocation,
  DeviceWithLocations,
  Location,
} from "../backend.d";

// ── Query Keys ─────────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  allDevicesWithLocation: ["allDevicesWithLocation"] as const,
  myDevices: ["myDevices"] as const,
  deviceWithLocations: (id: bigint) => ["deviceWithLocations", id.toString()] as const,
  latestLocation: (id: bigint) => ["latestLocation", id.toString()] as const,
  locationHistory: (id: bigint) => ["locationHistory", id.toString()] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

export function useAllDevicesWithLatestLocation(refetchInterval = 30_000) {
  const { actor, isFetching } = useActor();
  return useQuery<DeviceWithLatestLocation[]>({
    queryKey: QUERY_KEYS.allDevicesWithLocation,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDevicesWithLatestLocation();
    },
    enabled: !!actor && !isFetching,
    refetchInterval,
  });
}

export function useMyDevices() {
  const { actor, isFetching } = useActor();
  return useQuery<Device[]>({
    queryKey: QUERY_KEYS.myDevices,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDevices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeviceWithLocations(deviceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<DeviceWithLocations | null>({
    queryKey: QUERY_KEYS.deviceWithLocations(deviceId ?? BigInt(0)),
    queryFn: async () => {
      if (!actor || deviceId === null) return null;
      return actor.getDeviceWithLocations(deviceId);
    },
    enabled: !!actor && !isFetching && deviceId !== null,
  });
}

export function useLatestLocation(deviceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Location | null>({
    queryKey: QUERY_KEYS.latestLocation(deviceId ?? BigInt(0)),
    queryFn: async () => {
      if (!actor || deviceId === null) return null;
      return actor.getLatestLocation(deviceId);
    },
    enabled: !!actor && !isFetching && deviceId !== null,
  });
}

export function useLocationHistory(deviceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Location[]>({
    queryKey: QUERY_KEYS.locationHistory(deviceId ?? BigInt(0)),
    queryFn: async () => {
      if (!actor || deviceId === null) return [];
      return actor.getLocationHistory(deviceId);
    },
    enabled: !!actor && !isFetching && deviceId !== null,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useRegisterDevice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<bigint, Error, string>({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerDevice(name);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.allDevicesWithLocation });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.myDevices });
    },
  });
}

export function useRemoveDevice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (deviceId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeDevice(deviceId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.allDevicesWithLocation });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.myDevices });
    },
  });
}

export function useUpdateLocation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { deviceId: bigint; latitude: number; longitude: number }
  >({
    mutationFn: async ({ deviceId, latitude, longitude }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLocation(deviceId, latitude, longitude);
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({
        queryKey: QUERY_KEYS.deviceWithLocations(variables.deviceId),
      });
      void qc.invalidateQueries({
        queryKey: QUERY_KEYS.latestLocation(variables.deviceId),
      });
      void qc.invalidateQueries({
        queryKey: QUERY_KEYS.locationHistory(variables.deviceId),
      });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.allDevicesWithLocation });
    },
  });
}
