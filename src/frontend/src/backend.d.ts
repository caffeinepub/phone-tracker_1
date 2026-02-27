import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    longitude: number;
    timestamp: Timestamp;
}
export interface DeviceWithLatestLocation {
    device: Device;
    latestLocation?: Location;
}
export type Timestamp = bigint;
export type DeviceId = bigint;
export interface Device {
    id: DeviceId;
    owner: Principal;
    name: string;
}
export interface DeviceWithLocations {
    device: Device;
    locations: Array<Location>;
}
export interface backendInterface {
    getAllDevices(): Promise<Array<Device>>;
    getAllDevicesWithLatestLocation(): Promise<Array<DeviceWithLatestLocation>>;
    getDeviceWithLocations(deviceId: DeviceId): Promise<DeviceWithLocations | null>;
    getLatestLocation(deviceId: DeviceId): Promise<Location | null>;
    getLocationHistory(deviceId: DeviceId): Promise<Array<Location>>;
    getMyDevices(): Promise<Array<Device>>;
    registerDevice(name: string): Promise<DeviceId>;
    removeDevice(deviceId: DeviceId): Promise<void>;
    updateLocation(deviceId: DeviceId, latitude: number, longitude: number): Promise<void>;
}
