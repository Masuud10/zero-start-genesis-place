
class CSRFTokenManager {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

  static generateToken(): string {
    const token = this.generateRandomString(32);
    const expiry = Date.now() + this.TOKEN_EXPIRY;
    
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify({ token, expiry }));
    return token;
  }

  static validateToken(token: string): boolean {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (!stored) return false;

      const { token: storedToken, expiry } = JSON.parse(stored);
      
      if (Date.now() > expiry) {
        this.clearToken();
        return false;
      }

      return storedToken === token;
    } catch {
      return false;
    }
  }

  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    return result;
  }
}

export { CSRFTokenManager };
