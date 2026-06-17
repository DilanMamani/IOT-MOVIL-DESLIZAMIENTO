export type Role = "admin" | "viewer" | "operator" | "ciudadano";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface Device {
  id: string;
  code: string;
  name: string;
  description: string | null;
  installed_at: string | null;
  last_seen_at: string | null;
  firmware_version: string | null;
  connection_mode: string | null;
  status: "active" | "inactive" | "maintenance";
  is_active: boolean;
  metadata: Record<string, unknown>;
  location_id: string | null;
  location_name: string | null;
  location_description: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface DeviceSensor {
  id: string;
  device_id: string;
  pin: string | null;
  label: string;
  sample_order: number;
  calibration_min: string | null;
  calibration_max: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  sensor_catalog_id: string;
  sensor_code: string;
  sensor_name: string;
  manufacturer: string | null;
  communication_type: string | null;
  value_kind: string;
  description: string | null;
}

export type RiskLevel = "normal" | "warning" | "danger";

export interface DashboardSnapshot {
  device_id: string;
  device_code: string;
  device_name: string;
  location_name: string | null;
  sample_id: string;
  sampled_at: string;
  received_at: string;
  risk_level: RiskLevel;
  risk_score: string;
  [metricCode: string]: string | null;
}

export interface Alert {
  id: string;
  device_id: string;
  device_code: string;
  device_name: string;
  device_sensor_id: string | null;
  sample_id: string | null;
  sample_metric_id: string | null;
  metric_type_id: string | null;
  metric_code: string | null;
  metric_name: string | null;
  level: "warning" | "danger";
  code: string;
  title: string;
  message: string;
  current_value: string | null;
  threshold_value: string | null;
  created_at: string;
  is_resolved: boolean;
  resolved_at: string | null;
}

export type ThresholdSeverity = "warning" | "danger";
export type ThresholdOperator = "gt" | "gte" | "lt" | "lte" | "between";

export interface MetricType {
  id: string;
  code: string;
  name: string;
  unit: string | null;
  value_kind: string;
  metric_group: "soil" | "vibration" | "accel" | "gyro" | "system";
  sort_order: number;
}

export interface Threshold {
  id: string;
  device_id: string | null;
  device_code: string | null;
  device_sensor_id: string | null;
  metric_type_id: string;
  metric_code: string;
  metric_name: string;
  severity: ThresholdSeverity;
  operator: ThresholdOperator;
  value_1: string;
  value_2: string | null;
  message_template: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RiskHistoryPoint {
  sample_id: string;
  sampled_at: string;
  risk_level: RiskLevel;
  risk_score: number;
}

export interface HistorySeries {
  times: string[];
  soil: number[];
  vib: number[];
  accel: number[];
  gyro: number[];
  raw: number[];
  dur: number[];
  ax: number[];
  ay: number[];
  az: number[];
  gx: number[];
  gy: number[];
  gz: number[];
  vibrationDetected: number[];
  records: Record<string, unknown>[];
}
