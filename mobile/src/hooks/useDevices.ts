import { useCallback, useEffect, useState } from "react";
import { getDeviceSensors, getDevices } from "../api/devices";
import { getSnapshot } from "../api/dashboard";
import type { DashboardSnapshot, Device, DeviceSensor } from "../types";

export interface DeviceWithDetail extends Device {
  sensors: DeviceSensor[];
  snapshot: DashboardSnapshot | null;
}

export function useDevices() {
  const [devices, setDevices] = useState<DeviceWithDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      const baseDevices = await getDevices();

      const detailed = await Promise.all(
        baseDevices.map(async (device) => {
          const [sensors, snapshot] = await Promise.all([
            getDeviceSensors(device.code).catch(() => []),
            getSnapshot(device.code).catch(() => null),
          ]);
          return { ...device, sensors, snapshot };
        })
      );

      setDevices(detailed);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar dispositivos"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, isLoading, error, refresh: fetchDevices };
}
