import { storageGet } from "./storage";
import { SESSION_KEY, API_URL, apiRequest } from "./http";
import type { Report, ReportType, ReportUrgency } from "../types";

async function getToken(): Promise<string | null> {
  const raw = await storageGet(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw).token ?? null;
  } catch {
    return null;
  }
}

export interface CreateReportPayload {
  incident_type: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  urgency_level: ReportUrgency;
  photo?: { uri: string; type: string; name: string } | null;
}

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  const token = await getToken();
  const formData = new FormData();
  formData.append("incident_type", payload.incident_type);
  formData.append("description", payload.description);
  formData.append("latitude", String(payload.latitude));
  formData.append("longitude", String(payload.longitude));
  if (payload.location_name) formData.append("location_name", payload.location_name);
  formData.append("urgency_level", payload.urgency_level);
  if (payload.photo) {
    formData.append("photo", payload.photo as unknown as Blob);
  }

  const res = await fetch(`${API_URL}/api/reports`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Error al crear reporte");
  return json.data as Report;
}

export async function getMyReports(): Promise<Report[]> {
  return apiRequest<Report[]>("/api/reports/my", { auth: true });
}

export async function getReportById(id: string): Promise<Report> {
  return apiRequest<Report>(`/api/reports/${id}`, { auth: true });
}
