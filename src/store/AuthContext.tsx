import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  hasLocationPermission: boolean;
  isLoading: boolean;
  login: (phoneNumber: string) => Promise<{ success: boolean; testOtp: string }>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<{ success: boolean }>;
  completeOnboarding: () => void;
  grantLocationPermission: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(true); // default true for quick exploration, or false
  const [hasLocationPermission, setHasLocationPermission] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    AuthService.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
  }, []);

  const login = async (phoneNumber: string) => {
    return AuthService.sendOtp(phoneNumber);
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    const res = await AuthService.verifyOtp(phoneNumber, otp);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false };
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
  };

  const grantLocationPermission = () => {
    setHasLocationPermission(true);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOnboarded,
        hasLocationPermission,
        isLoading,
        login,
        verifyOtp,
        completeOnboarding,
        grantLocationPermission,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
