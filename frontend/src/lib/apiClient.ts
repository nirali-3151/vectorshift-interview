// apiClient.ts
// Axios instance for the FastAPI backend: resolves the base URL, handles JSON
// both ways, and turns non-2xx responses into thrown Errors with readable text.
// --------------------------------------------------

import axios, { isAxiosError } from 'axios';

const baseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
).replace(/\/+$/, '');

const errorMessage = (detail: unknown, status: number, statusText: string) => {
  if (typeof detail === 'string') return detail;
  if (detail) return JSON.stringify(detail);
  return `Request failed: ${status} ${statusText}`.trim();
};

export const api = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const detail = error.response?.data?.detail;
      const status = error.response?.status ?? 0;
      const statusText = error.response?.statusText ?? error.message;

      if (detail !== undefined) {
        throw new Error(errorMessage(detail, status, statusText));
      }

      throw new Error(error.message || `Request failed: ${status} ${statusText}`.trim());
    }

    throw error;
  }
);

export const postJson = async <T>(path: string, body: unknown): Promise<T> => {
  const { data } = await api.post<T>(path, body);
  return data;
};
