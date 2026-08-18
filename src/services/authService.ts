import { User } from '../types/user';
import { MOCK_USER } from './mockData';

export class AuthService {
  private static currentUser: User | null = MOCK_USER;

  static async sendOtp(phoneNumber: string): Promise<{ success: boolean; testOtp: string }> {
    await this.delay(400);
    // Test OTP is 1234
    return { success: true, testOtp: '1234' };
  }

  static async verifyOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; user: User | null }> {
    await this.delay(400);
    if (otp === '1234' || otp === '123456') {
      this.currentUser = {
        ...MOCK_USER,
        phoneNumber,
      };
      return { success: true, user: this.currentUser };
    }
    return { success: false, user: null };
  }

  static async getCurrentUser(): Promise<User | null> {
    await this.delay(100);
    return this.currentUser ? { ...this.currentUser } : null;
  }

  static async logout(): Promise<void> {
    await this.delay(100);
    this.currentUser = null;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
