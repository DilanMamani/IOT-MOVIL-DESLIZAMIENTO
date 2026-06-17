import { useCallback, useEffect, useRef, useState } from "react";
import { getRiskHistory, getRiskHistoryByDates } from "../api/riskHistory";
import type { RiskHistoryPoint } from "../types";

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  return { start: fmt(start), end: fmt(end) };
}

// 1. Aceptamos los mismos argumentos por defecto que la versión simple
export function useRiskHistory(initialDeviceCode = "esp32-node-001", initialRange = "24h") {
  const defaults = getDefaultDateRange();
  const hasLoadedRef = useRef(false);

  // Mantenemos el estado interno para la versión avanzada
  const [deviceCode, setDeviceCode] = useState(initialDeviceCode);
  const [range, setRange] = useState(initialRange);
  
  // Sincronizamos el estado por si el componente padre cambia los props en caliente (vital para la V2)
  useEffect(() => { setDeviceCode(initialDeviceCode); }, [initialDeviceCode]);
  useEffect(() => { setRange(initialRange); }, [initialRange]);

  const [rows, setRows] = useState<RiskHistoryPoint[]>([]);
  const [from, setFrom] = useState(defaults.start);
  const [to, setTo] = useState(defaults.end);
  
  // Manejo de carga de la versión avanzada
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 2. Usamos string | null para no romper los chequeos (error !== null) de la V2
  const [error, setError] = useState<string | null>(null);

  const loadByRange = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) setLoading(true);
      else setRefreshing(true);
      setError(null);
      
      const data = await getRiskHistory(deviceCode, range);
      setRows(Array.isArray(data) ? data : []);
      
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial de riesgo");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceCode, range]);

  const loadByDates = useCallback(async () => {
    if (!from || !to) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      else setRefreshing(true);
      setError(null);
      
      const data = await getRiskHistoryByDates(deviceCode, from, to);
      setRows(Array.isArray(data) ? data : []);
      
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial por fechas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceCode, from, to]);

  useEffect(() => { 
    loadByRange(); 
  }, [loadByRange]);

  return {
    // --- COMPATIBILIDAD ESTRICTA CON LA SEGUNDA VERSIÓN ---
    // Los componentes antiguos solo verán esto y seguirán funcionando igual
    rows,
    loading,
    error,
    refresh: loadByRange, 

    // --- NUEVAS FUNCIONALIDADES DE LA PRIMERA VERSIÓN ---
    // Los componentes nuevos pueden extraer estas propiedades extra
    deviceCode, setDeviceCode,
    range, setRange,
    from, setFrom,
    to, setTo,
    refreshing,
    reloadByRange: loadByRange,
    reloadByDates: loadByDates,
  };
}