
export class CSRFTokenManager {
  private static readonly TOKEN_KEY = 'csrf_token';

  static generateToken(): string {
    const token = crypto.randomUUID();
    sessionStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }

  static getStoredToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getStoredToken();
    return token && storedToken && token === storedToken;
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}
