import { supabase } from '@/integrations/supabase/client';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class TokenManager {
  private static instance: TokenManager;
  private tokenBlacklist = new Set<string>();
  private readonly ACCESS_TOKEN_KEY = 'sb-access-token';
  private readonly REFRESH_TOKEN_KEY = 'sb-refresh-token';
  private readonly TOKEN_EXPIRES_KEY = 'sb-token-expires';

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async rotateTokens(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Token rotation failed:', error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        // Blacklist old tokens
        const oldAccessToken = this.getAccessToken();
        if (oldAccessToken) {
          this.tokenBlacklist.add(oldAccessToken);
        }

        // Store new tokens securely
        this.storeTokens({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: Date.now() + (data.session.expires_in * 1000)
        });

        return { success: true };
      }

      return { success: false, error: 'No session returned' };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Token rotation exception:', error);
      return { success: false, error: err.message };
    }
  }

  private storeTokens(tokens: TokenPair): void {
    // Store in httpOnly-like secure storage (using encrypted localStorage)
    const encryptedData = this.encryptData(JSON.stringify(tokens));
    localStorage.setItem(this.ACCESS_TOKEN_KEY, encryptedData);
  }

  getAccessToken(): string | null {
    try {
      const encryptedData = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      if (!encryptedData) return null;

      const decryptedData = this.decryptData(encryptedData);
      const tokens: TokenPair = JSON.parse(decryptedData);

      // Check if token is blacklisted
      if (this.tokenBlacklist.has(tokens.accessToken)) {
        this.clearTokens();
        return null;
      }

      // Check if token is expired
      if (Date.now() >= tokens.expiresAt) {
        this.rotateTokens();
        return null;
      }

      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  isTokenValid(token: string): boolean {
    return !this.tokenBlacklist.has(token);
  }

  blacklistToken(token: string): void {
    this.tokenBlacklist.add(token);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  private encryptData(data: string): string {
    // Simple XOR encryption for demo - replace with proper encryption in production
    const key = 'edufam-security-key-2024';
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  private decryptData(encryptedData: string): string {
    try {
      const data = atob(encryptedData);
      const key = 'edufam-security-key-2024';
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt token data');
    }
  }
}

export const tokenManager = TokenManager.getInstance();
