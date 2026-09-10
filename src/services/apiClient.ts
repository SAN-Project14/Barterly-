/**
 * Barterly API Client
 * 
 * Configurable frontend HTTP client intended to communicate with the Barterly
 * Backend REST API (/api/v1).
 * Uses VITE_API_URL from environment when available.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  status: number;
}

export const apiClient = {
  baseUrl: API_BASE_URL,
  isMockMode: !import.meta.env.VITE_API_URL,

  async get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      const data = await response.json();
      return { data, success: response.ok, status: response.status };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      return { error: message, success: false, status: 500 };
    }
  },

  async post<T>(endpoint: string, body: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, success: response.ok, status: response.status };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      return { error: message, success: false, status: 500 };
    }
  },

  async put<T>(endpoint: string, body: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, success: response.ok, status: response.status };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      return { error: message, success: false, status: 500 };
    }
  },

  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      const data = await response.json();
      return { data, success: response.ok, status: response.status };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      return { error: message, success: false, status: 500 };
    }
  },
};
