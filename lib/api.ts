import type {
  TwoFactorStartResponse,
  AuthResponse,
  PatientsResponse,
  Patient,
  GetPatientsParams,
} from "./types";

const isBrowser = typeof window !== "undefined";

const BASE_URL = isBrowser
  ? "/api/proxy"
  : (process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://hemihealth-api-31950a0cf112.herokuapp.com");

class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error?.message ?? `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body?.error?.code);
  }

  return res.json() as Promise<T>;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function signup(
  email: string,
  password: string
): Promise<TwoFactorStartResponse> {
  return request<TwoFactorStartResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<TwoFactorStartResponse> {
  return request<TwoFactorStartResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function verify(
  challengeId: string,
  code: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ challengeId, code }),
  });
}

export async function getPatients(
  token: string,
  params: GetPatientsParams = {}
): Promise<PatientsResponse> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, String(value));
  }
  const query = qs.toString();
  return request<PatientsResponse>(
    `/patients${query ? `?${query}` : ""}`,
    { headers: authHeaders(token) }
  );
}

export async function getPatient(
  token: string,
  id: string
): Promise<Patient> {
  return request<Patient>(`/patients/${id}`, {
    headers: authHeaders(token),
  });
}

export { ApiError };
