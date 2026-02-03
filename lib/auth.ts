// Authentication utilities with rate limiting and security features

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  name: string;
  role: string;
  avatar?: string;
  provider?: 'email' | 'google' | 'facebook' | 'apple' | 'telegram';
}

export interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 3,
  PENALTIES: [
    30 * 1000,        // 30 seconds after 3 attempts
    5 * 60 * 1000,    // 5 minutes after 4 attempts
    15 * 60 * 1000,   // 15 minutes after 5 attempts
    60 * 60 * 1000,   // 1 hour after 6 attempts
    24 * 60 * 60 * 1000, // 24 hours after 7+ attempts
  ],
};

// Store login attempts in localStorage (in production, use server-side)
const getLoginAttempts = (): Map<string, LoginAttempt> => {
  if (typeof window === 'undefined') return new Map();
  
  const stored = localStorage.getItem('loginAttempts');
  if (!stored) return new Map();
  
  try {
    const data = JSON.parse(stored);
    const map = new Map<string, LoginAttempt>();
    Object.entries(data).forEach(([key, value]) => {
      map.set(key, value as LoginAttempt);
    });
    return map;
  } catch {
    return new Map();
  }
};

const saveLoginAttempts = (attempts: Map<string, LoginAttempt>) => {
  if (typeof window === 'undefined') return;
  
  const data: Record<string, LoginAttempt> = {};
  attempts.forEach((value, key) => {
    data[key] = value;
  });
  localStorage.setItem('loginAttempts', JSON.stringify(data));
};

export const checkRateLimit = (email: string): { allowed: boolean; lockedUntil?: number; message?: string } => {
  const attempts = getLoginAttempts();
  const attempt = attempts.get(email);
  
  if (!attempt) {
    return { allowed: true };
  }
  
  // Check if account is locked
  if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
    const remainingSeconds = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    const remainingHours = Math.ceil(remainingMinutes / 60);
    const remainingDays = Math.ceil(remainingHours / 24);
    
    let message = '';
    if (remainingDays > 0) {
      message = `Account locked. Try again in ${remainingDays} day${remainingDays > 1 ? 's' : ''}.`;
    } else if (remainingHours > 0) {
      message = `Account locked. Try again in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.`;
    } else if (remainingMinutes > 0) {
      message = `Account locked. Try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`;
    } else {
      message = `Account locked. Try again in ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}.`;
    }
    
    return { allowed: false, lockedUntil: attempt.lockedUntil, message };
  }
  
  // Reset if lock expired
  if (attempt.lockedUntil && attempt.lockedUntil <= Date.now()) {
    attempts.delete(email);
    saveLoginAttempts(attempts);
    return { allowed: true };
  }
  
  return { allowed: true };
};

