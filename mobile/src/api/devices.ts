import { apiRequest } from "./http";
import type { Device, DeviceSensor } from "../types";

export function getDevices() {
  return apiRequest<Device[]>("/api/devices");
}

export function getDeviceByCode(deviceCode: string) {
  return apiRequest<Device>(`/api/devices/${deviceCode}`);
}

export function getDeviceSensors(deviceCode: string) {
  return apiRequest<DeviceSensor[]>(`/api/devices/${deviceCode}/sensors`);
}
