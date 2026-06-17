import { apiRequest } from "./http";
import type { AuthSession, User } from "../types";

export function login(email: string, password: string) {
  return apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function register(payload: {
  full_name: string;
  email: string;
  password: string;
  role?: string;
}) {
  return apiRequest<AuthSession>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function me() {
  return apiRequest<User>("/api/auth/me", { auth: true });
}