export const recordFailedAttempt = (email: string): { attempts: number; lockedUntil?: number; message?: string } => {
  const attempts = getLoginAttempts();
  const attempt = attempts.get(email) || { email, attempts: 0, lastAttempt: Date.now() };
  
  attempt.attempts += 1;
  attempt.lastAttempt = Date.now();
  
  // Apply penalty if exceeded max attempts
  if (attempt.attempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
    const penaltyIndex = Math.min(
      attempt.attempts - RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
      RATE_LIMIT_CONFIG.PENALTIES.length - 1
    );
    const penalty = RATE_LIMIT_CONFIG.PENALTIES[penaltyIndex];
    attempt.lockedUntil = Date.now() + penalty;
    
    const remainingSeconds = Math.ceil(penalty / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    const remainingHours = Math.ceil(remainingMinutes / 60);
    const remainingDays = Math.ceil(remainingHours / 24);
    
    let message = '';
    if (remainingDays > 0) {
      message = `Too many failed attempts. Account locked for ${remainingDays} day${remainingDays > 1 ? 's' : ''}.`;
    } else if (remainingHours > 0) {
      message = `Too many failed attempts. Account locked for ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.`;
    } else if (remainingMinutes > 0) {
      message = `Too many failed attempts. Account locked for ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`;
    } else {
      message = `Too many failed attempts. Account locked for ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}.`;
    }
    
    attempts.set(email, attempt);
    saveLoginAttempts(attempts);
    
    return { attempts: attempt.attempts, lockedUntil: attempt.lockedUntil, message };
  }
  
  attempts.set(email, attempt);
  saveLoginAttempts(attempts);
  
  const remaining = RATE_LIMIT_CONFIG.MAX_ATTEMPTS - attempt.attempts;
  return {
    attempts: attempt.attempts,
    message: remaining > 0 ? `${remaining} attempt${remaining > 1 ? 's' : ''} remaining before lockout.` : undefined,
  };
};

export const clearFailedAttempts = (email: string) => {
  const attempts = getLoginAttempts();
  attempts.delete(email);
  saveLoginAttempts(attempts);
};

// Mock authentication (replace with real API calls)
export const authenticate = async (
  emailOrPhone: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Check rate limit first
  const rateLimit = checkRateLimit(emailOrPhone);
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.message || 'Account is locked' };
  }
  
  // Mock authentication (replace with real API)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Mock user data
  const mockUsers: Record<string, { password: string; user: User }> = {
    'africatv1@africatv.net': {
      password: 'Africatv.@admin1',
      user: {
        id: '1',
        email: 'africatv1@africatv.net',
        name: 'Admin User',
        role: 'Administrator',
        provider: 'email',
      },
    },
    'user@africatv.com': {
      password: 'user123',
      user: {
        id: '2',
        email: 'user@africatv.com',
        name: 'Regular User',
        role: 'User',
        provider: 'email',
      },
    },
    'malgadi@africatv.com': {
      password: 'mohammedahmedk',
      user: {
        id: '3',
        email: 'malgadi@africatv.com',
        phoneNumber: '0987760808',
        name: 'Malgadi User',
        role: 'User',
        provider: 'email',
      },
    },
    '0987760808': {
      password: 'mohammedahmedk',
      user: {
        id: '3',
        email: 'malgadi@africatv.com',
        phoneNumber: '0987760808',
        name: 'Malgadi User',
        role: 'User',
        provider: 'email',
      },
    },
  };
  
  const userData = mockUsers[emailOrPhone.toLowerCase()];
  
  if (!userData || userData.password !== password) {
    recordFailedAttempt(emailOrPhone);
    return { success: false, error: 'Invalid email/phone or password' };
  }
  
  // Clear failed attempts on success
  clearFailedAttempts(emailOrPhone);
  
  // Store user session
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('isAuthenticated', 'true');
  }
  
  return { success: true, user: userData.user };
};

export const authenticateByPhone = async (
  phoneNumber: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  return authenticate(phoneNumber, password);
};

export const socialAuthenticate = async (
  provider: 'google' | 'facebook' | 'apple' | 'telegram',
  token?: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  // This function is now handled by OAuth flow
  // OAuth redirects are handled via API routes
  // This is kept for backward compatibility but should not be called directly
  return { success: false, error: 'Please use OAuth flow via /api/auth/oauth/[provider]' };
};

export const register = async (
  name: string,
  email: string,
  password: string,
  role: string,
  phone?: string,
  company?: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Mock registration (replace with real API)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }
  
  // Validate password strength
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    role,
    provider: 'email',
  };
  
  // Store user session
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('isAuthenticated', 'true');
  }
  
  return { success: true, user: newUser };
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  // Mock password reset (replace with real API)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Check rate limit
  const rateLimit = checkRateLimit(email);
  if (!rateLimit.allowed) {
    return { success: false, message: rateLimit.message || 'Too many requests. Please try again later.' };
  }
  
  // In production, send email with reset link
  // For now, just return success
  return {
    success: true,
    message: 'Password reset link has been sent to your email. Please check your inbox.',
  };
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  // Mock password reset (replace with real API)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  if (newPassword.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' };
  }
  
  return {
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.',
  };
};

