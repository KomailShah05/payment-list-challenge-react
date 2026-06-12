import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Token bucket for client-side rate limiting: max 10 requests per second
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 1000;
let requestTimestamps: number[] = [];

const isRateLimited = (): boolean => {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (requestTimestamps.length >= RATE_LIMIT) return true;
  requestTimestamps.push(now);
  return false;
};

// Sanitize a string value — strip characters that could be used for injection
const sanitizeParam = (value: string): string =>
  value.replace(/[<>"'`\\]/g, "").trim();

const apiClient = axios.create({
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
    // Tells the server this is an XHR request — simple CSRF mitigation
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request interceptor: sanitize params, enforce rate limit, add request ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isRateLimited()) {
      return Promise.reject(
        new Error("Too many requests. Please slow down.")
      ) as never;
    }

    // Sanitize all string query params before they leave the client
    if (config.params) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(config.params)) {
        sanitized[key] =
          typeof value === "string" ? sanitizeParam(value) : value;
      }
      config.params = sanitized;
    }

    // Unique request ID for observability / tracing
    config.headers["X-Request-Id"] = crypto.randomUUID();

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: normalize errors into a consistent shape
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // In a real app: redirect to login or refresh token
      console.warn("[API] Unauthorized — token may have expired.");
    }

    if (status === 429) {
      console.warn("[API] Server-side rate limit hit.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
