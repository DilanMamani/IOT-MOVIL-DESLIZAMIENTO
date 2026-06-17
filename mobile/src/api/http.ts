import { storageGet } from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const SESSION_KEY = "terraguard_auth_session";

export interface ApiEnvelope<T> {
  ok: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// --- Storage cross-platform: SecureStore en nativo, localStorage en web ---
async function storageGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, value);
    } catch {
      // noop
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
    } catch {
      // noop
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
// ---------------------------------------------------------------------

async function getToken(): Promise<string | null> {
  const raw = await storageGet(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw).token ?? null;
  } catch {
    return null;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path, API_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = false, query } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !json.ok) {
    throw new ApiError(response.status, json.message || "Error de red");
  }

  return json.data;
}

export { SESSION_KEY, API_URL, storageGet, storageSet, storageDelete };