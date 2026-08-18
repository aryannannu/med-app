import { ENV, getFullApiUrl } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string = ENV.API_URL;
  private timeoutMs: number = ENV.API_TIMEOUT;

  /**
   * Dynamically change base URL at runtime if needed
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const token = await AsyncStorage.getItem('@healit_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // ignore storage errors
    }

    return headers;
  }

  private resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${clean}`;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    let url = this.resolveUrl(endpoint);
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) searchParams.append(key, String(val));
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    return this.request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    return this.request<T>(url, { method: 'DELETE' });
  }

  private async request<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText || response.statusText}`,
        };
      }

      const json = await response.json();
      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        message: json.message,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Request timed out' : err.message || 'Network request failed',
      };
    }
  }
}

export const apiClient = new ApiClient();
