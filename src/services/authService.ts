import { User } from '../types/user';
import { MOCK_USER } from './mockData';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  private static currentUser: User | null = MOCK_USER;

  static async sendOtp(phoneNumber: string): Promise<{ success: boolean; testOtp: string }> {
    try {
      const response = await apiClient.post<{ testOtp?: string }>('/auth/send-otp', { phoneNumber });
      if (response.success) {
        return { success: true, testOtp: response.data?.testOtp || '1234' };
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(300);
      return { success: true, testOtp: '1234' };
    }
    return { success: false, testOtp: '' };
  }

  static async verifyOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; user: User | null; token?: string }> {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/verify-otp', { phoneNumber, otp });
      if (response.success && response.data?.user) {
        this.currentUser = response.data.user;
        if (response.data.token) {
          await AsyncStorage.setItem('@healit_auth_token', response.data.token);
        }
        return { success: true, user: response.data.user, token: response.data.token };
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(300);
      if (otp === '1234' || otp === '123456') {
        this.currentUser = {
          ...MOCK_USER,
          phoneNumber,
        };
        await AsyncStorage.setItem('@healit_auth_token', 'mock_jwt_token_12345');
        return { success: true, user: this.currentUser, token: 'mock_jwt_token_12345' };
      }
    }

    return { success: false, user: null };
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      if (response.success && response.data) {
        this.currentUser = response.data;
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(80);
      return this.currentUser ? { ...this.currentUser } : null;
    }
    return null;
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
    await AsyncStorage.removeItem('@healit_auth_token');
    this.currentUser = null;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
